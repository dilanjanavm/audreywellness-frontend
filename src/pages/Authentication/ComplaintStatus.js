import React, { useState } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Row,
    Button,
    Spinner,
    Alert,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { Link, useLocation } from "react-router-dom";
import { Tag, Space, Card as AntCard, Badge, Divider, Row as AntRow, Col as AntCol, Descriptions, Typography, Collapse, Steps } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ShoppingOutlined,
    UserOutlined,
    PhoneOutlined,
    FileTextOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
    MessageOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as complaintService from "../../service/complaintService";
import addresssLogo from "../../assets/images/logo/Audrey logo.png";
import './ComplaintStatus.scss';

const { Text, Title } = Typography;

const ComplaintStatus = () => {
    document.title = "Complaint Status | Address Shop";

    const [complaintNumber, setComplaintNumber] = useState("");
    const [complaintData, setComplaintData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const location = useLocation();

    // Auto-track if complaint number is provided in navigation state
    React.useEffect(() => {
        if (location.state?.complaintNumber) {
            setComplaintNumber(location.state.complaintNumber);
            // We need to call the API, but handleTrackComplaint expects an event
            // So we'll extract the logic or just call the service directly
            const fetchStatus = async () => {
                setLoading(true);
                setError(null);
                setComplaintData(null);
                try {
                    const resp = await complaintService.getPublicComplaintStatus(location.state.complaintNumber);
                    if (resp?.data?.data || resp?.data) {
                        const data = resp.data?.data || resp.data;
                        setComplaintData(data);
                        setError(null);
                    } else {
                        setError(resp?.message || "Complaint not found. Please check your complaint number.");
                        setComplaintData(null);
                    }
                } catch (err) {
                    console.error("Tracking error:", err);
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to track complaint. Please try again."
                    );
                    setComplaintData(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchStatus();
        }
    }, [location.state]);

    const handleTrackComplaint = async (e) => {
        e.preventDefault();

        if (!complaintNumber.trim()) {
            setError("Please enter a complaint number");
            return;
        }

        setLoading(true);
        setError(null);
        setComplaintData(null);

        try {
            const resp = await complaintService.getPublicComplaintStatus(complaintNumber.trim());

            if (resp?.data?.data || resp?.data) {
                const data = resp.data?.data || resp.data;
                setComplaintData(data);
                setError(null);
            } else {
                setError(resp?.message || "Complaint not found. Please check your complaint number.");
                setComplaintData(null);
            }
        } catch (err) {
            console.error("Tracking error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to track complaint. Please try again."
            );
            setComplaintData(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'completed':
                return 'green';
            case 'in_progress':
            case 'ongoing':
                return 'blue';
            case 'investigating':
            case 'review':
                return 'orange';
            case 'pending':
            case 'open':
                return 'default';
            case 'rejected':
            case 'failed':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'completed':
                return 'Resolved';
            case 'in_progress':
            case 'ongoing':
                return 'In Progress';
            case 'investigating':
            case 'review':
                return 'Investigating';
            case 'pending':
            case 'open':
                return 'Pending';
            case 'rejected':
            case 'failed':
                return 'Rejected';
            default:
                return status || 'Unknown';
        }
    };

    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="complaint-status-page">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-3 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={addresssLogo} alt="" height="100" />
                                        </Link>
                                    </div>
                                    <p className="mt-3 text-primary fs-15 fw-medium text-white">
                                        Track Your Complaint
                                    </p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={12} lg={10} xl={9}>
                                <Card className="track-search-card">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-1 mb-4">
                                            <h2 className="text-primary mb-2">Track Your Complaint</h2>
                                            <p className="text-muted mb-0">
                                                Enter your complaint number to see the current status
                                            </p>
                                        </div>

                                        <form onSubmit={handleTrackComplaint}>
                                            <div className="mb-4">
                                                <Label htmlFor="complaintNumber" className="form-label fw-semibold mb-2">
                                                    Complaint Number
                                                </Label>
                                                <div className="d-flex gap-2">
                                                    <Input
                                                        id="complaintNumber"
                                                        name="complaintNumber"
                                                        className="form-control form-control-lg"
                                                        placeholder="Enter your complaint number (e.g., CMP-2025-001)"
                                                        type="text"
                                                        value={complaintNumber}
                                                        onChange={(e) => {
                                                            setComplaintNumber(e.target.value);
                                                            setError(null);
                                                        }}
                                                        disabled={loading}
                                                        style={{ fontSize: '16px', borderRadius: '8px' }}
                                                    />
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        disabled={loading || !complaintNumber.trim()}
                                                        className="px-4"
                                                        size="lg"
                                                        style={{ borderRadius: '8px', minWidth: '160px' }}
                                                    >
                                                        {loading ? (
                                                            <Spinner size="sm" className="me-2">
                                                                Loading...
                                                            </Spinner>
                                                        ) : null}
                                                        Check Status
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>

                                        {error && (
                                            <Alert color="danger" className="mt-3" style={{ borderRadius: '8px' }}>
                                                <strong>Error:</strong> {error}
                                            </Alert>
                                        )}
                                    </CardBody>
                                </Card>

                                {complaintData && (
                                    <div className="tracking-results-container" style={{ marginTop: '24px' }}>
                                        {/* Complaint Status Card */}
                                        <AntCard
                                            className="tracking-summary-card"
                                            style={{ borderRadius: '12px', border: 'none', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                                                <div>
                                                    <h4 className="mb-1" style={{ fontWeight: 600, color: '#262626', fontSize: '20px' }}>
                                                        Complaint Status
                                                    </h4>
                                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                                        Complaint Number: <strong style={{ color: '#1890ff' }}>{complaintData.complaintNumber || complaintData.code}</strong>
                                                    </p>
                                                </div>
                                                <Badge
                                                    status={['resolved', 'completed'].includes(complaintData.status?.toLowerCase()) ? "success" : ['ongoing', 'in_progress'].includes(complaintData.status?.toLowerCase()) ? "processing" : "default"}
                                                    text={
                                                        <span style={{
                                                            fontSize: '15px',
                                                            fontWeight: 600,
                                                            color: getStatusColor(complaintData.status)
                                                        }}>
                                                            {getStatusLabel(complaintData.status)}
                                                        </span>
                                                    }
                                                />
                                            </div>

                                            <Divider style={{ margin: '16px 0' }} />

                                            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small" colon={false}>
                                                <Descriptions.Item label={
                                                    <Space>
                                                        <FileTextOutlined />
                                                        <span>Subject</span>
                                                    </Space>
                                                }>
                                                    <Text strong>{complaintData.headline || complaintData.subject || complaintData.title || 'N/A'}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={
                                                    <Space>
                                                        <ExclamationCircleOutlined />
                                                        <span>Type</span>
                                                    </Space>
                                                }>
                                                    <Tag color="cyan">{complaintData.category || complaintData.type || 'General'}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>Created Date</span>
                                                    </Space>
                                                }>
                                                    <Text>{complaintData.createdAt ? dayjs(complaintData.createdAt).format('MMM DD, YYYY') : 'N/A'}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>Last Updated</span>
                                                    </Space>
                                                }>
                                                    <Text>{complaintData.updatedAt ? dayjs(complaintData.updatedAt).format('MMM DD, YYYY') : 'N/A'}</Text>
                                                </Descriptions.Item>
                                            </Descriptions>

                                            {complaintData.description && (
                                                <div className="mt-4">
                                                    <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#595959', marginBottom: '8px' }}>
                                                        <Space>
                                                            <MessageOutlined />
                                                            Description
                                                        </Space>
                                                    </h5>
                                                    <div
                                                        style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', color: '#595959' }}
                                                        dangerouslySetInnerHTML={{ __html: complaintData.description }}
                                                    />
                                                </div>
                                            )}
                                        </AntCard>

                                        {/* Customer Information Card */}
                                        {complaintData.customer && (
                                            <AntCard
                                                className="tracking-summary-card"
                                                style={{ borderRadius: '12px', border: 'none', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                            >
                                                <div className="mb-3">
                                                    <h5 style={{ fontWeight: 600, color: '#262626', fontSize: '18px', marginBottom: '16px' }}>
                                                        <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                                        Customer Information
                                                    </h5>
                                                </div>

                                                <Descriptions column={1} size="small" colon={false}>
                                                    {complaintData.customer.name && (
                                                        <Descriptions.Item label={
                                                            <Space>
                                                                <UserOutlined />
                                                                <span>Name</span>
                                                            </Space>
                                                        }>
                                                            <Text strong>{complaintData.customer.name}</Text>
                                                        </Descriptions.Item>
                                                    )}
                                                    {complaintData.customer.phone && (
                                                        <Descriptions.Item label={
                                                            <Space>
                                                                <PhoneOutlined />
                                                                <span>Mobile</span>
                                                            </Space>
                                                        }>
                                                            <Text strong>{complaintData.customer.phone}</Text>
                                                        </Descriptions.Item>
                                                    )}
                                                    {complaintData.customer.branchName && (
                                                        <Descriptions.Item label={
                                                            <Space>
                                                                <ShoppingOutlined />
                                                                <span>Branch</span>
                                                            </Space>
                                                        }>
                                                            <Text strong>{complaintData.customer.branchName}</Text>
                                                        </Descriptions.Item>
                                                    )}
                                                </Descriptions>
                                            </AntCard>
                                        )}

                                        {/* Status Timeline */}
                                        <AntCard
                                            className="tracking-timeline-card"
                                            style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                            bodyStyle={{ padding: '0px' }}
                                        >
                                            <Collapse
                                                defaultActiveKey={['1']}
                                                ghost
                                                expandIconPosition="end"
                                                style={{ backgroundColor: 'white', borderRadius: '12px' }}
                                            >
                                                <Collapse.Panel
                                                    header={
                                                        <div className="d-flex align-items-center">
                                                            <ClockCircleOutlined style={{ marginRight: 10, color: '#1890ff', fontSize: '18px' }} />
                                                            <span style={{ fontWeight: 600, fontSize: '16px', color: '#262626' }}>Complaint Timeline</span>
                                                        </div>
                                                    }
                                                    key="1"
                                                >
                                                    <div style={{ padding: '0 24px 24px 24px' }}>
                                                        <Steps
                                                            direction="vertical"
                                                            current={0}
                                                            items={complaintData.timelineEntries?.map((entry) => ({
                                                                title: (
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <Text strong style={{ textTransform: 'capitalize' }}>
                                                                            {entry.entryType?.replace(/_/g, ' ')}
                                                                        </Text>
                                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                            {dayjs(entry.createdAt).format('MMM DD, YYYY h:mm A')}
                                                                        </Text>
                                                                    </div>
                                                                ),
                                                                description: (
                                                                    <div>
                                                                        <div className="text-secondary mb-1">{entry.description}</div>
                                                                        {entry.createdBy?.email && (
                                                                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                                                Updated by: {entry.createdBy.email}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                                status: 'finish',
                                                                icon: (
                                                                    <div style={{
                                                                        marginTop: '4px',
                                                                        backgroundColor: '#e6f7ff',
                                                                        padding: '4px',
                                                                        borderRadius: '50%',
                                                                        border: '1px solid #91d5ff'
                                                                    }}>
                                                                        {entry.entryType === 'status_change' ? <CheckCircleOutlined style={{ color: '#1890ff' }} /> :
                                                                            entry.entryType === 'note_added' ? <FileTextOutlined style={{ color: '#1890ff' }} /> :
                                                                                entry.entryType === 'sms_sent' ? <MessageOutlined style={{ color: '#1890ff' }} /> :
                                                                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />}
                                                                    </div>
                                                                )
                                                            })) || []}
                                                        />
                                                    </div>
                                                </Collapse.Panel>
                                            </Collapse>
                                        </AntCard>
                                    </div>
                                )}

                                {!complaintData && !loading && !error && (
                                    <Card className="track-search-card mt-3">
                                        <CardBody>
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <ExclamationCircleOutlined
                                                        style={{ fontSize: "64px", color: "#d9d9d9" }}
                                                    />
                                                </div>
                                                <p className="text-muted" style={{ fontSize: '16px' }}>
                                                    Enter your complaint number above to view status
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default ComplaintStatus;
