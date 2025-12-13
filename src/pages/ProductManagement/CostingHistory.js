import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    message,
    Spin,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Descriptions,
    Modal,
    Timeline,
    Badge,
} from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    DollarOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import * as costingService from '../../service/costingService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';

const { Title, Text } = Typography;

const CostingHistory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const itemId = location.state?.itemId;
    
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState(null);
    const [selectedCosting, setSelectedCosting] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        if (itemId) {
            loadHistory();
        } else {
            message.warning('No item selected');
            navigate('/costed-products');
        }
    }, [itemId, pagination.current, pagination.pageSize]);

    const loadHistory = async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const response = await costingService.getProductCostHistory(itemId);
            if (response.success && response.data) {
                setHistoryData(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.history?.length || 0,
                }));
            } else if (response.data) {
                setHistoryData(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.history?.length || 0,
                }));
            } else {
                message.error('Failed to load cost history');
            }
        } catch (error) {
            message.error('Failed to load cost history');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (costing) => {
        setSelectedCosting(costing);
        setViewModalVisible(true);
    };

    const columns = [
        {
            title: 'Version',
            dataIndex: ['costing', 'version'],
            key: 'version',
            width: 100,
            render: (version) => <Tag color="blue">v{version}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive) => (
                <Badge
                    status={isActive ? 'success' : 'default'}
                    text={isActive ? 'Active' : 'Inactive'}
                />
            ),
        },
        {
            title: 'Total Raw Material Cost',
            dataIndex: ['costing', 'totalRawMaterialCost'],
            key: 'totalRawMaterialCost',
            width: 180,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
        },
        {
            title: 'Total Additional Cost',
            dataIndex: ['costing', 'totalAdditionalCost'],
            key: 'totalAdditionalCost',
            width: 180,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
        },
        {
            title: 'Cost Changes',
            dataIndex: 'costChanges',
            key: 'costChanges',
            width: 200,
            render: (changes) => {
                if (!changes || changes.length === 0) return <Text type="secondary">No changes</Text>;
                return (
                    <Space direction="vertical" size="small">
                        {changes.slice(0, 2).map((change, idx) => (
                            <Text key={idx} type={change.costDifference > 0 ? 'danger' : 'success'}>
                                {change.batchSize}: {change.costDifference > 0 ? '+' : ''}${change.costDifference.toFixed(2)}
                            </Text>
                        ))}
                        {changes.length > 2 && <Text type="secondary">+{changes.length - 2} more</Text>}
                    </Space>
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(record.costing)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <BreadCrumb title="Cost History" pageTitle="Product Management" />
                    </Col>
                </Row>

                <Card>
                    <Row className="mb-4">
                        <Col>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/costed-products')}
                            >
                                Back to Costed Products
                            </Button>
                        </Col>
                    </Row>

                    {historyData && (
                        <>
                            <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                                <Descriptions.Item label="Item Code">
                                    {historyData.itemCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Item Name">
                                    {historyData.itemName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Total Versions">
                                    {historyData.totalVersions}
                                </Descriptions.Item>
                                <Descriptions.Item label="Current Active Version">
                                    <Tag color="green">v{historyData.currentActiveVersion}</Tag>
                                </Descriptions.Item>
                            </Descriptions>

                            <Title level={5}>Version History</Title>
                            <Table
                                columns={columns}
                                dataSource={historyData.history || []}
                                loading={loading}
                                rowKey={(record) => record.costing?.id || record.version}
                                pagination={{
                                    ...pagination,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} versions`,
                                }}
                                onChange={(newPagination) => {
                                    setPagination({
                                        current: newPagination.current,
                                        pageSize: newPagination.pageSize,
                                        total: pagination.total,
                                    });
                                }}
                            />
                        </>
                    )}

                    {!historyData && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text type="secondary">No cost history available</Text>
                        </div>
                    )}
                </Card>

                {/* View Modal */}
                <Modal
                    title="Costing Details"
                    open={viewModalVisible}
                    onCancel={() => setViewModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setViewModalVisible(false)}>
                            Close
                        </Button>,
                    ]}
                    width={800}
                >
                    {selectedCosting && (
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Version">
                                <Tag color="blue">v{selectedCosting.version}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge
                                    status={selectedCosting.isActive ? 'success' : 'default'}
                                    text={selectedCosting.isActive ? 'Active' : 'Inactive'}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Item Code" span={2}>
                                {selectedCosting.itemCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Item Name" span={2}>
                                {selectedCosting.itemName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Raw Material Cost">
                                ${parseFloat(selectedCosting.totalRawMaterialCost || 0).toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Additional Cost">
                                ${parseFloat(selectedCosting.totalAdditionalCost || 0).toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Percentage">
                                {selectedCosting.totalPercentage || 0}%
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {selectedCosting.createdAt ? new Date(selectedCosting.createdAt).toLocaleString() : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Updated At">
                                {selectedCosting.updatedAt ? new Date(selectedCosting.updatedAt).toLocaleString() : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>
            </Container>
        </div>
    );
};

export default CostingHistory;

