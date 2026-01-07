import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, message, Spin, Tag, Avatar, Space, Descriptions, Card, Divider, Tabs } from 'antd';
import { 
    ArrowLeftOutlined, 
    UserOutlined, 
    CalendarOutlined,
    TagOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    TeamOutlined,
    MessageOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    BookOutlined
} from '@ant-design/icons';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import Comments from './Comments';
import * as taskService from '../../../service/taskService';
import dayjs from 'dayjs';
import StartRecipe from './StartRecipe';

const TaskDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [recipe, setRecipe] = useState(null);
    const [costedProduct, setCostedProduct] = useState(null);
    const [recipeExecution, setRecipeExecution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [phases, setPhases] = useState([]);
    const [activeTab, setActiveTab] = useState('details');

    document.title = "Tasks Details | Velzon - React Admin & Dashboard Template";

    useEffect(() => {
        // Get task from location state, params, or fetch by ID
        const taskId = id || location.state?.taskId || location.state?.task?.id || location.state?.task?.taskId;
        
        if (location.state?.task) {
            // Set initial task data from state
            setTask(location.state.task);
            if (location.state?.phases) {
                setPhases(location.state.phases);
            }
            // Always fetch full details with recipe information
            if (taskId) {
                loadTaskDetails(taskId);
            }
        } else if (taskId) {
            loadTaskDetails(taskId);
        } else {
            message.warning('No task data provided');
            navigate('/kanban-board');
        }
    }, [location, id]);

    const loadTaskDetails = async (taskId) => {
        try {
            setLoading(true);
            // Use the new details endpoint that includes recipe information
            const response = await taskService.getTaskDetails(taskId);
            if (response.data) {
                // Response structure: { statusCode: 200, data: { task, recipe, costedProduct, comments } }
                const responseData = response.data?.data || response.data;
                
                // Extract task data
                if (responseData.task) {
                    setTask(responseData.task);
                } else if (responseData.id || responseData.taskId) {
                    // Fallback: if data is directly the task object
                    setTask(responseData);
                }
                
                // Extract recipe data
                if (responseData.recipe) {
                    setRecipe(responseData.recipe);
                } else if (responseData.activeRecipe) {
                    setRecipe(responseData.activeRecipe);
                }
                
                // Extract costed product data
                if (responseData.costedProduct) {
                    setCostedProduct(responseData.costedProduct);
                }
                
                // Extract recipe execution data
                if (responseData.recipeExecution) {
                    setRecipeExecution(responseData.recipeExecution);
                }
                
                // Extract phases if available
                if (responseData.phases) {
                    setPhases(responseData.phases);
                }
            } else {
                message.error('Failed to load task details');
                navigate('/kanban-board');
            }
        } catch (error) {
            console.error('Error loading task details:', error);
            message.error('Failed to load task details');
            navigate('/kanban-board');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'default',
            ongoing: 'blue',
            review: 'orange',
            completed: 'green',
            failed: 'red',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'default',
            medium: 'blue',
            high: 'orange',
            urgent: 'red',
        };
        return colors[priority] || 'default';
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent',
        };
        return labels[priority] || priority || 'Not Set';
    };

    const formatBatchSize = (batchSize) => {
        if (!batchSize) return null;
        const match = batchSize.match(/batch(\d+(?:\.\d+)?)kg/);
        if (match) {
            const kg = match[1].replace('_', '.');
            return `${kg} kg`;
        }
        return batchSize.replace('batch', '').replace(/([A-Z])/g, ' $1').trim();
    };

    if (loading) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Loading task details...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>No task data available</p>
                        <Button onClick={() => navigate('/kanban-board')}>
                            <ArrowLeftOutlined /> Back to Kanban Board
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    const currentPhase = phases.find(p => p.id === task.phaseId) || null;

    return (
        <div className="page-content">
            <Container fluid>
                {/* Header Section */}
                <div style={{ 
                    marginBottom: 24, 
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg,rgb(33, 80, 10) 0%,rgb(28, 73, 1) 100%)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/kanban-board')}
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        >
                            Back to Kanban Board
                        </Button>
                        <Space>
                            <Tag color={getStatusColor(task.status)} style={{ fontSize: 13, padding: '4px 12px' }}>
                                {(task.status || '').toUpperCase()}
                            </Tag>
                            <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 13, padding: '4px 12px' }}>
                                {getPriorityLabel(task.priority)}
                            </Tag>
                        </Space>
                    </div>
                    <h2 style={{ 
                        color: 'white', 
                        margin: 0, 
                        fontSize: 28, 
                        fontWeight: 600,
                        marginBottom: 8
                    }}>
                        {task.task || 'Untitled Task'}
                    </h2>
                    <div style={{ 
                        display: 'flex', 
                        gap: 24, 
                        marginTop: 16,
                        fontSize: 14,
                        opacity: 0.9
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileTextOutlined />
                            <span>ID: {task.taskId || task.id || 'N/A'}</span>
                        </div>
                        {currentPhase && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <TagOutlined />
                                <span>Phase: {currentPhase.name}</span>
                            </div>
                        )}
                        {task.dueDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CalendarOutlined />
                                <span>Due: {dayjs(task.dueDate).format('MMM DD, YYYY')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs Section */}
                <Card 
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        marginBottom: 24
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        type="card"
                        size="large"
                        items={[
                            {
                                key: 'details',
                                label: (
                                    <span>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Task Details
                                    </span>
                                ),
                                children: (
                                    <div style={{ padding: 24 }}>
                                        <Row gutter={[24, 24]}>
                                            <Col xxl={6} lg={12} md={24}>
                        {/* Task Description */}
                        <Card 
                            title={
                                <span>
                                    <FileTextOutlined style={{ marginRight: 8 }} />
                                    Task Description
                                </span>
                            }
                            style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                            bodyStyle={{ padding: 24 }}
                        >
                            <p style={{ 
                                fontSize: 15, 
                                lineHeight: 1.8, 
                                color: '#595959',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {task.description || 'No description provided.'}
                            </p>
                        </Card>

                        {/* Task Information Card */}
                        <Card 
                            title={
                                <span>
                                    <FileTextOutlined style={{ marginRight: 8 }} />
                                    Task Information
                                </span>
                            }
                            style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Descriptions column={1} size="small" colon={false}>
                                <Descriptions.Item label="Task ID">
                                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                        {task.taskId || task.id || 'N/A'}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={getStatusColor(task.status)}>
                                        {(task.status || '').toUpperCase()}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Priority">
                                    <Tag color={getPriorityColor(task.priority)}>
                                        {getPriorityLabel(task.priority)}
                                    </Tag>
                                </Descriptions.Item>
                                {currentPhase && (
                                    <Descriptions.Item label="Phase">
                                        <Tag color="purple">{currentPhase.name}</Tag>
                                    </Descriptions.Item>
                                )}
                                {task.dueDate && (
                                    <Descriptions.Item label="Due Date">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <CalendarOutlined />
                                            <span>{dayjs(task.dueDate).format('MMM DD, YYYY')}</span>
                                        </div>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Created">
                                    {dayjs(task.createdAt).format('MMM DD, YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Updated">
                                    {dayjs(task.updatedAt).format('MMM DD, YYYY')}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Assigned To Card */}
                        {(task.assignedUser || task.assignee) && (
                            <Card 
                                title={
                                    <span>
                                        <TeamOutlined style={{ marginRight: 8 }} />
                                        Assigned To
                                    </span>
                                }
                                style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                bodyStyle={{ padding: 20, textAlign: 'center' }}
                            >
                                <Avatar
                                    src={
                                        (task.assignedUser?.avatar || task.assignee?.avatar)
                                            ? `${process.env.REACT_APP_API_URL || ''}/images/users/${task.assignedUser?.avatar || task.assignee?.avatar}`
                                            : undefined
                                    }
                                    icon={!task.assignedUser?.avatar && !task.assignee?.avatar ? <UserOutlined /> : undefined}
                                    size={80}
                                    style={{ marginBottom: 16 }}
                                />
                                <h5 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
                                    {task.assignedUser?.userName || task.assignedUser?.name || task.assignee?.name || 'Unknown'}
                                </h5>
                                {(task.assignedUser?.email || task.assignee?.email) && (
                                    <p style={{ 
                                        margin: 0, 
                                        marginBottom: 4,
                                        fontSize: 14, 
                                        color: '#8c8c8c' 
                                    }}>
                                        {task.assignedUser?.email || task.assignee?.email}
                                    </p>
                                )}
                                {(task.assignee?.role || task.assignedUser?.role) && (
                                    <Tag color="blue" style={{ marginTop: 8 }}>
                                        {task.assignee?.role || task.assignedUser?.role?.name || 'Team Member'}
                                    </Tag>
                                )}
                            </Card>
                        )}

                        {/* Activity Stats Card */}
                        <Card 
                            title={
                                <span>
                                    <EyeOutlined style={{ marginRight: 8 }} />
                                    Activity
                                </span>
                            }
                            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: 8
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MessageOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                                        <span style={{ fontWeight: 500 }}>Comments</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: 18, 
                                        fontWeight: 600,
                                        color: '#1890ff'
                                    }}>
                                        {task.comments || 0}
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: 8
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <EyeOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                                        <span style={{ fontWeight: 500 }}>Views</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: 18, 
                                        fontWeight: 600,
                                        color: '#52c41a'
                                    }}>
                                        {task.views || 0}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Col>

                     <Col xxl={6} lg={12} md={24}>
                        {/* Associated Product */}
                        {(task.costing || costedProduct) && (
                            <Card 
                                title={
                                    <span>
                                        <ShoppingOutlined style={{ marginRight: 8 }} />
                                        Associated Product
                                    </span>
                                }
                                style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                bodyStyle={{ padding: 24 }}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <h4 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
                                        {(costedProduct?.itemName || task.costing?.itemName) || 'Unnamed Product'}
                                    </h4>
                                    {(costedProduct?.itemCode || task.costing?.itemCode) && (
                                        <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 12 }}>
                                            Code: <strong>{costedProduct?.itemCode || task.costing?.itemCode}</strong>
                                        </div>
                                    )}
                                    <Space size="middle">
                                        {(costedProduct?.activeCostingVersion || task.costing?.version) && (
                                            <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                                                Version {costedProduct?.activeCostingVersion || task.costing?.version}
                                            </Tag>
                                        )}
                                        {task.batchSize && (
                                            <Tag color="green" style={{ fontSize: 13, padding: '4px 12px' }}>
                                                Batch Size: {formatBatchSize(task.batchSize)}
                                            </Tag>
                                        )}
                                        {costedProduct?.status && (
                                            <Tag color={costedProduct.status === 'Active' ? 'green' : 'default'} style={{ fontSize: 13, padding: '4px 12px' }}>
                                                {costedProduct.status}
                                            </Tag>
                                        )}
                                    </Space>
                                </div>

                                {/* Raw Materials Table */}
                                {task.rawMaterials && Array.isArray(task.rawMaterials) && task.rawMaterials.length > 0 && (
                                    <div>
                                        <Divider style={{ margin: '20px 0' }} />
                                        <h5 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
                                            Raw Materials Required
                                        </h5>
                                        <div style={{ 
                                            border: '1px solid #f0f0f0', 
                                            borderRadius: 8,
                                            overflow: 'hidden'
                                        }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ 
                                                        background: '#fafafa',
                                                        borderBottom: '2px solid #f0f0f0'
                                                    }}>
                                                        <th style={{ 
                                                            padding: '12px 16px', 
                                                            textAlign: 'left',
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                            color: '#595959'
                                                        }}>
                                                            Material
                                                        </th>
                                                        <th style={{ 
                                                            padding: '12px 16px', 
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                            color: '#595959'
                                                        }}>
                                                            %
                                                        </th>
                                                        <th style={{ 
                                                            padding: '12px 16px', 
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                            color: '#595959'
                                                        }}>
                                                            Amount
                                                        </th>
                                                        <th style={{ 
                                                            padding: '12px 16px', 
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                            color: '#595959'
                                                        }}>
                                                            Cost
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {task.rawMaterials.map((material, index) => (
                                                        <tr 
                                                            key={material.rawMaterialId || index}
                                                            style={{ 
                                                                borderBottom: index < task.rawMaterials.length - 1 ? '1px solid #f0f0f0' : 'none'
                                                            }}
                                                        >
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                                                                        {material.rawMaterialName || 'N/A'}
                                                                    </div>
                                                                    {material.category && (
                                                                        <div style={{ 
                                                                            fontSize: 12, 
                                                                            color: '#8c8c8c',
                                                                            marginTop: 4
                                                                        }}>
                                                                            {material.category}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                fontSize: 14
                                                            }}>
                                                                {parseFloat(material.percentage || 0).toFixed(2)}%
                                                            </td>
                                                            <td style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                fontSize: 14
                                                            }}>
                                                                {parseFloat(material.kg || 0).toFixed(2)} {material.units || 'kg'}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                fontWeight: 500,
                                                                fontSize: 14
                                                            }}>
                                                                LKR {parseFloat(material.cost || 0).toLocaleString('en-US', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr style={{ 
                                                        background: '#f6ffed',
                                                        borderTop: '2px solid #52c41a'
                                                    }}>
                                                        <td 
                                                            colSpan={3} 
                                                            style={{ 
                                                                padding: '12px 16px', 
                                                                textAlign: 'right',
                                                                fontWeight: 600,
                                                                fontSize: 14
                                                            }}
                                                        >
                                                            Total Cost:
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px 16px', 
                                                            textAlign: 'right',
                                                            fontWeight: 600,
                                                            fontSize: 15,
                                                            color: '#52c41a'
                                                        }}>
                                                            LKR {task.rawMaterials
                                                                .reduce((sum, m) => sum + parseFloat(m.cost || 0), 0)
                                                                .toLocaleString('en-US', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Comments Section */}
                        <Comments task={task} />
                                            </Col>
                                        </Row>
                                    </div>
                                ),
                            },
                            ...(recipe ? [{
                                key: 'recipe',
                                label: (
                                    <span>
                                        <PlayCircleOutlined style={{ marginRight: 8 }} />
                                        Start Recipe
                                    </span>
                                ),
                                children: (
                                    <div style={{ padding: 24 }}>
                                        <StartRecipe 
                                            task={task} 
                                            recipe={recipe}
                                            costedProduct={costedProduct}
                                            recipeExecution={recipeExecution}
                                        />
                                    </div>
                                ),
                            }] : []),
                        ]}
                    />
                </Card>
            </Container>
        </div>
    );
};

export default TaskDetails;
