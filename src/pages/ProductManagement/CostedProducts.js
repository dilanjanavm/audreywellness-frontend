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
    Input,
    Select,
    Tooltip,
    Badge,
} from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    DollarOutlined,
    SearchOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as costingService from '../../service/costingService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const CostedProducts = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        category: '',
    });

    useEffect(() => {
        loadCostedProducts();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadCostedProducts = async () => {
        setLoading(true);
        try {
            const response = await costingService.getCostedProducts({
                page: pagination.current,
                limit: pagination.pageSize,
                search: filters.search || undefined,
                category: filters.category || undefined,
            });

            if (response.success && response.data) {
                const data = response.data.data || response.data;
                setProducts(Array.isArray(data) ? data : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || data.length || 0,
                }));
            } else if (response.data) {
                const data = response.data.data || response.data;
                setProducts(Array.isArray(data) ? data : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || data.length || 0,
                }));
            } else {
                setProducts([]);
            }
        } catch (error) {
            message.error('Failed to load costed products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = (itemId) => {
        navigate('/costing-history', { state: { itemId } });
    };

    const handleViewCosting = (record) => {
        navigate('/costed-product-view', { state: { product: record } });
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: pagination.total,
        });
    };

    const columns = [
        {
            title: 'Item Code',
            dataIndex: 'itemCode',
            key: 'itemCode',
            width: 150,
            sorter: true,
        },
        {
            title: 'Item Name',
            dataIndex: 'itemName',
            key: 'itemName',
            width: 200,
            sorter: true,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            render: (category) => category ? <Tag>{category}</Tag> : '-',
        },
        {
            title: 'Units',
            dataIndex: 'units',
            key: 'units',
            width: 100,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price, record) => {
                const currency = record.currency || '$';
                return price ? `${currency}${parseFloat(price).toFixed(2)}` : '-';
            },
        },
        {
            title: 'Active Costing',
            dataIndex: 'hasActiveCosting',
            key: 'hasActiveCosting',
            width: 130,
            render: (hasActive) => (
                <Badge
                    status={hasActive ? 'success' : 'default'}
                    text={hasActive ? 'Yes' : 'No'}
                />
            ),
        },
        {
            title: 'Active Version',
            dataIndex: 'activeCostingVersion',
            key: 'activeCostingVersion',
            width: 130,
            render: (version) => version ? <Tag color="blue">v{version}</Tag> : '-',
        },
        {
            title: 'Total Versions',
            dataIndex: 'totalCostingVersions',
            key: 'totalCostingVersions',
            width: 130,
            render: (total) => total || 0,
        },
        {
            title: 'Last Updated',
            dataIndex: 'lastCostUpdate',
            key: 'lastCostUpdate',
            width: 180,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Costings">
                        <Button
                            type="link"
                            icon={<DollarOutlined />}
                            onClick={() => handleViewCosting(record)}
                        >
                            Costings
                        </Button>
                    </Tooltip>
                    <Tooltip title="View History">
                        <Button
                            type="link"
                            icon={<HistoryOutlined />}
                            onClick={() => handleViewHistory(record.itemId)}
                        >
                            History
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <BreadCrumb title="Costed Products" pageTitle="Product Management" />
                    </Col>
                </Row>

                <Card>
                    <Row gutter={16} className="mb-4">
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Search by item code or name"
                                allowClear
                                enterButton={<SearchOutlined />}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onSearch={() => {
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                    loadCostedProducts();
                                }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder="Filter by category"
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                onPressEnter={() => {
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                    loadCostedProducts();
                                }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadCostedProducts}
                            >
                                Refresh
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={products}
                        loading={loading}
                        rowKey="itemId"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} products`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1400 }}
                    />
                </Card>
            </Container>
        </div>
    );
};

export default CostedProducts;

