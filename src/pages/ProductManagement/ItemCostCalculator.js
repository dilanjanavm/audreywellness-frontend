import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Statistic,
    message,
    Breadcrumb,
    PageHeader,
    Descriptions,
    Spin,
    AutoComplete,
    Modal // NEW: Import Modal for confirmation
} from 'antd';
import {
    HomeOutlined,
    ShoppingOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    SearchOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import * as itemService from '../../service/itemService';
import * as supplierService from '../../service/supplierService';
import * as costService from '../../service/costingService';
import './costCaculator.scss'

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal; // NEW: For confirmation dialog

const ProductCostCalculate = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(null);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [additionalCosts, setAdditionalCosts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false); // NEW: Save loading state
    const [itemsData, setItemsData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Get item data from navigation state
    useEffect(() => {
        if (location.state?.item) {
            setSelectedItem(location.state.item);

            // NEW: If editing an existing costing, populate the fields
            if (location.state.costing) {
                const existingCosting = location.state.costing;

                // Populate Raw Materials
                if (existingCosting.rawMaterials && Array.isArray(existingCosting.rawMaterials)) {
                    const mappedMaterials = existingCosting.rawMaterials.map((rm, index) => ({
                        id: Date.now() + index, // Generate unique IDs
                        rawMaterial: rm.rawMaterialName,
                        rawMaterialId: rm.rawMaterialId,
                        percentage: rm.percentage,
                        unitPrice: rm.unitPrice,
                        supplier: rm.supplier,
                        supplierId: rm.supplierId,
                        category: rm.category,
                        categoryId: rm.categoryId,
                        amountNeeded: rm.amountNeeded,
                        units: rm.units,
                        supplierData: { // Reconstruct supplier data if possible or keep minimal
                            id: rm.supplierId,
                            name: rm.supplier
                        }
                    }));
                    setRawMaterials(mappedMaterials);
                }

                // Populate Additional Costs
                if (existingCosting.additionalCosts && Array.isArray(existingCosting.additionalCosts)) {
                    const mappedAdditionalCosts = existingCosting.additionalCosts.map((ac, index) => {
                        const costObj = {
                            id: Date.now() + index + 1000, // Offset IDs to avoid collision
                            costName: ac.costName,
                            description: ac.description,
                            costPerUnit: ac.costPerUnit,
                        };

                        // Flatten batch costs (batchCosts object -> distinct fields)
                        if (ac.batchCosts) {
                            batchSizes.forEach(size => {
                                const key = `batch${size}kg`.replace('.', '_'); // Handle 0.5kg -> batch0_5kg
                                // Check both formats: batchCosts['batch0.5kg'] and batchCosts['batch0_5kg']
                                costObj[`batch${size}`] = ac.batchCosts[key] || ac.batchCosts[`batch${size}kg`] || 0;
                            });
                        }

                        return costObj;
                    });
                    setAdditionalCosts(mappedAdditionalCosts);
                }
            }
        } else {
            message.error('No item selected for cost calculation');
            navigate('/products');
        }
    }, [location, navigate]);

    // Load initial suppliers data
    useEffect(() => {
        loadSuppliers();
    }, []);

    // Load suppliers function
    const loadSuppliers = async (search = '') => {
        try {
            setSupplierSearchLoading(true);
            const response = await supplierService.getAllSuppliers(1, 100, search, true, false);

            // Handle different response structures
            let suppliersData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    suppliersData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    suppliersData = response.data.data;
                } else if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
                    suppliersData = response.data.suppliers;
                }
            }

            setSuppliers(suppliersData);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            message.error('Failed to load suppliers');
            setSuppliers([]);
        } finally {
            setSupplierSearchLoading(false);
        }
    };

    // Search suppliers function - debounced search
    const searchSuppliers = async (query) => {
        if (!query || query.trim() === '') {
            // If empty, load all suppliers
            await loadSuppliers('');
        } else {
            // Search with query
            await loadSuppliers(query.trim());
        }
    };

    // Search items function
    const searchItems = async (query) => {
        if (!query || query.length < 2) {
            setItemsData([]);
            return;
        }

        try {
            setSearchLoading(true);
            const response = await itemService.getAllItems(1, 50, query);
            const items = response.data || [];
            setItemsData(items);
        } catch (error) {
            console.error('Error searching items:', error);
            message.error('Failed to search items');
        } finally {
            setSearchLoading(false);
        }
    };

    const addRawMaterial = () => {
        const newMaterial = {
            id: Date.now(),
            rawMaterial: '',
            rawMaterialId: '',
            percentage: 0,
            unitPrice: 0,
            supplier: '',
            supplierId: '', // UUID for supplier
            category: '',
            categoryId: '', // UUID for category
            amountNeeded: 0,
            units: ''
        };
        setRawMaterials([...rawMaterials, newMaterial]);
    };

    // Add additional cost
    const addAdditionalCost = () => {
        const newCost = {
            id: Date.now(),
            costName: '',
            description: '',
            costPerUnit: 0,
            // Initialize all batch costs to 0
            ...batchSizes.reduce((acc, batchSize) => {
                acc[`batch${batchSize}`] = 0;
                return acc;
            }, {})
        };
        setAdditionalCosts([...additionalCosts, newCost]);
    };

    const removeRawMaterial = (id) => {
        setRawMaterials(rawMaterials.filter(item => item.id !== id));
    };

    // Remove additional cost
    const removeAdditionalCost = (id) => {
        setAdditionalCosts(additionalCosts.filter(item => item.id !== id));
    };

    const handleRawMaterialSelect = (value, option, recordId) => {
        const selectedItem = itemsData.find(item => item.id === value);
        if (selectedItem) {
            const updatedMaterials = rawMaterials.map(material => {
                if (material.id === recordId) {
                    return {
                        ...material,
                        rawMaterial: selectedItem.description,
                        rawMaterialId: selectedItem.id,
                        unitPrice: parseFloat(selectedItem.price) || 0,
                        units: selectedItem.units,
                        category: selectedItem.category,
                        categoryId: selectedItem.categoryId || selectedItem.category, // Use categoryId if available, fallback to category
                        // Auto-calculate amount needed based on percentage
                        amountNeeded: calculateAmountNeeded(material.percentage, parseFloat(selectedItem.price) || 0)
                    };
                }
                return material;
            });
            setRawMaterials(updatedMaterials);
        }
    };

    // Handle supplier selection with UUID
    const handleSupplierSelect = (value, option, recordId) => {
        const selectedSupplier = suppliers.find(supplier => supplier.id === value);
        if (selectedSupplier) {
            const updatedMaterials = rawMaterials.map(material => {
                if (material.id === recordId) {
                    return {
                        ...material,
                        supplier: selectedSupplier.name,
                        supplierId: selectedSupplier.id, // Store supplier UUID
                        supplierData: {
                            id: selectedSupplier.id,
                            name: selectedSupplier.name,
                            contactPerson: selectedSupplier.contactPerson || '',
                            email: selectedSupplier.email || '',
                            phone: selectedSupplier.phone || '',
                            address: selectedSupplier.address || '',
                            reference: selectedSupplier.reference || ''
                        }
                    };
                }
                return material;
            });
            setRawMaterials(updatedMaterials);
        } else if (value === null || value === undefined) {
            // Handle clear/remove supplier
            const updatedMaterials = rawMaterials.map(material => {
                if (material.id === recordId) {
                    return {
                        ...material,
                        supplier: '',
                        supplierId: '',
                        supplierData: null
                    };
                }
                return material;
            });
            setRawMaterials(updatedMaterials);
        }
    };

    const calculateAmountNeeded = (percentage, unitPrice) => {
        const amount = (percentage / 100) * unitPrice;
        return isNaN(amount) ? 0 : amount;
    };

    const calculateBatchCost = (amountNeeded, batchSize) => {
        return (amountNeeded * batchSize).toFixed(3);
    };

    // Calculate KG needed for each batch
    const calculateBatchKg = (percentage, batchSize) => {
        return ((percentage / 100) * batchSize).toFixed(3);
    };

    const batchSizes = [0.5, 1, 10, 25, 50, 100, 150, 200, 250];

    const columns = [
        {
            title: 'No',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Raw Material',
            dataIndex: 'rawMaterial',
            key: 'rawMaterial',
            width: 250,
            render: (text, record) => (
                <Select
                    showSearch
                    placeholder="Search and select raw material"
                    value={record.rawMaterialId || undefined}
                    onSearch={searchItems}
                    onChange={(value, option) => handleRawMaterialSelect(value, option, record.id)}
                    style={{ width: '100%' }}
                    filterOption={false}
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                    loading={searchLoading}
                >
                    {itemsData.map(item => (
                        <Option style={{ height: '3rem' }} key={item.id} value={item.id}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    Code: {item.itemCode} | Stock: {item.stockId}
                                </div>
                                <div style={{ fontWeight: 'bold' }}>{item.description}</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Category: {item.category} | Units: {item.units}
                                </div>
                            </div>
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 140,
            render: (value, record) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={value}
                    onChange={(val) => handleMaterialChange(record.id, 'percentage', val)}
                    style={{ width: '100%' }}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    size="middle"
                />
            ),
        },
        {
            title: 'Unit Price (LKR)',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 130,
            render: (value, record) => (
                <InputNumber
                    min={0}
                    value={value}
                    onChange={(val) => handleMaterialChange(record.id, 'unitPrice', val)}
                    style={{ width: '100%' }}
                    formatter={value => `LKR ${value}`}
                    parser={value => value.replace('LKR ', '')}
                    size="middle"
                    disabled={!record.rawMaterialId} // Disable if no material selected
                />
            ),
        },
        {
            title: 'Units',
            dataIndex: 'units',
            key: 'units',
            width: 100,
            render: (units) => (
                <Tag color="blue" style={{ margin: 0 }}>
                    {units || '-'}
                </Tag>
            ),
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            key: 'supplier',
            width: 200,
            render: (value, record) => (
                <Select
                    showSearch
                    placeholder="Search and select supplier"
                    value={record.supplierId || undefined} // Use supplierId as value
                    onChange={(value, option) => handleSupplierSelect(value, option, record.id)} // Use new handler
                    onSearch={searchSuppliers}
                    onFocus={() => {
                        // Load suppliers when dropdown is opened if not already loaded
                        if (suppliers.length === 0) {
                            loadSuppliers('');
                        }
                    }}
                    filterOption={false}
                    notFoundContent={supplierSearchLoading ? <Spin size="small" /> : (suppliers.length === 0 ? 'No suppliers found' : null)}
                    loading={supplierSearchLoading}
                    style={{ width: '100%' }}
                    allowClear
                    optionLabelProp="label"
                >
                    {suppliers.length > 0 ? (
                        suppliers.map(supplier => (
                            <Option
                                key={supplier.id}
                                value={supplier.id}
                                label={supplier.name}
                            >
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{supplier.name}</div>
                                    {supplier.reference && (
                                        <div style={{ fontSize: '11px', color: '#999' }}>
                                            Ref: {supplier.reference}
                                        </div>
                                    )}
                                    {supplier.contactPerson && (
                                        <div style={{ fontSize: '11px', color: '#666' }}>
                                            Contact: {supplier.contactPerson}
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div style={{ fontSize: '11px', color: '#666' }}>
                                            {supplier.email}
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div style={{ fontSize: '11px', color: '#666' }}>
                                            {supplier.phone}
                                        </div>
                                    )}
                                </div>
                            </Option>
                        ))
                    ) : (
                        <Option disabled value="no-suppliers">
                            <div style={{ textAlign: 'center', color: '#999' }}>
                                {supplierSearchLoading ? 'Loading...' : 'No suppliers available'}
                            </div>
                        </Option>
                    )}
                </Select>
            ),
        },
        // {
        //     title: 'Amount Needed (LKR)',
        //     dataIndex: 'amountNeeded',
        //     key: 'amountNeeded',
        //     width: 130,
        //     render: (_, record) => (
        //         <Text strong style={{color: '#1890ff'}}>
        //             {calculateAmountNeeded(record.percentage, record.unitPrice).toFixed(3)}
        //         </Text>
        //     ),
        // },
        // Batch columns to show both cost and KG
        ...batchSizes.map(batchSize => ({
            title: `${batchSize}kg\nBatch`,
            key: `batch${batchSize}`,
            width: 120,
            render: (_, record) => {
                const amountNeeded = calculateAmountNeeded(record.percentage, record.unitPrice);
                const batchCost = calculateBatchCost(amountNeeded, batchSize);
                const batchKg = calculateBatchKg(record.percentage, batchSize);

                return (
                    <div style={{ textAlign: 'center', lineHeight: '1.3' }}>
                        <div>
                            <Text strong style={{ color: '#1890ff', fontSize: '11px' }}>
                                LKR {batchCost}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                {batchKg} kg
                            </Text>
                        </div>
                    </div>
                );
            },
        })),
        {
            title: 'Action',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRawMaterial(record.id)}
                    size="small"
                />
            ),
        },
    ];

    // Additional Costs columns
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
            width: 200,
            render: (value, record) => (
                <Input
                    placeholder="Enter cost name (e.g., Labor, Packaging)"
                    value={value}
                    onChange={(e) => handleAdditionalCostChange(record.id, 'costName', e.target.value)}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (value, record) => (
                <Input
                    placeholder="Enter description"
                    value={value}
                    onChange={(e) => handleAdditionalCostChange(record.id, 'description', e.target.value)}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Cost Per Unit (LKR)',
            dataIndex: 'costPerUnit',
            key: 'costPerUnit',
            width: 150,
            render: (value, record) => (
                <InputNumber
                    min={0}
                    value={value}
                    onChange={(val) => handleAdditionalCostChange(record.id, 'costPerUnit', val)}
                    style={{ width: '100%' }}
                    formatter={value => `LKR ${value}`}
                    parser={value => value.replace('LKR ', '')}
                    size="middle"
                />
            ),
        },
        // Additional Costs Batch columns (only cost, no KG)
        ...batchSizes.map(batchSize => ({
            title: `${batchSize}kg\nBatch`,
            key: `batch${batchSize}`,
            width: 120,
            render: (_, record) => (
                <InputNumber
                    min={0}
                    value={record[`batch${batchSize}`] || 0}
                    onChange={(val) => handleAdditionalCostChange(record.id, `batch${batchSize}`, val)}
                    style={{ width: '100%' }}
                    formatter={value => `LKR ${value}`}
                    parser={value => value.replace('LKR ', '')}
                    size="small"
                />
            ),
        })),
        {
            title: 'Action',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeAdditionalCost(record.id)}
                    size="small"
                />
            ),
        },
    ];

    const handleMaterialChange = (id, field, value) => {
        const updatedMaterials = rawMaterials.map(material => {
            if (material.id === id) {
                const updatedMaterial = { ...material, [field]: value };

                // Recalculate amount needed when percentage or unit price changes
                if (field === 'percentage' || field === 'unitPrice') {
                    updatedMaterial.amountNeeded = calculateAmountNeeded(
                        field === 'percentage' ? value : updatedMaterial.percentage,
                        field === 'unitPrice' ? value : updatedMaterial.unitPrice
                    );
                }

                return updatedMaterial;
            }
            return material;
        });
        setRawMaterials(updatedMaterials);
    };

    // Handle additional cost changes
    const handleAdditionalCostChange = (id, field, value) => {
        const updatedCosts = additionalCosts.map(cost => {
            if (cost.id === id) {
                return { ...cost, [field]: value };
            }
            return cost;
        });
        setAdditionalCosts(updatedCosts);
    };

    const calculateTotalCost = (batchSize) => {
        const rawMaterialCost = rawMaterials.reduce((total, material) => {
            const amountNeeded = calculateAmountNeeded(material.percentage, material.unitPrice);
            return total + (amountNeeded * batchSize);
        }, 0);

        const additionalCost = additionalCosts.reduce((total, cost) => {
            return total + (parseFloat(cost[`batch${batchSize}`]) || 0);
        }, 0);

        return (rawMaterialCost + additionalCost).toFixed(2);
    };

    // Calculate total KG for each batch
    const calculateTotalKg = (batchSize) => {
        return rawMaterials.reduce((total, material) => {
            const kgNeeded = (material.percentage / 100) * batchSize;
            return total + kgNeeded;
        }, 0).toFixed(2);
    };

    // UPDATED: Handle save cost with confirmation and API call
    const handleSaveCost = () => {
        if (rawMaterials.length === 0) {
            message.warning('Please add at least one raw material');
            return;
        }

        // Validate that all raw materials have been selected
        const incompleteMaterials = rawMaterials.filter(material => !material.rawMaterialId);
        if (incompleteMaterials.length > 0) {
            message.warning('Please select raw materials for all entries');
            return;
        }

        // Show confirmation dialog
        confirm({
            title: 'Confirm Save Cost Calculation',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Are you sure you want to save this cost calculation?</p>
                    <p><strong>Product:</strong> {selectedItem?.description}</p>
                    <p><strong>Raw Materials:</strong> {rawMaterials.length}</p>
                    <p><strong>Additional Costs:</strong> {additionalCosts.length}</p>
                </div>
            ),
            okText: 'Yes, Save',
            okType: 'primary',
            cancelText: 'Cancel',
            onOk() {
                saveCostToDatabase();
            },
        });
    };

    // NEW: Function to save cost data to database
    // NEW: Function to save cost data to database
    const saveCostToDatabase = async () => {
        try {
            setSaveLoading(true);

            const costData = {
                itemId: selectedItem?.id,
                itemName: selectedItem?.description,
                itemCode: selectedItem?.itemCode,
                rawMaterials: rawMaterials.map(material => {
                    const amountNeeded = calculateAmountNeeded(material.percentage, material.unitPrice);

                    // Calculate batch costs and KG for each raw material
                    const batchCalculations = batchSizes.reduce((acc, batchSize) => {
                        const batchCost = calculateBatchCost(amountNeeded, batchSize);
                        const batchKg = calculateBatchKg(material.percentage, batchSize);

                        // Backend expects underscore for decimal batch sizes (e.g. batch0_5kg)
                        const batchKey = `batch${batchSize}kg`.replace('.', '_');

                        acc[batchKey] = {
                            cost: parseFloat(batchCost),
                            kg: parseFloat(batchKg)
                        };
                        return acc;
                    }, {});

                    return {
                        rawMaterialId: material.rawMaterialId,
                        rawMaterialName: material.rawMaterial,
                        percentage: material.percentage,
                        unitPrice: material.unitPrice,
                        supplier: material.supplier || '',
                        // Send null if no supplier selected, validation should handle optional
                        supplierId: material.supplierId || null,
                        // Include complete supplier data if available
                        supplierData: material.supplierData || (material.supplierId ? {
                            id: material.supplierId,
                            name: material.supplier
                        } : null),
                        category: material.category, // Assuming category name is needed or ID
                        categoryId: material.categoryId,
                        units: material.units,
                        amountNeeded: amountNeeded,
                        // NEW: Include batch-wise calculations for each raw material
                        batchCalculations: batchCalculations
                    };
                }),
                additionalCosts: additionalCosts.map(cost => ({
                    costName: cost.costName,
                    description: cost.description,
                    costPerUnit: cost.costPerUnit,
                    batchCosts: batchSizes.reduce((acc, batchSize) => {
                        acc[`batch${batchSize}kg`] = cost[`batch${batchSize}`] || 0;
                        return acc;
                    }, {})
                })),
                totalCosts: batchSizes.reduce((acc, batchSize) => {
                    acc[`batch${batchSize}kg`] = {
                        cost: calculateTotalCost(batchSize),
                        kg: calculateTotalKg(batchSize)
                    };
                    return acc;
                }, {}),
                createdAt: new Date().toISOString()
            };
            console.log(costData)
            // Call the API to save costing data
            const response = await costService.createCosting(costData);

            if (response.statusCode === 201) {
                message.success('Cost calculation saved successfully!');
                console.log('Cost data saved:', response.data);

                // Optionally redirect back after save
                // navigate('/products');
            } else {
                message.error('Failed to save cost calculation: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving cost calculation:', error);
            message.error('Failed to save cost calculation. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (!selectedItem) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text type="secondary">Loading item data...</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Breadcrumb and Header */}
            <Card style={{ marginBottom: 16 }}>
                <Breadcrumb style={{ marginBottom: 16 }}>
                    <Breadcrumb.Item>
                        <HomeOutlined />
                        <span>Home</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <ShoppingOutlined />
                        <span>Products</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <CalculatorOutlined />
                        <span>Cost Calculation</span>
                    </Breadcrumb.Item>
                </Breadcrumb>

                <div>
                    <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Back to Products
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveCost}
                        disabled={rawMaterials.length === 0 || saveLoading}
                        loading={saveLoading} // NEW: Add loading state to button
                    >
                        Save Cost Calculation
                    </Button>
                </div>
            </Card>

            {/* Item Information */}
            <Card title="Product Information" style={{ marginBottom: 16 }}>
                <Descriptions bordered size="middle">
                    <Descriptions.Item label="Item Code" span={2}>
                        <Tag color="blue">{selectedItem.itemCode}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Stock ID">
                        <Tag color="green">{selectedItem.stockId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>
                        <Text strong>{selectedItem.description}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Category">
                        <Tag color="purple">{selectedItem.category}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Unit Price">
                        <Text strong style={{ color: '#1890ff' }}>
                            LKR {parseFloat(selectedItem.price || 0).toFixed(2)}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Units">
                        <Tag>{selectedItem.units}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={selectedItem.status === 'Active' ? 'green' : 'red'}>
                            {selectedItem.status}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Raw Materials Section */}
            <Card
                title={
                    <Space>
                        <ShoppingOutlined />
                        Raw Materials Composition
                        <Tag color="blue">{rawMaterials.length} materials</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addRawMaterial}
                    >
                        Add Raw Material
                    </Button>
                }
                style={{ marginBottom: 16 }}
            >
                <Table
                    columns={columns}
                    dataSource={rawMaterials}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 2000 }}
                    size="middle"
                    onRow={(record) => ({
                        style: {
                            height: '80px',
                        },
                    })}
                    style={{ marginBottom: 16 }}
                />

                {rawMaterials.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                        <Text type="secondary">
                            No raw materials added. Click "Add Raw Material" to start calculating costs.
                        </Text>
                    </div>
                )}
            </Card>

            {/* Additional Costs Section */}
            <Card
                title={
                    <Space>
                        <CalculatorOutlined />
                        Additional Costs
                        <Tag color="orange">{additionalCosts.length} costs</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addAdditionalCost}
                    >
                        Add Additional Cost
                    </Button>
                }
                style={{ marginBottom: 16 }}
            >
                <Table
                    columns={additionalCostsColumns}
                    dataSource={additionalCosts}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1800 }}
                    size="middle"
                    style={{ marginBottom: 16 }}
                />

                {additionalCosts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CalculatorOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                        <Text type="secondary">
                            No additional costs added. Click "Add Additional Cost" to include labor, packaging, etc.
                        </Text>
                    </div>
                )}
            </Card>

            {/* Total Cost Summary */}
            {rawMaterials.length > 0 && (
                <Card title="Total Production Cost Summary" style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]}>
                        {batchSizes.map(batchSize => (
                            <Col xs={12} sm={8} md={6} lg={4} xl={3} key={batchSize}>
                                <Card
                                    size="small"
                                    style={{ textAlign: 'center', border: '1px solid #f0f0f0' }}
                                >
                                    <div style={{ marginBottom: '8px' }}>
                                        <Text strong>{batchSize}kg Batch</Text>
                                    </div>
                                    <Statistic
                                        value={calculateTotalCost(batchSize)}
                                        prefix="LKR"
                                        valueStyle={{
                                            color: '#1890ff',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <div style={{ marginTop: '4px' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {calculateTotalKg(batchSize)} kg total
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default ProductCostCalculate;