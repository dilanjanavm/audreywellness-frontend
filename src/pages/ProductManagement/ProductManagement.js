import React, {useEffect, useState} from "react";
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
    Statistic,
    Popconfirm,
    Tooltip
} from "antd";
import {
    ShoppingOutlined,
    ReloadOutlined,
    TagOutlined,
    FileTextOutlined,
    EditOutlined,
    PlusOutlined,
    EyeOutlined,
    DollarOutlined
} from '@ant-design/icons';
import * as categoryService from "../../service/categoryService";
import * as itemService from "../../service/itemService";
import {ItemCoastTableColumns} from "../../common/tableColumns";
import {useNavigate} from "react-router-dom";

const {Title, Text} = Typography;

const ProductManagement = () => {
    const [categories, setCategories] = useState([]);
    const [categoryItems, setCategoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const navigate = useNavigate();
    // Load all categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);


    const handleCreateCost = (item) => {
        // Navigate to cost calculation page with item data
        navigate('/product-cost-calculate', {
            state: { item: item }
        });
    };
    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAllCategories();
            const categoriesData = response.data?.data.data || [];
            setCategories(categoriesData);
            console.log(categoriesData);

            // Filter out 'Raw Material' category (case-insensitive) and extract UUIDs
            const categoryUuids = categoriesData
                .filter(category =>
                    !category.categoryName ||
                    category.categoryName.toLowerCase() !== 'raw material'
                )
                .map(category => category.id);

            setSelectedCategoryIds(categoryUuids);

            const excludedCount = categoriesData.length - categoryUuids.length;
         } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const loadItemsByCategoryIds = async (categoryIds) => {
        try {
            setItemsLoading(true);
            const response = await itemService.findByCategoryIds({categoryIds});
            const itemsData = response.data?.data || [];

            const itemsWithActions = itemsData.map(item => ({
                ...item,
                action: (
                    <Space size="small">
                        <Tooltip title="Create Cost">
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleCreateCost(item)}
                                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                            >
                                Create Cost
                            </Button>
                        </Tooltip>
                        {/* Keep other buttons if needed */}
                    </Space>
                )
            }));

            setCategoryItems(itemsWithActions);
            message.success(`Found ${itemsData.length} items across selected categories`);
        } catch (error) {
            console.error('Error loading items by category IDs:', error);
            message.error('Failed to load items');
        } finally {
            setItemsLoading(false);
        }
    };

    // Load items when category IDs change
    useEffect(() => {
        if (selectedCategoryIds.length > 0) {
            loadItemsByCategoryIds(selectedCategoryIds);
        }
    }, [selectedCategoryIds]);

    const handleRefresh = () => {
        loadCategories();
    };

    // Action handlers
    const handleUpdateCost = (item) => {
        console.log('Update cost for:', item);
        message.info(`Update cost for ${item.description}`);
        // Implement update cost logic here
    };



    const handleViewCostDetails = (item) => {
        console.log('View cost details for:', item);
        message.info(`View cost details for ${item.description}`);
        // Implement view cost details logic here
    };

    return (
        <div style={{padding: '24px'}}>
            <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col span={24}>
                    <Space>
                        <Title level={2}>
                            <ShoppingOutlined/> Product Management
                        </Title>
                        <Button
                            icon={<ReloadOutlined/>}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Space>
                </Col>
            </Row>


            {/* Items by Categories Section */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined/>
                                Products Range ({categoryItems.length})
                            </Space>
                        }
                        loading={itemsLoading}
                        extra={
                            <Space>
                                <Text type="secondary">
                                    Showing items from {selectedCategoryIds.length} categories
                                </Text>
                                <Button
                                    icon={<ReloadOutlined/>}
                                    onClick={() => loadItemsByCategoryIds(selectedCategoryIds)}
                                    size="small"
                                    loading={itemsLoading}
                                >
                                    Reload Items
                                </Button>
                            </Space>
                        }
                    >
                        {selectedCategoryIds.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '20px'}}>
                                <Text type="secondary">
                                    No categories selected. Please load categories first.
                                </Text>
                            </div>
                        ) : (
                            <Table
                                dataSource={categoryItems}
                                columns={ItemCoastTableColumns}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                                size="middle"
                                scroll={{x: 1200}}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductManagement;