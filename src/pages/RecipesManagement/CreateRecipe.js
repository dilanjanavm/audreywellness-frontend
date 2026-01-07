import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    message,
    Spin,
    Row,
    Col,
    Typography,
    Space,
    Input,
    Select,
    InputNumber,
    Divider,
    Tag,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined,
    FireOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as recipeService from '../../service/recipeService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateRecipe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productData, setProductData] = useState(null);
    const [selectedBatchSize, setSelectedBatchSize] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [totalProcessTime, setTotalProcessTime] = useState(0);
    const [recipeName, setRecipeName] = useState('');
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [activeMentionStepId, setActiveMentionStepId] = useState(null);
    const [recipeData, setRecipeData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const textareaRefs = {};

    // Get productId from location state or query params
    const productId = location.state?.productId || new URLSearchParams(location.search).get('productId');

    // Check if we're in edit mode
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            loadRecipeForEdit(id);
        }
    }, [id]);

    useEffect(() => {
        if (productId && !isEditMode) {
            loadProductData(productId);
        }
    }, [productId, isEditMode]);

    useEffect(() => {
        calculateTotalTime();
    }, [steps]);

    useEffect(() => {
        if (selectedBatchSize && productData) {
            // In edit mode, only update if we have product data loaded
            // This allows recalculating ingredients if batch size changes
            updateIngredientsForBatchSize();
        }
    }, [selectedBatchSize, productData]);

    const loadRecipeForEdit = async (recipeId) => {
        setLoading(true);
        try {
            const response = await recipeService.getRecipeById(recipeId);
            if (response && response.data) {
                const data = response.data.data || response.data;
                setRecipeData(data);
                
                // Set recipe fields
                setRecipeName(data.name || '');
                setSelectedBatchSize(data.batchSize || '');
                setTotalProcessTime(data.totalTime || 0);
                
                // Set steps
                if (data.steps && Array.isArray(data.steps)) {
                    const sortedSteps = data.steps
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((step, idx) => ({
                            id: step.id || Date.now() + idx,
                            instruction: step.instruction || '',
                            temperature: step.temperature,
                            duration: step.duration || 0,
                            order: step.order || idx + 1,
                        }));
                    setSteps(sortedSteps);
                }
                
                // Set ingredients
                if (data.ingredients && Array.isArray(data.ingredients)) {
                    setIngredients(data.ingredients.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        category: ing.category,
                    })));
                }
                
                // Load product data for the recipe's productId
                // This allows recalculating ingredients if batch size is changed
                if (data.productId || data.itemId) {
                    await loadProductData(data.productId || data.itemId, false);
                }
            }
        } catch (error) {
            message.error('Failed to load recipe data');
            navigate('/recipes-management');
        } finally {
            setLoading(false);
        }
    };

    const loadProductData = async (itemId, showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        try {
            const response = await recipeService.getProductCostingForRecipe(itemId);
            if (response && response.data) {
                const data = response.data.data?.[0] || response.data;
                setProductData(data);
                
                // Set default batch size if available and not already set
                if (!selectedBatchSize && data.latestCosting?.totalCosts && data.latestCosting.totalCosts.length > 0) {
                    const firstBatch = data.latestCosting.totalCosts[0];
                    setSelectedBatchSize(firstBatch.batchSize || '');
                }
            }
        } catch (error) {
            message.error('Failed to load product data');
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const updateIngredientsForBatchSize = () => {
        if (!productData?.latestCosting?.rawMaterials) return;

        const batchCost = productData.latestCosting.totalCosts?.find(
            cost => cost.batchSize === selectedBatchSize
        );

        if (!batchCost) return;

        // Calculate ingredient quantities based on batch size
        const updatedIngredients = productData.latestCosting.rawMaterials.map((material) => {
            const batchCalc = material.batchCalculations?.[selectedBatchSize];
            return {
                name: material.rawMaterialName,
                quantity: batchCalc?.kg || material.amountNeeded || 0,
                unit: material.units || 'kg',
                category: material.category,
            };
        });

        setIngredients(updatedIngredients);
    };

    const calculateTotalTime = () => {
        const total = steps.reduce((sum, step) => {
            return sum + (step.duration || 0);
        }, 0);
        setTotalProcessTime(total);
    };

    const handleAddStep = () => {
        const newStep = {
            id: Date.now(),
            instruction: '',
            temperature: null,
            duration: null,
            order: steps.length + 1,
        };
        setSteps([...steps, newStep]);
    };

    const handleUpdateStep = (stepId, field, value) => {
        setSteps(steps.map(step => {
            if (step.id === stepId) {
                return { ...step, [field]: value };
            }
            return step;
        }));
    };

    const handleDeleteStep = (stepId) => {
        const updatedSteps = steps
            .filter(step => step.id !== stepId)
            .map((step, index) => ({ ...step, order: index + 1 }));
        setSteps(updatedSteps);
    };

    const handleMoveStep = (stepId, direction) => {
        const index = steps.findIndex(step => step.id === stepId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= steps.length) return;

        const newSteps = [...steps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        
        const reorderedSteps = newSteps.map((step, idx) => ({
            ...step,
            order: idx + 1,
        }));
        
        setSteps(reorderedSteps);
    };

    // Handle instruction change with mention detection
    const handleInstructionChange = (stepId, e) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setMentionQuery(textAfterAt);
                setMentionStartIndex(lastAtIndex);
                setActiveMentionStepId(stepId);
                setShowMentionDropdown(true);
                
                const textarea = e.target;
                const rect = textarea.getBoundingClientRect();
                setMentionPosition({
                    top: rect.bottom + 5,
                    left: rect.left,
                });
            } else {
                setShowMentionDropdown(false);
            }
        } else {
            setShowMentionDropdown(false);
        }
        
        handleUpdateStep(stepId, 'instruction', value);
    };

    // Handle ingredient selection from mention dropdown
    const handleIngredientSelect = (ingredientName, stepId) => {
        if (mentionStartIndex === -1) return;
        
        const step = steps.find(s => s.id === stepId);
        if (!step) return;
        
        const currentInstruction = step.instruction || '';
        const textBeforeAt = currentInstruction.substring(0, mentionStartIndex);
        const textAfterAt = currentInstruction.substring(mentionStartIndex + 1);
        const queryEndMatch = textAfterAt.match(/^[^\s\n]*/);
        const queryEndIndex = queryEndMatch ? queryEndMatch[0].length : 0;
        const textAfterQuery = textAfterAt.substring(queryEndIndex);
        
        const newInstruction = textBeforeAt + '@' + ingredientName + ' ' + textAfterQuery;
        
        setShowMentionDropdown(false);
        setMentionQuery('');
        setMentionStartIndex(-1);
        setActiveMentionStepId(null);
        
        handleUpdateStep(stepId, 'instruction', newInstruction);
    };

    const handleSaveRecipe = async () => {
        if (!productData && !recipeData) {
            message.warning('Please select a product first');
            return;
        }

        if (!selectedBatchSize) {
            message.warning('Please select a batch size');
            return;
        }

        if (steps.length === 0) {
            message.warning('Please add at least one step');
            return;
        }

        // Validate all steps
        const invalidSteps = steps.filter(step => !step.instruction || !step.duration);
        if (invalidSteps.length > 0) {
            message.warning('Please complete all step fields (instruction and duration)');
            return;
        }

        setSaving(true);
        try {
            const currentProductId = productData?.itemId || recipeData?.productId || recipeData?.itemId;
            const currentProductName = productData?.itemName || recipeData?.name || 'Product';
            
            // Prepare request body for backend
            const recipePayload = {
                name: recipeName || `${currentProductName} - ${selectedBatchSize} Recipe`,
                totalTime: totalProcessTime,
                steps: steps.map(step => ({
                    order: step.order,
                    instruction: step.instruction,
                    temperature: step.temperature || null,
                    duration: step.duration,
                })),
                ingredients: ingredients.map(ing => ({
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    category: ing.category,
                })),
                status: recipeData?.status || 'active',
            };

            // Add name if provided
            if (recipeName) {
                recipePayload.name = recipeName;
            }

            console.log('Recipe Data to be sent:', JSON.stringify(recipePayload, null, 2));

            if (isEditMode && id) {
                await recipeService.updateRecipe(id, recipePayload);
                message.success('Recipe updated successfully');
            } else {
                recipePayload.productId = currentProductId;
                recipePayload.itemId = currentProductId;
                recipePayload.batchSize = selectedBatchSize;
                await recipeService.createRecipe(recipePayload);
                message.success('Recipe created successfully');
            }
            
            navigate('/recipes-management');
        } catch (error) {
            message.error(isEditMode ? 'Failed to update recipe' : 'Failed to save recipe');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div className="text-center" style={{ padding: '100px 0' }}>
                        <Spin size="large" />
                    </div>
                </Container>
            </div>
        );
    }

    if (!productData && !recipeData && !loading) {
        return (
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={isEditMode ? "Edit Recipe" : "Create Recipe"} pageTitle="Recipes" />
                    <Card>
                        <div className="text-center" style={{ padding: '50px 0' }}>
                            <Text type="secondary">
                                {isEditMode ? 'Recipe not found.' : 'No product selected. Please select a product from the recipes list.'}
                            </Text>
                            <br />
                            <Button type="primary" onClick={() => navigate('/recipes-management')} className="mt-3">
                                Go to Recipes List
                            </Button>
                        </div>
                    </Card>
                </Container>
            </div>
        );
    }

    const batchSizeOptions = productData?.latestCosting?.totalCosts?.map(cost => ({
        value: cost.batchSize,
        label: cost.batchSize,
    })) || [];

    const filteredIngredients = ingredients.filter(ing => 
        ing.name?.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Create Recipe" pageTitle="Recipes" />
                    
                    {/* Header Section */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, #458533 0%, #69af57 100%)',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        marginBottom: '20px',
                        color: '#fff',
                    }}>
                        <Row gutter={[16, 12]} align="middle">
                            <Col xs={24} md={16}>
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Button
                                        type="text"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => navigate('/recipes-management')}
                                        style={{ color: '#fff', padding: 0, height: 'auto' }}
                                    >
                                        Back
                                    </Button>
                                    <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                                        {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
                                    </Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                        {productData?.itemName || productData?.itemCode || recipeData?.name || 'Recipe'}
                                    </Text>
                                </Space>
                            </Col>
                            <Col xs={24} md={8}>
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.2)', 
                                    borderRadius: '8px', 
                                    padding: '12px 16px',
                                    backdropFilter: 'blur(10px)',
                                }}>
                                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                                            TOTAL PROCESS TIME
                                        </Text>
                                        <Text style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                                            {totalProcessTime} min
                                        </Text>
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Configuration Section */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={8}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                            >
                                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                                    <div>
                                        <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                            Batch Size
                                        </Text>
                                        <Select
                                            style={{ width: '100%' }}
                                            size="large"
                                            placeholder="Select Batch Size"
                                            value={selectedBatchSize}
                                            onChange={setSelectedBatchSize}
                                            style={{
                                                borderRadius: '8px',
                                            }}
                                        >
                                            {batchSizeOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                            Recipe Name
                                        </Text>
                                        <Input
                                            placeholder="Enter recipe name (optional)"
                                            value={recipeName}
                                            onChange={(e) => setRecipeName(e.target.value)}
                                            size="large"
                                            style={{
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </div>

                                    {/* Ingredient Summary */}
                                    <div>
                                        <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '12px' }}>
                                            Ingredients ({ingredients.length})
                                        </Text>
                                        {ingredients.length > 0 ? (
                                            <div style={{ 
                                                background: '#f9fafb',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                            }}>
                                                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                                    {ingredients.map((ing, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '8px 12px',
                                                            background: '#fff',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb',
                                                        }}>
                                                            <Text strong style={{ fontSize: '13px' }}>{ing.name}</Text>
                                                            <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                                                                {ing.quantity} {ing.unit}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Space>
                                            </div>
                                        ) : (
                                            <Text type="secondary" style={{ fontSize: '13px' }}>
                                                Select batch size to view ingredients
                                            </Text>
                                        )}
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        {/* Steps Section */}
                        <Col xs={24} lg={16}>
                            <Card 
                                style={{ 
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Recipe Steps
                                    </Title>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddStep}
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Add Step
                                    </Button>
                                </div>

                                {steps.length === 0 ? (
                                    <div 
                                        style={{ 
                                            padding: '80px 20px',
                                            textAlign: 'center',
                                            border: '2px dashed #e5e7eb',
                                            borderRadius: '12px',
                                            background: '#fafafa',
                                        }}
                                    >
                                        <FileTextOutlined style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
                                        <Text type="secondary" style={{ fontSize: '15px', display: 'block' }}>
                                            No steps added yet
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '8px' }}>
                                            Click "Add Step" to start building your recipe
                                        </Text>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                        {steps.map((step, index) => (
                                            <div
                                                key={step.id}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '24px',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Step Header */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    marginBottom: '20px',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #458533 0%, #69af57 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                            fontSize: '16px',
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <Text strong style={{ fontSize: '16px', color: '#111827' }}>
                                                            Step {index + 1}
                                                        </Text>
                                                    </div>
                                                    <Space>
                                                        <Button
                                                            type="text"
                                                            icon={<ArrowUpOutlined />}
                                                            onClick={() => handleMoveStep(step.id, 'up')}
                                                            disabled={index === 0}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<ArrowDownOutlined />}
                                                            onClick={() => handleMoveStep(step.id, 'down')}
                                                            disabled={index === steps.length - 1}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteStep(step.id)}
                                                            size="small"
                                                        />
                                                    </Space>
                                                </div>

                                                {/* Instruction */}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <Text style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: 500,
                                                        color: '#6b7280',
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                    }}>
                                                        Instruction <Text type="secondary" style={{ fontSize: '11px' }}>(Type '@' to mention ingredients)</Text>
                                                    </Text>
                                                    <div style={{ position: 'relative' }}>
                                                        <TextArea
                                                            placeholder="e.g., Add 50% @DI Water and heat to 100°C"
                                                            value={step.instruction}
                                                            onChange={(e) => handleInstructionChange(step.id, e)}
                                                            rows={3}
                                                            style={{ 
                                                                width: '100%',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                        {showMentionDropdown && activeMentionStepId === step.id && filteredIngredients.length > 0 && (
                                                            <div
                                                                style={{
                                                                    position: 'fixed',
                                                                    top: mentionPosition.top,
                                                                    left: mentionPosition.left,
                                                                    zIndex: 1050,
                                                                    background: '#fff',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '8px',
                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                    maxHeight: '200px',
                                                                    overflowY: 'auto',
                                                                    minWidth: '220px',
                                                                }}
                                                            >
                                                                <div style={{ 
                                                                    padding: '8px 12px',
                                                                    borderBottom: '1px solid #f3f4f6',
                                                                    background: '#f9fafb',
                                                                }}>
                                                                    <Text strong style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                        Select Ingredient
                                                                    </Text>
                                                                </div>
                                                                {filteredIngredients.map((ingredient, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        style={{
                                                                            padding: '10px 16px',
                                                                            cursor: 'pointer',
                                                                            borderBottom: idx < filteredIngredients.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.background = '#f3f4f6';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.background = '#fff';
                                                                        }}
                                                                        onClick={() => handleIngredientSelect(ingredient.name, step.id)}
                                                                    >
                                                                        <Text strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>
                                                                            {ingredient.name}
                                                                        </Text>
                                                                        <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                            {ingredient.quantity} {ingredient.unit}
                                                                        </Text>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Temperature and Duration */}
                                                <Row gutter={16}>
                                                    <Col xs={24} sm={12}>
                                                        <Text style={{ 
                                                            fontSize: '13px', 
                                                            fontWeight: 500,
                                                            color: '#6b7280',
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                        }}>
                                                            <FireOutlined style={{ marginRight: '6px' }} />
                                                            Temperature
                                                        </Text>
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="Enter temperature"
                                                            value={step.temperature}
                                                            onChange={(value) => handleUpdateStep(step.id, 'temperature', value)}
                                                            min={0}
                                                            max={500}
                                                            addonAfter="°C"
                                                            size="large"
                                                            style={{
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12}>
                                                        <Text style={{ 
                                                            fontSize: '13px', 
                                                            fontWeight: 500,
                                                            color: '#6b7280',
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                        }}>
                                                            <ClockCircleOutlined style={{ marginRight: '6px' }} />
                                                            Duration
                                                        </Text>
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="Enter duration"
                                                            value={step.duration}
                                                            onChange={(value) => handleUpdateStep(step.id, 'duration', value)}
                                                            min={0}
                                                            max={999}
                                                            addonAfter="min"
                                                            size="large"
                                                            style={{
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>

                    {/* Footer Actions */}
                    <div style={{ 
                        marginTop: '32px',
                        padding: '20px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}>
                        <Button 
                            onClick={() => navigate('/recipes-management')}
                            size="large"
                            style={{
                                borderRadius: '8px',
                                fontWeight: 500,
                                minWidth: '120px',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            size="large"
                            loading={saving}
                            onClick={handleSaveRecipe}
                            style={{
                                borderRadius: '8px',
                                fontWeight: 500,
                                minWidth: '160px',
                            }}
                        >
                            {isEditMode ? 'Update Recipe' : 'Save Recipe'}
                        </Button>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default CreateRecipe;
