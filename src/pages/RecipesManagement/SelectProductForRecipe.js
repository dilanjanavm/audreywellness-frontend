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
    Input,
} from 'antd';
import {
    ReloadOutlined,
    ArrowRightOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as recipeService from '../../service/recipeService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';

const { Title, Text } = Typography;
const { Search } = Input;

const SelectProductForRecipe = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCostedProducts();
    }, [pagination.current, pagination.pageSize, searchTerm]);

    const loadCostedProducts = async () => {
        setLoading(true);
        try {
            const response = await recipeService.getCostedProductsForRecipe({
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchTerm,
            });

            if (response && response.data) {
                const data = response.data.data || response.data || [];
                setProducts(Array.isArray(data) ? data : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || data.length || 0,
                }));
            }
        } catch (error) {
            message.error('Failed to load costed products');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        navigate('/recipes/create', { state: { productId: product.itemId } });
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const columns = [
        {
            title: 'Item Code',
            dataIndex: 'itemCode',
            key: 'itemCode',
        },
        {
            title: 'Item Name',
            dataIndex: 'itemName',
            key: 'itemName',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Has Active Costing',
            dataIndex: 'hasActiveCosting',
            key: 'hasActiveCosting',
            render: (hasActive) => (
                <Text type={hasActive ? 'success' : 'secondary'}>
                    {hasActive ? 'Yes' : 'No'}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => handleSelectProduct(record)}
                    disabled={!record.hasActiveCosting}
                >
                    Create Recipe
                </Button>
            ),
        },
    ];

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Select Product for Recipe" pageTitle="Recipes" />
                    <Card>
                        <Row gutter={[16, 16]} className="mb-3">
                            <Col xs={24} sm={12} md={8}>
                                <Search
                                    placeholder="Search products..."
                                    allowClear
                                    enterButton={<SearchOutlined />}
                                    size="large"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onSearch={loadCostedProducts}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={16} className="text-end">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={loadCostedProducts}
                                    loading={loading}
                                >
                                    Refresh
                                </Button>
                            </Col>
                        </Row>

                        <Table
                            columns={columns}
                            dataSource={products}
                            rowKey="itemId"
                            loading={loading}
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} products`,
                            }}
                            onChange={handleTableChange}
                        />
                    </Card>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default SelectProductForRecipe;

