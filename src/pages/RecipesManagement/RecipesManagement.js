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
    Popconfirm,
    Tooltip,
    Badge,
} from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import * as recipeService from '../../service/recipeService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';
import dayjs from 'dayjs';
import PermissionWrapper from '../../Components/Common/PermissionWrapper';
import { hasPermission } from '../../helpers/permissionHelper';

const { Title, Text } = Typography;
const { Search } = Input;

const RecipesManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('view-all');

    useEffect(() => {
        // Set active tab based on current route
        if (location.pathname === '/recipes-management') {
            setActiveTab('view-all');
        } else if (location.pathname === '/recipes/select-product' || location.pathname === '/recipes/create') {
            setActiveTab('create');
        }
    }, [location.pathname]);

    useEffect(() => {
        if (activeTab === 'view-all') {
            loadRecipes();
        }
    }, [pagination.current, pagination.pageSize, searchTerm, activeTab]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const response = await recipeService.getAllRecipes({
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchTerm,
            });

            if (response && response.data) {
                const data = response.data.data || response.data || [];
                setRecipes(data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || data.length,
                }));
            }
        } catch (error) {
            message.error('Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recipeId) => {
        if (!hasPermission('RECIPE_DELETE')) {
            message.error('You do not have permission to delete recipes');
            return;
        }
        try {
            await recipeService.deleteRecipe(recipeId);
            message.success('Recipe deleted successfully');
            loadRecipes();
        } catch (error) {
            message.error('Failed to delete recipe');
        }
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
            title: 'Recipe Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Text strong>{text || record.recipeName || 'Untitled Recipe'}</Text>
            ),
        },
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Text>{text || record.itemName || record.product?.itemName || '-'}</Text>
            ),
        },
        {
            title: 'Batch Size',
            dataIndex: 'batchSize',
            key: 'batchSize',
            render: (text) => <Tag color="blue">{text || '-'}</Tag>,
        },
        {
            title: 'Total Steps',
            dataIndex: 'steps',
            key: 'steps',
            render: (steps) => (
                <Text>{Array.isArray(steps) ? steps.length : steps || 0}</Text>
            ),
        },
        {
            title: 'Total Time',
            dataIndex: 'totalTime',
            key: 'totalTime',
            render: (time) => (
                <Text>{time ? `${time} min` : '-'}</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colorMap = {
                    active: 'green',
                    draft: 'orange',
                    archived: 'default',
                };
                return (
                    <Tag color={colorMap[status] || 'default'}>
                        {(status || 'draft').toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Versions',
            dataIndex: 'countOfVersions',
            key: 'countOfVersions',
            align: 'center',
            render: (count, record) => {
                const versionCount = count || record.countOfVersions || 0;
                return (
                    <Badge
                        count={versionCount}
                        showZero
                        style={{
                            backgroundColor: versionCount > 1 ? '#458533' : '#d9d9d9',
                        }}
                        overflowCount={999}
                    />
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Text>{date ? dayjs(date).format('MMM DD, YYYY') : '-'}</Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <PermissionWrapper permission="RECIPE_VIEW">
                        <Tooltip title="View Recipe">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/recipes/view/${record.id || record._id}`)}
                            />
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper permission="RECIPE_UPDATE">
                        <Tooltip title="Edit Recipe">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/recipes/edit/${record.id || record._id}`)}
                            />
                        </Tooltip>
                    </PermissionWrapper>
                    <PermissionWrapper permission="RECIPE_DELETE">
                        <Popconfirm
                            title="Delete Recipe"
                            description="Are you sure you want to delete this recipe?"
                            onConfirm={() => handleDelete(record.id || record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Delete Recipe">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </PermissionWrapper>
                </Space>
            ),
        },
    ];

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Recipes Management" pageTitle="Recipes" />

                    {/* Sub Navigation */}
                    <Card
                        style={{
                            marginBottom: '20px',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        bodyStyle={{ padding: '12px 20px' }}
                    >
                        <Row gutter={16} align="middle">
                            <Col flex="auto">
                                <Space size="large">
                                    <PermissionWrapper permission="RECIPE_VIEW">
                                        <Button
                                            type={activeTab === 'view-all' ? 'primary' : 'text'}
                                            icon={<UnorderedListOutlined />}
                                            onClick={() => {
                                                setActiveTab('view-all');
                                                navigate('/recipes-management');
                                            }}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: activeTab === 'view-all' ? 500 : 400,
                                            }}
                                        >
                                            View All Recipes
                                        </Button>
                                    </PermissionWrapper>
                                    <PermissionWrapper permission="RECIPE_CREATE">
                                        <Button
                                            type={activeTab === 'create' ? 'primary' : 'text'}
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                setActiveTab('create');
                                                navigate('/recipes/select-product');
                                            }}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: activeTab === 'create' ? 500 : 400,
                                            }}
                                        >
                                            Create Recipe
                                        </Button>
                                    </PermissionWrapper>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Row>
                        <Col xs={24}>
                            <Card>
                                <Row gutter={[16, 16]} className="mb-3">
                                    <Col xs={24} sm={12} md={8}>
                                        <Search
                                            placeholder="Search recipes..."
                                            allowClear
                                            enterButton={<SearchOutlined />}
                                            size="large"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onSearch={loadRecipes}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={16} className="text-end">
                                        <Space>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={loadRecipes}
                                                loading={loading}
                                            >
                                                Refresh
                                            </Button>
                                            <PermissionWrapper permission="RECIPE_CREATE">
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => navigate('/recipes/select-product')}
                                                >
                                                    Create Recipe
                                                </Button>
                                            </PermissionWrapper>
                                        </Space>
                                    </Col>
                                </Row>

                                <Table
                                    columns={columns}
                                    dataSource={recipes}
                                    rowKey={(record) => record.id || record._id}
                                    loading={loading}
                                    pagination={{
                                        ...pagination,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} recipes`,
                                    }}
                                    onChange={handleTableChange}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default RecipesManagement;

