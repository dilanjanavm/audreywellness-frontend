// src/modules/complaint/ComplaintManagement.js
import React, {useEffect, useState, useCallback} from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Label,
    Input,
    FormGroup,
    Button,
} from "reactstrap";
import {Table, Tag, Tooltip, Select, DatePicker, Statistic} from "antd";
import {Plus, Search, Eye, Edit, AlertTriangle} from "react-feather";
import {ComplaintTableColumns} from "../../common/tableColumns";
import * as complaintService from "../../service/complaintService";
import {useDispatch} from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateComplaintModal from "../../Components/Common/modal/Complaint/CreateComplaintModal";
import ComplaintDetailsModal from "../../Components/Common/modal/Complaint/ComplaintDetailsModal";


const {Option} = Select;
const {RangePicker} = DatePicker;

// Complaint Enums
const COMPLAINT_STATUS = ['open', 'in_progress', 'resolved', 'awaiting_feedback', 'closed', 'reopened'];
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const COMPLAINT_CATEGORIES = ['product_quality', 'delivery_issue', 'billing', 'technical', 'service', 'other'];

const ComplaintManagement = () => {
    document.title = "Complaints | Address Shop";

    const [complaintTableList, setComplaintTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        status: [],
        priority: [],
        category: [],
        startDate: null,
        endDate: null,
    });
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [addingNote, setAddingNote] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadComplaints();
    }, [currentPage, pageSize, filters]);

    // Load complaints with filters
    const loadComplaints = () => {
        setLoading(true);
        popUploader(dispatch, true);

        const apiFilters = {
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            ...filters
        };

        // Clean up filters
        if (apiFilters.status.length === 0) delete apiFilters.status;
        if (apiFilters.priority.length === 0) delete apiFilters.priority;
        if (apiFilters.category.length === 0) delete apiFilters.category;
        if (!apiFilters.startDate) delete apiFilters.startDate;
        if (!apiFilters.endDate) delete apiFilters.endDate;

        complaintService.getAllComplaints(apiFilters)
            .then((res) => {
                const complaintData = res.data?.data || [];
                const formattedData = formatComplaintData(complaintData);

                setComplaintTableList(formattedData);
                setTotalRecords(res.data?.total || 0);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Format complaint data with actions
    const formatComplaintData = (complaintData) => {
        return complaintData.map((complaint) => ({
            key: complaint.id,
            ...complaint,
            action: (
                <div className="d-flex gap-2">
                    <Tooltip title="View Details">
                        <Button
                            size="sm"
                            color="info"
                            outline
                            onClick={() => handleViewComplaint(complaint.id)}
                        >
                            <Eye size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Edit Complaint">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditComplaint(complaint)}
                        >
                            <Edit size={14}/>
                        </Button>
                    </Tooltip>
                </div>
            )
        }));
    };

    // Handle create complaint
    const handleCreateComplaint = async (values) => {
        try {
            setModalLoading(true);
            await complaintService.createComplaint(values);
            customToastMsg('Complaint created successfully', 'success');
            setCreateModalVisible(false);
            loadComplaints();
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle view complaint
    const handleViewComplaint = async (complaintId) => {
        try {
            popUploader(dispatch, true);
            const response = await complaintService.getComplaintById(complaintId);
            setSelectedComplaint(response.data);
            setDetailsModalVisible(true);
            popUploader(dispatch, false);
        } catch (error) {
            popUploader(dispatch, false);
            handleError(error);
        }
    };

    // Handle edit complaint
    const handleEditComplaint = (complaint) => {
        setSelectedComplaint(complaint);
        // You can implement edit modal here
        customToastMsg('Edit feature coming soon', 'info');
    };

    // Handle add note
    const handleAddNote = async (note) => {
        if (!selectedComplaint) return;

        try {
            setAddingNote(true);
            await complaintService.addComplaintNote(selectedComplaint.id, note);
            customToastMsg('Note added successfully', 'success');

            // Refresh complaint details
            const response = await complaintService.getComplaintById(selectedComplaint.id);
            setSelectedComplaint(response.data);
            setAddingNote(false);
        } catch (error) {
            setAddingNote(false);
            handleError(error);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        debouncedLoadComplaints();
    };

    const debouncedLoadComplaints = useCallback(
        debounce(() => {
            loadComplaints();
        }, 500),
        [filters, pageSize]
    );

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setFilters(prev => ({
            ...prev,
            startDate: dates?.[0]?.toISOString(),
            endDate: dates?.[1]?.toISOString()
        }));
        setCurrentPage(1);
    };

    // Handle pagination changes
    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    // Calculate statistics
    const stats = {
        total: totalRecords,
        open: complaintTableList.filter(c => c.status === 'open').length,
        inProgress: complaintTableList.filter(c => c.status === 'in_progress').length,
        resolved: complaintTableList.filter(c => c.status === 'resolved').length,
    };

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Complaint Management</h4>
                </div>

                {/* Statistics Cards */}
                <Row gutter={16} className="mb-4 mt-2">
                    <Col span={6}>
                        <Card className='px-4 py-2'>
                            <Statistic
                                title="Total Complaints"
                                value={stats.total}
                                prefix={<AlertTriangle size={20}/>}
                                valueStyle={{color: '#3f8600'}}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className='px-4 py-2'>
                            <Statistic
                                title="Open Complaints"
                                value={stats.open}
                                prefix={<AlertTriangle size={20}/>}
                                valueStyle={{color: '#1890ff'}}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className='px-4 py-2'>
                            <Statistic
                                title="In Progress"
                                value={stats.inProgress}
                                prefix={<AlertTriangle size={20}/>}
                                valueStyle={{color: '#faad14'}}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className='px-4 py-2'>
                            <Statistic
                                title="Resolved"
                                value={stats.resolved}
                                prefix={<AlertTriangle size={20}/>}
                                valueStyle={{color: '#52c41a'}}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    {/* Search and Filter Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={3}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1"/>
                                    Search Complaints
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by headline or customer"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Status</Label>
                            <Select
                                size='large'
                                mode="multiple"
                                placeholder="Filter by status"
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                                style={{width: '100%'}}
                            >
                                {COMPLAINT_STATUS.map(status => (
                                    <Option key={status} value={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Priority</Label>
                            <Select
                                size='large'
                                mode="multiple"
                                placeholder="Filter by priority"
                                value={filters.priority}
                                onChange={(value) => handleFilterChange('priority', value)}
                                style={{width: '100%'}}
                            >
                                {PRIORITY_LEVELS.map(priority => (
                                    <Option key={priority} value={priority}>
                                        {priority.toUpperCase()}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Category</Label>
                            <Select
                                size='large'
                                mode="multiple"
                                placeholder="Filter by category"
                                value={filters.category}
                                onChange={(value) => handleFilterChange('category', value)}
                                style={{width: '100%'}}
                            >
                                {COMPLAINT_CATEGORIES.map(category => (
                                    <Option key={category} value={category}>
                                        {category.replace('_', ' ').toUpperCase()}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Date Range</Label>
                            <RangePicker
                                size='large'
                                style={{width: '100%'}}
                                onChange={handleDateRangeChange}
                            />
                        </Col>

                        <Col sm={12} md={6} lg={1}>
                            <Label className='opacity-0'>Date Range</Label> <Button

                            color="primary"
                            className="w-100"
                            onClick={() => setCreateModalVisible(true)}
                        >
                            <Plus size={16} className="me-1"/>
                            Add
                        </Button>
                        </Col>
                    </Row>

                    {/* Complaint Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalRecords,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} of ${total} complaints`,
                                    pageSizeOptions: ['10', '25', '50', '100'],
                                    onChange: handlePaginationChange,
                                    onShowSizeChange: handlePaginationChange,
                                }}
                                columns={ComplaintTableColumns}
                                dataSource={complaintTableList}
                                scroll={{x: "max-content"}}
                                loading={loading}
                                locale={{emptyText: "No complaints found"}}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreateComplaintModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateComplaint}
                    loading={modalLoading}
                />

                <ComplaintDetailsModal
                    visible={detailsModalVisible}
                    complaint={selectedComplaint}
                    onClose={() => setDetailsModalVisible(false)}
                    onAddNote={handleAddNote}
                    addingNote={addingNote}
                />
            </Container>
        </div>
    );
};

export default ComplaintManagement;