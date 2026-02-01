// src/modules/complaint/ComplaintManagement.js
import React, { useEffect, useState, useCallback } from "react";
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
import { Table, Tag, Tooltip, Select, DatePicker, Statistic, Tabs, Card as AntCard } from "antd";
import { Plus, Search, Eye, Edit, AlertTriangle } from "react-feather";
import { ComplaintTableColumns } from "../../common/tableColumns";
import * as complaintService from "../../service/complaintService";
import { useDispatch } from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateComplaintModal from "../../Components/Common/modal/Complaint/CreateComplaintModal";
import ComplaintDetailsModal from "../../Components/Common/modal/Complaint/ComplaintDetailsModal";
import UpdateComplaintStatusModal from "../../Components/Common/modal/Complaint/UpdateComplaintStatusModal";
import PermissionWrapper from "../../Components/Common/PermissionWrapper";
import { hasPermission } from "../../helpers/permissionHelper";
import classnames from "classnames";


const { Option } = Select;
const { RangePicker } = DatePicker;

// Complaint Enums
const COMPLAINT_STATUS = ['open', 'in_progress', 'resolved', 'awaiting_feedback', 'closed', 'reopened'];
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const COMPLAINT_CATEGORIES = ['product_quality', 'delivery_issue', 'billing', 'technical', 'service', 'other'];

// Status tabs configuration
const STATUS_TABS = [
    { key: 'all', label: 'All Complaints', status: null },
    { key: 'open', label: 'Open', status: 'open' },
    { key: 'in_progress', label: 'In Progress', status: 'in_progress' },
    { key: 'resolved', label: 'Resolved', status: 'resolved' },
    { key: 'awaiting_feedback', label: 'Awaiting Feedback', status: 'awaiting_feedback' },
    { key: 'closed', label: 'Closed', status: 'closed' },
    { key: 'reopened', label: 'Reopened', status: 'reopened' },
];

const ComplaintManagement = () => {
    document.title = "Complaints | Address Shop";

    const [complaintTableList, setComplaintTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeStatusTab, setActiveStatusTab] = useState('all');
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

    const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusCounts, setStatusCounts] = useState({
        all: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        awaiting_feedback: 0,
        closed: 0,
        reopened: 0,
    });

    const dispatch = useDispatch();

    const loadStatusCounts = async () => {
        try {
            const response = await complaintService.getAllComplaints({ limit: 1000 });
            // API service unwraps response.data, so response.data IS the array of complaints
            const allComplaints = response.data || [];
            const counts = {
                all: allComplaints.length,
                open: allComplaints.filter(c => c.status === 'open').length,
                in_progress: allComplaints.filter(c => c.status === 'in_progress').length,
                resolved: allComplaints.filter(c => c.status === 'resolved').length,
                awaiting_feedback: allComplaints.filter(c => c.status === 'awaiting_feedback').length,
                closed: allComplaints.filter(c => c.status === 'closed').length,
                reopened: allComplaints.filter(c => c.status === 'reopened').length,
            };
            setStatusCounts(counts);
        } catch (error) {
            console.error('Error loading status counts:', error);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, [currentPage, pageSize, filters]);

    // Load status counts separately
    useEffect(() => {
        loadStatusCounts();
    }, []);

    const handleUpdateStatus = async (statusData) => {
        if (!selectedComplaint) return;

        // Permission check
        if (!hasPermission('COMPLAINT_UPDATE')) {
            customToastMsg('You do not have permission to update complaints', 'error');
            return;
        }

        try {
            setStatusUpdateLoading(true);
            await complaintService.updateComplaintStatus(selectedComplaint.id, statusData);
            customToastMsg('Complaint status updated successfully', 'success');
            setUpdateStatusModalVisible(false);

            // Refresh complaints list and details
            loadComplaints();
            loadStatusCounts(); // Refresh counts
            if (detailsModalVisible) {
                const response = await complaintService.getComplaintById(selectedComplaint.id);
                setSelectedComplaint(response.data);
            }
            setStatusUpdateLoading(false);
        } catch (error) {
            setStatusUpdateLoading(false);
            handleError(error);
        }
    };

    // Update the formatComplaintData function to include status update button
    const formatComplaintData = (complaintData) => {
        return complaintData.map((complaint) => ({
            key: complaint.id,
            ...complaint,
            action: (
                <div className="d-flex gap-2">
                    <PermissionWrapper permission="COMPLAINT_VIEW">
                        <Tooltip title="View Details">
                            <Button
                                size="sm"
                                color="info"
                                outline
                                onClick={() => handleViewComplaint(complaint.id)}
                            >
                                <Eye size={14} />
                            </Button>
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper permission="COMPLAINT_UPDATE">
                        <Tooltip title="Update Status">
                            <Button
                                size="sm"
                                color="warning"
                                outline
                                onClick={() => handleUpdateStatusClick(complaint)}
                            >
                                <AlertTriangle size={14} />
                            </Button>
                        </Tooltip>
                    </PermissionWrapper>
                </div>
            )
        }));
    };

    // Add this function to handle status update click
    const handleUpdateStatusClick = (complaint) => {
        setSelectedComplaint(complaint);
        setUpdateStatusModalVisible(true);
    };


    // Handle status tab change
    const handleStatusTabChange = (key) => {
        setActiveStatusTab(key);
        setCurrentPage(1);
        const selectedTab = STATUS_TABS.find(tab => tab.key === key);
        if (selectedTab && selectedTab.status) {
            setFilters(prev => ({
                ...prev,
                status: [selectedTab.status]
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                status: []
            }));
        }
    };

    // Load complaints with filters
    const loadComplaints = (searchOverride) => {
        setLoading(true);
        popUploader(dispatch, true);

        const apiFilters = {
            page: currentPage,
            limit: pageSize,
            search: searchOverride !== undefined ? searchOverride : searchTerm,
            ...filters
        };

        // Note: We do NOT need to manually apply tab status here because handleStatusTabChange
        // already updates 'filters.status' to include the tab status.
        // Overwriting it here was causing additional filters to be ignored.

        // Clean up filters
        if (apiFilters.status && apiFilters.status.length === 0) delete apiFilters.status;
        if (apiFilters.priority && apiFilters.priority.length === 0) delete apiFilters.priority;
        if (apiFilters.category && apiFilters.category.length === 0) delete apiFilters.category;
        if (!apiFilters.startDate) delete apiFilters.startDate;
        if (!apiFilters.endDate) delete apiFilters.endDate;

        complaintService.getAllComplaints(apiFilters)
            .then((res) => {
                const complaintData = res.data || [];
                const formattedData = formatComplaintData(complaintData);

                setComplaintTableList(formattedData);
                // API Service unwraps response, so res.total is available directly not inside data
                setTotalRecords(res.total || 0);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };


    // Handle create complaint
    const handleCreateComplaint = async (values) => {
        // Permission check
        if (!hasPermission('COMPLAINT_CREATE')) {
            customToastMsg('You do not have permission to create complaints', 'error');
            return;
        }
        try {
            setModalLoading(true);
            await complaintService.createComplaint(values);
            customToastMsg('Complaint created successfully', 'success');
            setCreateModalVisible(false);
            loadComplaints();
            loadStatusCounts(); // Refresh counts
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
        debouncedLoadComplaints(value);
    };

    const debouncedLoadComplaints = useCallback(
        debounce((query) => {
            loadComplaints(query);
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
        total: statusCounts.all,
        open: statusCounts.open,
        inProgress: statusCounts.in_progress,
        resolved: statusCounts.resolved,
    };

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Complaint Management</h4>
                </div>



                <UpdateComplaintStatusModal
                    visible={updateStatusModalVisible}
                    complaint={selectedComplaint}
                    onClose={() => setUpdateStatusModalVisible(false)}
                    onUpdateStatus={handleUpdateStatus}
                    loading={statusUpdateLoading}
                />

                {/* Statistics Cards */}
                <Row gutter={16} className="mb-4 mt-2">
                    <Col span={6}>
                        <AntCard className='px-4 py-2'>
                            <Statistic
                                title="Total Complaints"
                                value={stats.total}
                                prefix={<AlertTriangle size={20} />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </AntCard>
                    </Col>
                    <Col span={6}>
                        <AntCard className='px-4 py-2'>
                            <Statistic
                                title="Open Complaints"
                                value={stats.open}
                                prefix={<AlertTriangle size={20} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </AntCard>
                    </Col>
                    <Col span={6}>
                        <AntCard className='px-4 py-2'>
                            <Statistic
                                title="In Progress"
                                value={stats.inProgress}
                                prefix={<AlertTriangle size={20} />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </AntCard>
                    </Col>
                    <Col span={6}>
                        <AntCard className='px-4 py-2'>
                            <Statistic
                                title="Resolved"
                                value={stats.resolved}
                                prefix={<AlertTriangle size={20} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </AntCard>
                    </Col>
                </Row>

                <Card>
                    {/* Status Tabs */}
                    <div className="mt-3 mx-2">
                        <Tabs
                            activeKey={activeStatusTab}
                            onChange={handleStatusTabChange}
                            type="card"
                            size="large"
                            items={STATUS_TABS.map(tab => ({
                                key: tab.key,
                                label: (
                                    <span>
                                        {tab.label}
                                        {tab.status && (
                                            <Tag
                                                color={
                                                    tab.status === 'open' ? 'blue' :
                                                        tab.status === 'in_progress' ? 'orange' :
                                                            tab.status === 'resolved' ? 'green' :
                                                                tab.status === 'closed' ? 'default' :
                                                                    tab.status === 'reopened' ? 'red' : 'purple'
                                                }
                                                style={{ marginLeft: 8 }}
                                            >
                                                {statusCounts[tab.status] || 0}
                                            </Tag>
                                        )}
                                        {!tab.status && (
                                            <Tag color="default" style={{ marginLeft: 8 }}>
                                                {statusCounts.all || 0}
                                            </Tag>
                                        )}
                                    </span>
                                ),
                            }))}
                        />
                    </div>

                    {/* Search and Filter Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={3}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1" />
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
                            <Label>Status (Additional)</Label>
                            <Select
                                size='large'
                                mode="multiple"
                                placeholder="Additional status filter"
                                value={filters.status.filter(s => {
                                    const selectedTab = STATUS_TABS.find(tab => tab.key === activeStatusTab);
                                    return selectedTab && selectedTab.status ? s !== selectedTab.status : true;
                                })}
                                onChange={(value) => {
                                    const selectedTab = STATUS_TABS.find(tab => tab.key === activeStatusTab);
                                    if (selectedTab && selectedTab.status) {
                                        handleFilterChange('status', [selectedTab.status, ...value]);
                                    } else {
                                        handleFilterChange('status', value);
                                    }
                                }}
                                style={{ width: '100%' }}
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
                                style={{ width: '100%' }}
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
                                style={{ width: '100%' }}
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
                                style={{ width: '100%' }}
                                onChange={handleDateRangeChange}
                            />
                        </Col>

                        <Col sm={12} md={6} lg={1}>
                            <Label className='opacity-0'>Date Range</Label>
                            <PermissionWrapper permission="COMPLAINT_CREATE">
                                <Button
                                    color="primary"
                                    className="w-100"
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    <Plus size={16} className="me-1" />
                                    Add
                                </Button>
                            </PermissionWrapper>
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
                                scroll={{ x: "max-content" }}
                                loading={loading}
                                locale={{ emptyText: "No complaints found" }}
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