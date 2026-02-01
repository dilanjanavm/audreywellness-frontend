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
    Modal,
    Checkbox,
    Form,
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
    CheckSquareOutlined,
    EditOutlined,
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
    const [allSteps, setAllSteps] = useState([]); // Unified queue: contains both 'step' and 'preparation' types
    const [totalProcessTime, setTotalProcessTime] = useState(0);
    const [recipeName, setRecipeName] = useState('');
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [activeMentionStepId, setActiveMentionStepId] = useState(null);
    const [recipeData, setRecipeData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [preparationModalVisible, setPreparationModalVisible] = useState(false);
    const [editingStepIndex, setEditingStepIndex] = useState(null);
    const [insertPosition, setInsertPosition] = useState(null); // Position to insert preparation step
    const [preparationForm] = Form.useForm();
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
    }, [allSteps]);

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
                
                // Combine steps and preparation questions into unified queue
                const unifiedSteps = [];
                
                // Add recipe steps
                if (data.steps && Array.isArray(data.steps)) {
                    data.steps.forEach(step => {
                        unifiedSteps.push({
                            id: step.id || `step-${Date.now()}-${Math.random()}`,
                            type: 'step',
                            instruction: step.instruction || '',
                            temperature: step.temperature,
                            duration: step.duration || 0,
                            order: step.order || 0,
                        });
                    });
                }
                
                // Add preparation steps
                if (data.preparationQuestions && Array.isArray(data.preparationQuestions)) {
                    data.preparationQuestions.forEach(q => {
                        unifiedSteps.push({
                            id: q.id || `prep-${Date.now()}-${Math.random()}`,
                            type: 'preparation',
                            questions: q.questions || [{ question: q.question || '', hasCheckbox: q.hasCheckbox !== undefined ? q.hasCheckbox : true }],
                            order: q.order || 0,
                        });
                    });
                }
                
                // Sort by order and reassign sequential order
                const sortedUnified = unifiedSteps
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((item, idx) => ({
                        ...item,
                        order: idx + 1,
                    }));
                
                setAllSteps(sortedUnified);
                
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
        const total = allSteps.reduce((sum, item) => {
            if (item.type === 'step') {
                return sum + (item.duration || 0);
            }
            return sum;
        }, 0);
        setTotalProcessTime(total);
    };

    const handleAddStep = (insertAfterIndex = null) => {
        const newStep = {
            id: `step-${Date.now()}-${Math.random()}`,
            type: 'step',
            instruction: '',
            temperature: null,
            duration: null,
            order: allSteps.length + 1,
        };
        
        if (insertAfterIndex !== null && insertAfterIndex >= 0) {
            // Insert at specific position
            const newSteps = [...allSteps];
            newSteps.splice(insertAfterIndex + 1, 0, newStep);
            const reordered = newSteps.map((item, idx) => ({
                ...item,
                order: idx + 1,
            }));
            setAllSteps(reordered);
        } else {
            // Add to end
            setAllSteps([...allSteps, newStep]);
        }
    };

    const handleUpdateStep = (stepId, field, value) => {
        setAllSteps(allSteps.map(item => {
            if (item.id === stepId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleDeleteStep = (stepId) => {
        const updatedSteps = allSteps
            .filter(item => item.id !== stepId)
            .map((item, index) => ({ ...item, order: index + 1 }));
        setAllSteps(updatedSteps);
    };

    const handleMoveStep = (stepId, direction) => {
        const index = allSteps.findIndex(item => item.id === stepId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= allSteps.length) return;

        const newSteps = [...allSteps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        
        const reorderedSteps = newSteps.map((item, idx) => ({
            ...item,
            order: idx + 1,
        }));
        
        setAllSteps(reorderedSteps);
    };

    // Preparation Questions Handlers
    const handleOpenPreparationModal = (insertAfterIndex = null) => {
        setEditingStepIndex(null);
        setInsertPosition(insertAfterIndex);
        // Initialize form with at least one empty question
        preparationForm.setFieldsValue({
            questions: [{ question: '', hasCheckbox: true }]
        });
        setPreparationModalVisible(true);
    };

    const handleClosePreparationModal = () => {
        setPreparationModalVisible(false);
        setEditingStepIndex(null);
        setInsertPosition(null);
        preparationForm.resetFields();
    };

    const handleAddPreparationQuestions = () => {
        preparationForm.validateFields().then(values => {
            if (!values.questions || values.questions.length === 0) {
                message.warning('Please add at least one question');
                return;
            }

            // Filter out empty questions
            const validQuestions = values.questions.filter(q => q.question && q.question.trim());

            if (validQuestions.length === 0) {
                message.warning('Please enter at least one valid question');
                return;
            }

            if (editingStepIndex !== null) {
                // Edit mode - update the preparation step at the specific index
                const updated = [...allSteps];
                updated[editingStepIndex] = {
                    ...updated[editingStepIndex],
                    questions: validQuestions.map(q => ({
                        question: q.question.trim(),
                        hasCheckbox: q.hasCheckbox !== false,
                    })),
                };
                setAllSteps(updated);
            } else {
                // Add mode - create new preparation step
                const newPreparationStep = {
                    id: `prep-${Date.now()}-${Math.random()}`,
                    type: 'preparation',
                    questions: validQuestions.map(q => ({
                        question: q.question.trim(),
                        hasCheckbox: q.hasCheckbox !== false,
                    })),
                    order: allSteps.length + 1,
                };

                if (insertPosition !== null && insertPosition >= 0) {
                    // Insert at specific position
                    const newSteps = [...allSteps];
                    newSteps.splice(insertPosition + 1, 0, newPreparationStep);
                    const reordered = newSteps.map((item, idx) => ({
                        ...item,
                        order: idx + 1,
                    }));
                    setAllSteps(reordered);
                } else {
                    // Add to end
                    setAllSteps([...allSteps, newPreparationStep]);
                }
            }

            handleClosePreparationModal();
        }).catch(err => {
            console.error('Validation failed:', err);
        });
    };

    const handleEditPreparationStep = (stepIndex) => {
        const prepStep = allSteps[stepIndex];
        if (prepStep.type !== 'preparation') return;
        
        preparationForm.setFieldsValue({
            questions: prepStep.questions.map(q => ({
                question: q.question,
                hasCheckbox: q.hasCheckbox,
            }))
        });
        setEditingStepIndex(stepIndex);
        setInsertPosition(null);
        setPreparationModalVisible(true);
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
        
        const step = allSteps.find(s => s.id === stepId);
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

        if (allSteps.length === 0) {
            message.warning('Please add at least one step or preparation');
            return;
        }

        // Validate all recipe steps (preparation steps don't need duration)
        const recipeSteps = allSteps.filter(item => item.type === 'step');
        const invalidSteps = recipeSteps.filter(step => !step.instruction || !step.duration);
        if (invalidSteps.length > 0) {
            message.warning('Please complete all recipe step fields (instruction and duration)');
            return;
        }

        setSaving(true);
        try {
            const currentProductId = productData?.itemId || recipeData?.productId || recipeData?.itemId;
            const currentProductName = productData?.itemName || recipeData?.name || 'Product';
            
            // Separate steps and preparation steps from unified queue
            const recipeSteps = allSteps
                .filter(item => item.type === 'step')
                .map(item => ({
                    order: item.order,
                    instruction: item.instruction,
                    temperature: item.temperature || null,
                    duration: item.duration,
                }));

            const preparationSteps = allSteps
                .filter(item => item.type === 'preparation')
                .map(item => ({
                    order: item.order,
                    questions: item.questions || [],
                }));

            // Prepare request body for backend
            const recipePayload = {
                name: recipeName || `${currentProductName} - ${selectedBatchSize} Recipe`,
                totalTime: totalProcessTime,
                steps: recipeSteps,
                ingredients: ingredients.map(ing => ({
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    category: ing.category,
                })),
                preparationQuestions: preparationSteps,
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
                                        Recipe Queue
                                    </Title>
                                    <Space>
                                        <Button
                                            type="default"
                                            icon={<CheckSquareOutlined />}
                                            onClick={() => handleOpenPreparationModal(null)}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Add Preparation/Checking Step
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAddStep(null)}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Add Step
                                        </Button>
                                    </Space>
                                </div>

                                {allSteps.length === 0 ? (
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
                                            Click "Add Step" or "Add Preparation/Checking Step" to start building your recipe
                                        </Text>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                        {allSteps.map((item, index) => (
                                            item.type === 'step' ? (
                                            // Recipe Step
                                            <div
                                                key={item.id}
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
                                                            onClick={() => handleMoveStep(item.id, 'up')}
                                                            disabled={index === 0}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<ArrowDownOutlined />}
                                                            onClick={() => handleMoveStep(item.id, 'down')}
                                                            disabled={index === allSteps.length - 1}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteStep(item.id)}
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
                                                            value={item.instruction}
                                                            onChange={(e) => handleInstructionChange(item.id, e)}
                                                            rows={3}
                                                            style={{ 
                                                                width: '100%',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                        {showMentionDropdown && activeMentionStepId === item.id && filteredIngredients.length > 0 && (
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
                                                                        onClick={() => handleIngredientSelect(ingredient.name, item.id)}
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
                                                            placeholder="Enter temperature"
                                                            value={item.temperature}
                                                            onChange={(value) => handleUpdateStep(item.id, 'temperature', value)}
                                                            min={0}
                                                            max={500}
                                                            addonAfter="°C"
                                                            size="large"
                                                            style={{
                                                                width: '100%',
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
                                                            placeholder="Enter duration"
                                                            value={item.duration}
                                                            onChange={(value) => handleUpdateStep(item.id, 'duration', value)}
                                                            min={0}
                                                            max={999}
                                                            addonAfter="min"
                                                            size="large"
                                                            style={{
                                                                width: '100%',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>

                                                {/* Insert buttons between items */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'center', 
                                                    marginTop: '16px',
                                                    paddingTop: '16px',
                                                    borderTop: '1px dashed #e5e7eb',
                                                }}>
                                                    <Space>
                                                        <Button
                                                            type="dashed"
                                                            size="small"
                                                            icon={<CheckSquareOutlined />}
                                                            onClick={() => handleOpenPreparationModal(index)}
                                                        >
                                                            Add Preparation Here
                                                        </Button>
                                                        <Button
                                                            type="dashed"
                                                            size="small"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => handleAddStep(index)}
                                                        >
                                                            Add Step Here
                                                        </Button>
                                                    </Space>
                                                </div>
                                            </div>
                                            ) : (
                                            // Preparation Step
                                            <div
                                                key={item.id}
                                                style={{
                                                    background: '#fff',
                                                    border: '2px solid #1890ff',
                                                    borderRadius: '12px',
                                                    padding: '24px',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Preparation Header */}
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
                                                            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                            fontSize: '16px',
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <Text strong style={{ fontSize: '16px', color: '#111827' }}>
                                                                Preparation/Checking Step {index + 1}
                                                            </Text>
                                                            <Tag color="blue" style={{ marginLeft: '8px' }}>
                                                                Preparation
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Button
                                                            type="text"
                                                            icon={<ArrowUpOutlined />}
                                                            onClick={() => handleMoveStep(item.id, 'up')}
                                                            disabled={index === 0}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<ArrowDownOutlined />}
                                                            onClick={() => handleMoveStep(item.id, 'down')}
                                                            disabled={index === allSteps.length - 1}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEditPreparationStep(index)}
                                                            size="small"
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteStep(item.id)}
                                                            size="small"
                                                        />
                                                    </Space>
                                                </div>

                                                {/* Preparation Questions */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {item.questions && item.questions.map((q, qIdx) => (
                                                        <div
                                                            key={qIdx}
                                                            style={{
                                                                background: '#f9fafb',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                padding: '12px 16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                            }}
                                                        >
                                                            {q.hasCheckbox && (
                                                                <Checkbox disabled style={{ flexShrink: 0 }} />
                                                            )}
                                                            <Text style={{ fontSize: '14px', flex: 1 }}>
                                                                {q.question}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Insert buttons between items */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'center', 
                                                    marginTop: '16px',
                                                    paddingTop: '16px',
                                                    borderTop: '1px dashed #e5e7eb',
                                                }}>
                                                    <Space>
                                                        <Button
                                                            type="dashed"
                                                            size="small"
                                                            icon={<CheckSquareOutlined />}
                                                            onClick={() => handleOpenPreparationModal(index)}
                                                        >
                                                            Add Preparation Here
                                                        </Button>
                                                        <Button
                                                            type="dashed"
                                                            size="small"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => handleAddStep(index)}
                                                        >
                                                            Add Step Here
                                                        </Button>
                                                    </Space>
                                                </div>
                                            </div>
                                            )
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

            {/* Preparation Question Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquareOutlined />
                        <span>{editingStepIndex !== null ? 'Edit Preparation Step' : 'Add Preparation Questions'}</span>
                    </div>
                }
                open={preparationModalVisible}
                onCancel={handleClosePreparationModal}
                onOk={handleAddPreparationQuestions}
                okText={editingStepIndex !== null ? 'Update' : 'Add All'}
                cancelText="Cancel"
                width={700}
            >
                <Form
                    form={preparationForm}
                    layout="vertical"
                    initialValues={{
                        questions: [{ question: '', hasCheckbox: true }]
                    }}
                >
                    <Form.List name="questions">
                        {(fields, { add, remove }) => (
                            <>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {editingStepIndex !== null 
                                            ? 'Edit the question below' 
                                            : 'Add multiple preparation/checking questions. Each question can have its own checkbox.'}
                                    </Text>
                                </div>
                                
                                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <div
                                            key={key}
                                            style={{
                                                background: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <Text strong style={{ fontSize: '14px', color: '#374151' }}>
                                                    Question {index + 1}
                                                </Text>
                                                {fields.length > 1 && editingStepIndex === null && (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                        size="small"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'question']}
                                                rules={[
                                                    { required: true, message: 'Please enter a question' },
                                                    { max: 500, message: 'Question must be less than 500 characters' },
                                                ]}
                                                style={{ marginBottom: '12px' }}
                                            >
                                                <Input.TextArea
                                                    placeholder="Enter preparation/checking question (e.g., Check all raw materials are available)"
                                                    rows={3}
                                                    maxLength={500}
                                                    showCount
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'hasCheckbox']}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox>Include checkbox for this question</Checkbox>
                                            </Form.Item>
                                        </div>
                                    ))}
                                </div>

                                {editingStepIndex === null && (
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        block
                                        style={{
                                            marginTop: '12px',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        Add Another Question
                                    </Button>
                                )}
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

export default CreateRecipe;
