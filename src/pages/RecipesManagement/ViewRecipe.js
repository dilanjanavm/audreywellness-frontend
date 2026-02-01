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
    Tag,
    Descriptions,
    Divider,
    Popconfirm,
    Tabs,
    Empty,
} from 'antd';
import {
    ArrowLeftOutlined,
    ClockCircleOutlined,
    FireOutlined,
    FileTextOutlined,
    EditOutlined,
    CheckCircleOutlined,
    HistoryOutlined,
    StarOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import * as recipeService from '../../service/recipeService';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ViewRecipe = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [allVersions, setAllVersions] = useState([]);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [settingActive, setSettingActive] = useState(false);
    const [mainRecipeData, setMainRecipeData] = useState(null); // Store main data for reference

    useEffect(() => {
        if (id) {
            loadRecipe(id);
        }
    }, [id]);

    const loadRecipe = async (recipeId) => {
        setLoading(true);
        try {
            // Load recipe with all versions
            const response = await recipeService.getRecipeById(recipeId, { includeVersions: true });
            if (response && response.data) {
                const data = response.data.data || response.data;

                // Store main recipe data for reference (contains complete preparationQuestions)
                setMainRecipeData(data);

                // Set all versions
                if (data.allVersions && Array.isArray(data.allVersions)) {
                    const sortedVersions = data.allVersions.sort((a, b) => (b.version || 0) - (a.version || 0));
                    setAllVersions(sortedVersions);

                    // Set current version as selected (active version or latest)
                    const activeVersion = sortedVersions.find(v => v.isActiveVersion) || sortedVersions[0];
                    if (activeVersion) {
                        setSelectedVersionId(activeVersion.id);
                        // Merge version data with main data's preparationQuestions if version doesn't have them
                        // This ensures we always have complete data including preparationQuestions
                        const recipeData = {
                            ...activeVersion,
                            preparationQuestions: (activeVersion.preparationQuestions && activeVersion.preparationQuestions.length > 0)
                                ? activeVersion.preparationQuestions
                                : (data.preparationQuestions || [])
                        };
                        setRecipe(recipeData);
                    } else {
                        // Fallback to main data if no active version found
                        setRecipe(data);
                    }
                } else {
                    // If no allVersions array, treat current recipe as the only version
                    setAllVersions([data]);
                    setSelectedVersionId(data.id);
                    setRecipe(data);
                }
            }
        } catch (error) {
            message.error('Failed to load recipe');
            navigate('/recipes-management');
        } finally {
            setLoading(false);
        }
    };

    const handleSetActiveVersion = async (versionId) => {
        setSettingActive(true);
        try {
            const response = await recipeService.setActiveVersion(versionId);

            // Handle successful response
            if (response && response.data) {
                const updatedRecipe = response.data.data || response.data;
                message.success('Version set as active successfully');

                // Update the selected version to the newly active one
                setSelectedVersionId(updatedRecipe.id);

                // Reload recipe to get updated data with all versions
                await loadRecipe(id);
            } else {
                message.success('Version set as active successfully');
                // Reload recipe to get updated data
                await loadRecipe(id);
            }
        } catch (error) {
            console.error('Error setting active version:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to set version as active';
            message.error(errorMessage);
        } finally {
            setSettingActive(false);
        }
    };

    const handleVersionSelect = (versionId) => {
        setSelectedVersionId(versionId);
        const selectedVersion = allVersions.find(v => v.id === versionId);
        if (selectedVersion) {
            // Merge version data with main data's preparationQuestions if version doesn't have them
            const recipeData = {
                ...selectedVersion,
                preparationQuestions: (selectedVersion.preparationQuestions && selectedVersion.preparationQuestions.length > 0)
                    ? selectedVersion.preparationQuestions
                    : (mainRecipeData?.preparationQuestions || [])
            };
            setRecipe(recipeData);
        }
    };

    const getStatusColor = (status) => {
        const colorMap = {
            active: 'green',
            draft: 'orange',
            archived: 'default',
        };
        return colorMap[status] || 'default';
    };

    // Helper function to combine steps and preparationQuestions into unified queue
    const getUnifiedSteps = (recipeData) => {
        if (!recipeData) return [];

        const unifiedSteps = [];

        // Add recipe steps - sort by order first
        if (recipeData.steps && Array.isArray(recipeData.steps)) {
            const sortedSteps = [...recipeData.steps].sort((a, b) => (a.order || 0) - (b.order || 0));
            sortedSteps.forEach(step => {
                unifiedSteps.push({
                    id: step.id,
                    type: 'step',
                    order: step.order || 0,
                    instruction: step.instruction,
                    temperature: step.temperature,
                    duration: step.duration,
                });
            });
        }

        // Add preparation steps - sort by order first
        if (recipeData.preparationQuestions && Array.isArray(recipeData.preparationQuestions) && recipeData.preparationQuestions.length > 0) {
            // Sort preparationQuestions by order before adding to unified queue
            const sortedPrepQuestions = [...recipeData.preparationQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));

            sortedPrepQuestions.forEach(prepGroup => {
                // Ensure questions within each prep group maintain their order (preserve array order)
                const questions = prepGroup.questions || [];
                if (questions.length > 0 || prepGroup.order !== undefined) {
                    unifiedSteps.push({
                        id: prepGroup.id,
                        type: 'preparation',
                        order: prepGroup.order || 0,
                        questions: questions, // Questions are already in order from backend array
                    });
                }
            });
        }

        // Sort unified steps by order
        return unifiedSteps.sort((a, b) => (a.order || 0) - (b.order || 0));
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

    if (!recipe) {
        return (
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="View Recipe" pageTitle="Recipes" />
                    <Card>
                        <div className="text-center" style={{ padding: '50px 0' }}>
                            <Text type="secondary">Recipe not found</Text>
                            <br />
                            <Button type="primary" onClick={() => navigate('/recipes-management')} className="mt-3">
                                Back to Recipes
                            </Button>
                        </div>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="View Recipe" pageTitle="Recipes" />

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
                                        {recipe.name || 'Recipe Details'}
                                    </Title>
                                    <Space>
                                        <Tag color={getStatusColor(recipe.status)}>
                                            {recipe.status?.toUpperCase() || 'DRAFT'}
                                        </Tag>
                                        {recipe.isActiveVersion && (
                                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                                Active Version
                                            </Tag>
                                        )}
                                        {recipe.version && (
                                            <Tag color="blue">Version {recipe.version}</Tag>
                                        )}
                                        {allVersions.length > 1 && (
                                            <Tag color="purple" icon={<HistoryOutlined />}>
                                                We have {allVersions.length} Versions
                                            </Tag>
                                        )}
                                    </Space>
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
                                            {recipe.totalTime || 0} min
                                        </Text>
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Versions Tabs Section */}
                    {allVersions.length > 1 && (
                        <Card
                            style={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                marginBottom: '20px',
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <Tabs
                                activeKey={selectedVersionId}
                                onChange={handleVersionSelect}
                                type="card"
                                size="large"
                                style={{
                                    marginTop: '8px',
                                }}
                                items={allVersions.map((version) => {
                                    const isActive = version.isActiveVersion;
                                    return {
                                        key: version.id,
                                        label: (
                                            <Space size={8}>
                                                <Text strong>Version {version.version}</Text>
                                                {isActive && (
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#458533',
                                                        display: 'inline-block',
                                                        marginLeft: '4px',
                                                    }} />
                                                )}
                                            </Space>
                                        ),
                                        children: (
                                            <div style={{ padding: '16px 0' }}>
                                                <Row gutter={[16, 16]} align="middle">
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Status
                                                            </Text>
                                                            <Tag color={getStatusColor(version.status)}>
                                                                {version.status?.toUpperCase() || 'DRAFT'}
                                                            </Tag>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Total Time
                                                            </Text>
                                                            <Text strong>{version.totalTime || 0} min</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Total Items
                                                            </Text>
                                                            <Text strong>
                                                                {(version.steps?.length || 0) + (version.preparationQuestions?.length || 0)} items
                                                            </Text>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Created At
                                                            </Text>
                                                            <Text>
                                                                {version.createdAt
                                                                    ? dayjs(version.createdAt).format('MMM DD, YYYY HH:mm')
                                                                    : '-'}
                                                            </Text>
                                                        </Space>
                                                    </Col>
                                                    {!isActive && (
                                                        <Col xs={24}>
                                                            <Divider style={{ margin: '12px 0' }} />
                                                            <Popconfirm
                                                                title="Set as Active Version"
                                                                description="Are you sure you want to set this version as active? This will deactivate other versions."
                                                                onConfirm={() => handleSetActiveVersion(version.id)}
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <Button
                                                                    type="primary"
                                                                    icon={<StarOutlined />}
                                                                    loading={settingActive}
                                                                    style={{
                                                                        borderRadius: '8px',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Set as Active Version
                                                                </Button>
                                                            </Popconfirm>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </div>
                                        ),
                                    };
                                })}
                            />
                        </Card>
                    )}

                    {/* Recipe Information */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={8}>
                            <Card
                                style={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                            >
                                <Title level={5} style={{ marginBottom: '16px' }}>Recipe Information</Title>
                                <Descriptions column={1} size="small" bordered>
                                    <Descriptions.Item label="Product Name">
                                        <Text strong>{recipe.productName || recipe.itemName || recipe.product?.itemName || '-'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Product ID">
                                        <Text copyable>{recipe.productId || recipe.itemId}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Batch Size">
                                        <Tag color="blue">{recipe.batchSize}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Steps">
                                        {(recipe.steps?.length || 0) + (recipe.preparationQuestions?.length || 0)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Recipe Steps">
                                        {recipe.steps?.length || 0}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Preparation Steps">
                                        {recipe.preparationQuestions?.length || 0}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Ingredients">
                                        {recipe.ingredients?.length || 0}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Created At">
                                        {recipe.createdAt ? dayjs(recipe.createdAt).format('MMM DD, YYYY HH:mm') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Updated At">
                                        {recipe.updatedAt ? dayjs(recipe.updatedAt).format('MMM DD, YYYY HH:mm') : '-'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider />

                                {/* Ingredients Summary */}
                                <div>
                                    <Title level={5} style={{ marginBottom: '12px' }}>
                                        Ingredients ({recipe.ingredients?.length || 0})
                                    </Title>
                                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                        <div style={{
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                        }}>
                                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                                {recipe.ingredients.map((ing, idx) => (
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
                                            No ingredients available
                                        </Text>
                                    )}
                                </div>
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
                                        Recipe Steps & Preparation
                                    </Title>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => navigate(`/recipes/edit/${id}`)}
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Edit Recipe
                                    </Button>
                                </div>

                                {(() => {
                                    const unifiedSteps = getUnifiedSteps(recipe);

                                    if (unifiedSteps.length > 0) {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {unifiedSteps.map((item, index) => {
                                                    if (item.type === 'step') {
                                                        // Render Recipe Step
                                                        return (
                                                            <div
                                                                key={item.id || `step-${index}`}
                                                                style={{
                                                                    background: '#fff',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '12px',
                                                                    padding: '24px',
                                                                }}
                                                            >
                                                                {/* Step Header */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    marginBottom: '20px',
                                                                }}>
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
                                                                        {item.order || index + 1}
                                                                    </div>
                                                                    <Text strong style={{ fontSize: '16px', color: '#111827' }}>
                                                                        Step {item.order || index + 1}
                                                                    </Text>
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
                                                                        <FileTextOutlined style={{ marginRight: '6px' }} />
                                                                        Instruction
                                                                    </Text>
                                                                    <div style={{
                                                                        background: '#f9fafb',
                                                                        borderRadius: '8px',
                                                                        padding: '12px 16px',
                                                                        border: '1px solid #e5e7eb',
                                                                        minHeight: '60px',
                                                                        whiteSpace: 'pre-wrap',
                                                                    }}>
                                                                        <Text style={{ fontSize: '14px', color: '#111827' }}>
                                                                            {item.instruction || 'No instruction provided'}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                {/* Temperature and Duration */}
                                                                <Row gutter={16}>
                                                                    {item.temperature !== null && item.temperature !== undefined && (
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
                                                                            <div style={{
                                                                                background: '#f9fafb',
                                                                                borderRadius: '8px',
                                                                                padding: '12px 16px',
                                                                                border: '1px solid #e5e7eb',
                                                                            }}>
                                                                                <Text style={{ fontSize: '14px', color: '#111827' }}>
                                                                                    {item.temperature}°C
                                                                                </Text>
                                                                            </div>
                                                                        </Col>
                                                                    )}
                                                                    <Col xs={24} sm={item.temperature !== null && item.temperature !== undefined ? 12 : 24}>
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
                                                                        <div style={{
                                                                            background: '#f9fafb',
                                                                            borderRadius: '8px',
                                                                            padding: '12px 16px',
                                                                            border: '1px solid #e5e7eb',
                                                                        }}>
                                                                            <Text style={{ fontSize: '14px', color: '#111827' }}>
                                                                                {item.duration || 0} min
                                                                            </Text>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        );
                                                    } else if (item.type === 'preparation') {
                                                        // Render Preparation Step
                                                        return (
                                                            <div
                                                                key={item.id || `prep-${index}`}
                                                                style={{
                                                                    background: '#fff',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '12px',
                                                                    padding: '24px',
                                                                }}
                                                            >
                                                                {/* Preparation Header */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    marginBottom: '20px',
                                                                }}>
                                                                    <div style={{
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        borderRadius: '8px',
                                                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '16px',
                                                                    }}>
                                                                        {item.order || index + 1}
                                                                    </div>
                                                                    <Text strong style={{ fontSize: '16px', color: '#111827' }}>
                                                                        Preparation / Checking Step {item.order || index + 1}
                                                                    </Text>
                                                                </div>

                                                                {/* Questions */}
                                                                <div>
                                                                    <Text style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: 500,
                                                                        color: '#6b7280',
                                                                        display: 'block',
                                                                        marginBottom: '12px',
                                                                    }}>
                                                                        <CheckSquareOutlined style={{ marginRight: '6px' }} />
                                                                        Questions
                                                                    </Text>
                                                                    {item.questions && item.questions.length > 0 ? (
                                                                        <div style={{
                                                                            background: '#f9fafb',
                                                                            borderRadius: '8px',
                                                                            padding: '16px',
                                                                            border: '1px solid #e5e7eb',
                                                                        }}>
                                                                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                                                                {item.questions.map((question, qIdx) => (
                                                                                    <div
                                                                                        key={question.id || `q-${qIdx}`}
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'flex-start',
                                                                                            gap: '12px',
                                                                                            padding: '12px',
                                                                                            background: '#fff',
                                                                                            borderRadius: '6px',
                                                                                            border: '1px solid #e5e7eb',
                                                                                        }}
                                                                                    >
                                                                                        {question.hasCheckbox && (
                                                                                            <div style={{
                                                                                                width: '20px',
                                                                                                height: '20px',
                                                                                                border: '2px solid #8b5cf6',
                                                                                                borderRadius: '4px',
                                                                                                marginTop: '2px',
                                                                                                flexShrink: 0,
                                                                                            }} />
                                                                                        )}
                                                                                        <Text style={{
                                                                                            fontSize: '14px',
                                                                                            color: '#111827',
                                                                                            flex: 1,
                                                                                        }}>
                                                                                            {question.question || 'No question provided'}
                                                                                        </Text>
                                                                                    </div>
                                                                                ))}
                                                                            </Space>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{
                                                                            background: '#f9fafb',
                                                                            borderRadius: '8px',
                                                                            padding: '16px',
                                                                            border: '1px solid #e5e7eb',
                                                                        }}>
                                                                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                                                                No questions available
                                                                            </Text>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        );
                                    } else {
                                        return (
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
                                                    No steps or preparation items available
                                                </Text>
                                            </div>
                                        );
                                    }
                                })()}
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default ViewRecipe;

