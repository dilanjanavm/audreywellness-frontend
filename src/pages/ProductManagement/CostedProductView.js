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
    Statistic,
    Divider,
    Empty,
    Tabs,
    Badge,
} from 'antd';
import {
    ArrowLeftOutlined,
    ShoppingOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    DollarOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import * as costingService from '../../service/costingService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CostedProductView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const [latestCosting, setLatestCosting] = useState(null);
    const [allCostingVersions, setAllCostingVersions] = useState([]);
    const [activeTab, setActiveTab] = useState('latest');

    useEffect(() => {
        // Get itemId from location state
        const itemId = location.state?.product?.itemId || location.state?.itemId;
        
        if (itemId) {
            loadCostedProduct(itemId);
        } else {
            message.error('No product ID provided');
            navigate('/costed-products');
        }
    }, [location]);

    const loadCostedProduct = async (itemId) => {
        try {
            setLoading(true);
            const response = await costingService.getCostedProductByItemId(itemId);

            // Handle response structure
            let product = null;
            if (response.data) {
                if (response.data.data) {
                    product = response.data.data;
                } else if (response.data.itemId) {
                    product = response.data;
                }
            }

            if (product) {
                setProductData(product);
                if (product.latestCosting) {
                    setLatestCosting(product.latestCosting);
                    setActiveTab(`version-${product.latestCosting.version}`);
                }
                if (product.allCostingVersions && Array.isArray(product.allCostingVersions)) {
                    // Sort versions by version number (descending - latest first)
                    const sortedVersions = [...product.allCostingVersions].sort((a, b) => b.version - a.version);
                    setAllCostingVersions(sortedVersions);
                }
            } else {
                message.error('Product not found');
                navigate('/costed-products');
            }
        } catch (error) {
            console.error('Error loading costed product:', error);
            message.error('Failed to load product details');
            navigate('/costed-products');
        } finally {
            setLoading(false);
        }
    };

    const batchSizes = [0.5, 1, 10, 25, 50, 100, 150, 200];

    // Function to extract batch size from batchSize string (e.g., "batch0_5kg" -> 0.5)
    const extractBatchSize = (batchSizeStr) => {
        const match = batchSizeStr.match(/batch(\d+(?:\.\d+)?|0_5)kg/);
        if (match) {
            return match[1].replace('_', '.');
        }
        return null;
    };

    // Raw Materials Columns
    const rawMaterialsColumns = [
        {
            title: 'No',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Raw Material',
            dataIndex: 'rawMaterialName',
            key: 'rawMaterialName',
            width: 200,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 120,
            render: (percentage) => (
                <Tag color="blue">{parseFloat(percentage).toFixed(2)}%</Tag>
            ),
        },
        {
            title: 'Unit Price (LKR)',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 140,
            render: (price) => `LKR ${parseFloat(price).toFixed(2)}`,
        },
        {
            title: 'Units',
            dataIndex: 'units',
            key: 'units',
            width: 100,
            render: (units) => <Tag>{units || '-'}</Tag>,
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            key: 'supplier',
            width: 180,
            render: (supplier) => supplier || <Text type="secondary">Not assigned</Text>,
        },
        {
            title: 'Amount Needed',
            dataIndex: 'amountNeeded',
            key: 'amountNeeded',
            width: 140,
            render: (amount) => `LKR ${parseFloat(amount).toFixed(2)}`,
        },
        ...batchSizes.map(batchSize => {
            const batchKey = batchSize === 0.5 ? 'batch0_5kg' : `batch${batchSize}kg`;
            return {
                title: `${batchSize}kg Batch`,
                key: batchKey,
                width: 140,
                render: (_, record) => {
                    const batchCalc = record.batchCalculations?.[batchKey];
                    if (batchCalc) {
                        return (
                            <div style={{ textAlign: 'center' }}>
                                <div>
                                    <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
                                        LKR {parseFloat(batchCalc.cost).toFixed(2)}
                                    </Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {parseFloat(batchCalc.kg).toFixed(3)} kg
                                    </Text>
                                </div>
                            </div>
                        );
                    }
                    return '-';
                },
            };
        }),
    ];

    // Additional Costs Columns
    const additionalCostsColumns = [
        {
            title: 'No',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Cost Name',
            dataIndex: 'costName',
            key: 'costName',
            width: 150,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
        },
        {
            title: 'Cost Per Unit (LKR)',
            dataIndex: 'costPerUnit',
            key: 'costPerUnit',
            width: 150,
            render: (cost) => `LKR ${parseFloat(cost || 0).toFixed(2)}`,
        },
        ...batchSizes.map(batchSize => {
            const batchKey = batchSize === 0.5 ? 'batch0_5kg' : `batch${batchSize}kg`;
            return {
                title: `${batchSize}kg Batch`,
                key: batchKey,
                width: 140,
                render: (_, record) => {
                    const batchCost = record.batchCosts?.[batchKey] || 0;
                    return `LKR ${parseFloat(batchCost).toFixed(2)}`;
                },
            };
        }),
    ];

    if (loading) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Loading product details...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Empty description="No product data available" />
                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/costed-products')}
                            style={{ marginTop: 16 }}
                        >
                            Back to Costed Products
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="page-content">
            <Container fluid>
                {/* Breadcrumb */}
                <Row className="mb-3">
                    <Col>
                        <BreadCrumb title="Costed Product Details" pageTitle="Product Management" />
                    </Col>
                </Row>

                {/* Header Actions */}
                <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/costed-products')}
                        >
                            Back to Costed Products
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadCostedProduct(productData.itemId)}
                        >
                            Refresh
                        </Button>
                    </div>
                </Card>

                {/* Product Information */}
                <Card
                    title={
                        <Space>
                            <ShoppingOutlined />
                            Product Information
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                >
                    <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                        <Descriptions.Item label="Item Code">
                            <Tag color="blue">{productData.itemCode}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Item Name" span={2}>
                            <Text strong>{productData.itemName}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Category">
                            <Tag color="purple">{productData.category}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Units">
                            <Tag>{productData.units}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Price">
                            <Text strong style={{ color: '#1890ff' }}>
                                {productData.currency || 'LKR'} {parseFloat(productData.price || 0).toFixed(2)}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={productData.status === 'Active' ? 'green' : 'red'}>
                                {productData.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Has Active Costing">
                            <Tag color={productData.hasActiveCosting ? 'green' : 'default'}>
                                {productData.hasActiveCosting ? 'Yes' : 'No'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Active Version">
                            {productData.activeCostingVersion ? (
                                <Tag color="blue">Version {productData.activeCostingVersion}</Tag>
                            ) : (
                                '-'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Versions">
                            {productData.totalCostingVersions || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Cost Update">
                            {productData.lastCostUpdate
                                ? dayjs(productData.lastCostUpdate).format('MMM DD, YYYY HH:mm')
                                : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Costing Versions */}
                {allCostingVersions.length > 0 ? (
                    <Card
                        title={
                            <Space>
                                <HistoryOutlined />
                                Costing Versions
                                <Badge count={allCostingVersions.length} showZero color="#1890ff" />
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                            size="large"
                        >
                            {allCostingVersions.map((costing) => {
                                const isLatest = costing.version === latestCosting?.version;
                                const isActive = costing.isActive;
                                
                                return (
                                    <TabPane
                                        tab={
                                            <Space>
                                                {isLatest && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                                <span>Version {costing.version}</span>
                                                {isActive && (
                                                    <Tag color="green" size="small">Active</Tag>
                                                )}
                                                {isLatest && (
                                                    <Tag color="blue" size="small">Latest</Tag>
                                                )}
                                            </Space>
                                        }
                                        key={`version-${costing.version}`}
                                    >
                                        {renderCostingDetails(costing, isLatest)}
                                    </TabPane>
                                );
                            })}
                        </Tabs>
                    </Card>
                ) : latestCosting ? (
                    <>
                        {/* Fallback: Show only latest costing if versions array is not available */}
                        {renderCostingDetails(latestCosting, true)}
                    </>
                ) : (
                    <Card>
                        <Empty description="No costing data available for this product" />
                    </Card>
                )}
            </Container>
        </div>
    );

    // Function to render costing details (extracted for reuse)
    function renderCostingDetails(costing, isLatest = false) {
        if (!costing) return null;

        // Sort total costs by batch size
        const sortedTotalCosts = costing.totalCosts?.slice().sort((a, b) => {
            const sizeA = parseFloat(extractBatchSize(a.batchSize) || 0);
            const sizeB = parseFloat(extractBatchSize(b.batchSize) || 0);
            return sizeA - sizeB;
        }) || [];

        return (
            <>
                {/* Costing Version Info */}
                <Card
                    title={
                        <Space>
                            <CalculatorOutlined />
                            Costing Details
                            <Tag color={costing.isActive ? 'green' : 'default'}>
                                {costing.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                            <Tag color="blue">Version {costing.version}</Tag>
                            {isLatest && (
                                <Tag color="gold" icon={<CheckCircleOutlined />}>
                                    Latest Version
                                </Tag>
                            )}
                        </Space>
                    }
                    style={{ 
                        marginBottom: 16,
                        border: isLatest ? '2px solid #52c41a' : '1px solid #f0f0f0',
                        boxShadow: isLatest ? '0 2px 8px rgba(82, 196, 26, 0.2)' : 'none'
                    }}
                >
                    <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                        <Descriptions.Item label="Version">
                            <Tag color="blue">{costing.version}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={costing.status === 'Active' ? 'green' : 'default'}>
                                {costing.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Percentage">
                            <Text strong>{parseFloat(costing.totalPercentage || 0).toFixed(2)}%</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Raw Material Cost">
                            <Text strong style={{ color: '#1890ff' }}>
                                LKR {parseFloat(costing.totalRawMaterialCost || 0).toFixed(2)}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Additional Cost">
                            <Text strong style={{ color: '#52c41a' }}>
                                LKR {parseFloat(costing.totalAdditionalCost || 0).toFixed(2)}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">
                            {dayjs(costing.createdAt).format('MMM DD, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Updated At">
                            {dayjs(costing.updatedAt).format('MMM DD, YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Raw Materials */}
                <Card
                    title={
                        <Space>
                            <ShoppingOutlined />
                            Raw Materials Composition
                            <Tag color="blue">
                                {costing.rawMaterials?.length || 0} materials
                            </Tag>
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                >
                    {costing.rawMaterials && costing.rawMaterials.length > 0 ? (
                        <Table
                            columns={rawMaterialsColumns}
                            dataSource={costing.rawMaterials}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1600 }}
                            size="middle"
                        />
                    ) : (
                        <Empty description="No raw materials" />
                    )}
                </Card>

                {/* Additional Costs */}
                {costing.additionalCosts && costing.additionalCosts.length > 0 && (
                    <Card
                        title={
                            <Space>
                                <CalculatorOutlined />
                                Additional Costs
                                <Tag color="orange">
                                    {costing.additionalCosts.length} costs
                                </Tag>
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Table
                            columns={additionalCostsColumns}
                            dataSource={costing.additionalCosts}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1400 }}
                            size="middle"
                        />
                    </Card>
                )}

                {/* Total Cost Summary */}
                {sortedTotalCosts.length > 0 && (
                    <Card
                        title={
                            <Space>
                                <DollarOutlined />
                                Total Production Cost Summary by Batch Size
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Row gutter={[16, 16]}>
                            {sortedTotalCosts.map((totalCost) => {
                                const batchSize = extractBatchSize(totalCost.batchSize);
                                if (!batchSize) return null;

                                return (
                                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={totalCost.id}>
                                        <Card
                                            size="small"
                                            style={{
                                                textAlign: 'center',
                                                border: '1px solid #f0f0f0',
                                                background: costing.isActive
                                                    ? '#f6ffed'
                                                    : '#fff',
                                            }}
                                        >
                                            <div style={{ marginBottom: '8px' }}>
                                                <Text strong>{batchSize}kg Batch</Text>
                                            </div>
                                            <Statistic
                                                value={parseFloat(totalCost.cost).toFixed(2)}
                                                prefix="LKR"
                                                valueStyle={{
                                                    color: '#1890ff',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <div style={{ marginTop: '8px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {parseFloat(totalCost.kg).toFixed(2)} kg total
                                                </Text>
                                            </div>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                <div>
                                                    Raw: LKR {parseFloat(totalCost.rawMaterialCost || 0).toFixed(2)}
                                                </div>
                                                <div>
                                                    Add: LKR {parseFloat(totalCost.additionalCost || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                )}
            </>
        );
    }
};

export default CostedProductView;

