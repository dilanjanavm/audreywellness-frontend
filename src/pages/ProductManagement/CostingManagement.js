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
    Popconfirm,
    Tooltip,
    Input,
    Select,
    Modal,
    Descriptions,
    Divider,
    Badge,
} from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    DollarOutlined,
    HistoryOutlined,
    SwapOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as costingService from '../../service/costingService';
import * as itemService from '../../service/itemService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';
import CostingComparison from './CostingComparison';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const CostingManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [costings, setCostings] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCosting, setSelectedCosting] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [compareModalVisible, setCompareModalVisible] = useState(false);
    const [compareCosting1, setCompareCosting1] = useState(null);
    const [compareCosting2, setCompareCosting2] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        itemId: null,
    });

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        if (selectedItem) {
            loadCostings();
        }
    }, [selectedItem, pagination.current, pagination.pageSize]);

    const loadItems = async () => {
        try {
            const response = await itemService.getAllItems(1, 100);
            console.log(response);
            
            if (response.statusCode ===200 && response.data) {
                setItems(response.data || []);
            }
        } catch (error) {
            message.error('Failed to load items');
        }
    };

    const loadCostings = async () => {
        if (!selectedItem) return;
        setLoading(true);
        try {
            const response = await costingService.getCostingsByItem(selectedItem);
            if (response.success && response.data) {
                const costingsList = Array.isArray(response.data) ? response.data : [response.data];
                setCostings(costingsList);
                setPagination(prev => ({ ...prev, total: costingsList.length }));
            } else {
                setCostings([]);
            }
        } catch (error) {
            message.error('Failed to load costings');
            setCostings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (costing) => {
        setSelectedCosting(costing);
        setViewModalVisible(true);
    };

    const handleCompare = (costing) => {
        setCompareCosting1(costing);
        setCompareModalVisible(true);
    };

    const handleSetActive = async (costingId) => {
        try {
            const response = await costingService.setCostingActive(costingId);
            if (response.success || response.data) {
                message.success('Costing set as active successfully');
                loadCostings();
            } else {
                message.error(response.message || 'Failed to set costing as active');
            }
        } catch (error) {
            message.error('Failed to set costing as active');
        }
    };

    const handleDelete = async (costingId) => {
        try {
            const response = await costingService.deleteCosting(costingId);
            if (response.success || !response.error) {
                message.success('Costing deleted successfully');
                loadCostings();
            } else {
                message.error(response.message || 'Failed to delete costing');
            }
        } catch (error) {
            message.error('Failed to delete costing');
        }
    };

    const handleRecalculate = async (costingId) => {
        try {
            const response = await costingService.recalculateCosting(costingId);
            if (response.success || response.data) {
                message.success('Costing recalculated successfully');
                loadCostings();
            } else {
                message.error(response.message || 'Failed to recalculate costing');
            }
        } catch (error) {
            message.error('Failed to recalculate costing');
        }
    };

    const handleViewHistory = (itemId) => {
        navigate('/costing-history', { state: { itemId } });
    };

    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
            width: 100,
            render: (version) => <Tag color="blue">v{version}</Tag>,
        },
        {
            title: 'Item Code',
            dataIndex: 'itemCode',
            key: 'itemCode',
            width: 150,
        },
        {
            title: 'Item Name',
            dataIndex: 'itemName',
            key: 'itemName',
            width: 200,
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
            dataIndex: 'totalRawMaterialCost',
            key: 'totalRawMaterialCost',
            width: 180,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
        },
        {
            title: 'Total Additional Cost',
            dataIndex: 'totalAdditionalCost',
            key: 'totalAdditionalCost',
            width: 180,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
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
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Compare">
                        <Button
                            type="link"
                            icon={<SwapOutlined />}
                            onClick={() => handleCompare(record)}
                        />
                    </Tooltip>
                    {!record.isActive && (
                        <Tooltip title="Set as Active">
                            <Popconfirm
                                title="Set this costing as active?"
                                onConfirm={() => handleSetActive(record.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    type="link"
                                    icon={<CheckCircleOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <Tooltip title="Recalculate">
                        <Popconfirm
                            title="Recalculate with current prices?"
                            onConfirm={() => handleRecalculate(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                    {!record.isActive && (
                        <Tooltip title="Delete">
                            <Popconfirm
                                title="Delete this costing?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Yes"
                                cancelText="No"
                                okType="danger"
                            >
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <BreadCrumb title="Costing Management" pageTitle="Product Management" />
                    </Col>
                </Row>

                <Card>
                    <Row gutter={16} className="mb-4">
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Select Item"
                                style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="children"
                                value={selectedItem}
                                onChange={(value) => {
                                    setSelectedItem(value);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {items.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.itemCode} - {item.description || item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/product-cost-calculate', { state: { itemId: selectedItem } })}
                                disabled={!selectedItem}
                            >
                                Create New Costing
                            </Button>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                icon={<HistoryOutlined />}
                                onClick={() => selectedItem && handleViewHistory(selectedItem)}
                                disabled={!selectedItem}
                            >
                                View History
                            </Button>
                        </Col>
                    </Row>

                    {selectedItem && (
                        <Table
                            columns={columns}
                            dataSource={costings}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} costings`,
                            }}
                            scroll={{ x: 1200 }}
                        />
                    )}

                    {!selectedItem && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text type="secondary">Please select an item to view costings</Text>
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

                {/* Compare Modal */}
                <CostingComparison
                    visible={compareModalVisible}
                    onCancel={() => {
                        setCompareModalVisible(false);
                        setCompareCosting1(null);
                        setCompareCosting2(null);
                    }}
                    costing1={compareCosting1}
                    costing2={compareCosting2}
                    onSelectCosting2={(costing) => {
                        setCompareCosting2(costing);
                    }}
                    availableCostings={costings.filter(c => c.id !== compareCosting1?.id)}
                />
            </Container>
        </div>
    );
};

export default CostingManagement;

