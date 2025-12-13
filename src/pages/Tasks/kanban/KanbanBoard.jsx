import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {Container, Row, Col} from 'reactstrap';
import {PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MoreOutlined, SwapOutlined, CheckCircleOutlined, AppstoreOutlined, UnorderedListOutlined} from '@ant-design/icons';
import {Tabs, message, Modal, Space, Drawer, Tag, Avatar, Typography, Divider, DatePicker, List, Spin, Empty, Popconfirm, Dropdown, Button, Radio} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {kanbanUsers} from './data/users';
import dayjs from 'dayjs';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import AddPhaseModal from './AddPhaseModal';
import AddTaskModal from './AddTaskModal';
import MoveTaskPhaseModal from './MoveTaskPhaseModal';
import TaskListView from './TaskListView';
import TaskCard from './TaskCard';
import {useKanban} from './hooks/useKanban';
import {updateTask, deleteTask} from '../../../slices/tasks/thunk';
import {useDispatch} from 'react-redux';
import * as taskService from '../../../service/taskService';
import * as phaseService from '../../../service/phaseService';
import {TASK_STATUS} from './types';
import {getAllStatuses} from './services/kanbanService';
import './KanbanBoard.css';
import StatusColumn from './StatusColumn';

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;

const KanbanBoard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        phases,
        organizedData,
        taskList,
        addPhase,
        updatePhase,
        deletePhase,
        handleTaskDragEnd,
        refreshTasks,
    } = useKanban();

    const [activeId, setActiveId] = useState(null);
    const [addPhaseModalVisible, setAddPhaseModalVisible] = useState(false);
    const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
    const [selectedPhaseId, setSelectedPhaseId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingPhase, setEditingPhase] = useState(null);
    const [activeTab, setActiveTab] = useState(phases[0]?.id || null);
    const [detailTask, setDetailTask] = useState(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [phaseFilters, setPhaseFilters] = useState({});
    const [commentContent, setCommentContent] = useState('');
    const [taskComments, setTaskComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [moveTaskModalVisible, setMoveTaskModalVisible] = useState(false);
    const [pendingCompletedTask, setPendingCompletedTask] = useState(null);
    const [pendingTaskUpdate, setPendingTaskUpdate] = useState(null);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

    // Set initial tab when phases load
    useEffect(() => {
        if (phases.length > 0 && !activeTab) {
            setActiveTab(phases[0].id);
        }
    }, [phases, activeTab]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeTask = activeId ? taskList.find((task) => task._id === activeId) : null;
    const selectedPhase = phases.find(p => p.id === activeTab);
    const selectedPhaseData = organizedData[activeTab];

    const handlePhaseFilterChange = (phaseId, range) => {
        setPhaseFilters((prev) => ({
            ...prev,
            [phaseId]: {
                ...(prev[phaseId] || {}),
                dateRange: range && range[0] && range[1] ? range : null,
            },
        }));
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const {active, over} = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Check if dragging a task - find by _id (used in drag-and-drop) or id
        const task = taskList.find((t) => t._id === activeId || t.id === activeId);
        if (!task) {
            console.error('Task not found for drag:', activeId);
            return;
        }

        // Parse the over ID to determine destination
        let newPhaseId = task.phaseId;
        let newStatus = task.status;
        let newOrder = 0;

        // Check if dropped on a status column
        // Use colon separator to avoid conflicts with UUIDs (which contain hyphens)
        if (overId.toString().startsWith('status:')) {
            const parts = overId.toString().split(':');
            if (parts.length >= 3) {
                const parsedPhaseId = parts[1]; // phaseId (UUID)
                const parsedStatus = parts[2]; // status
                
                // Verify the phase exists and get its UUID
                const targetPhase = phases.find(p => p.id === parsedPhaseId);
                if (targetPhase) {
                    newPhaseId = targetPhase.id; // Use the phase's UUID
                    newStatus = parsedStatus;
                } else {
                    console.error('Phase not found:', parsedPhaseId);
                    return;
                }
            }

            // Calculate new order (add to end)
            const phaseData = organizedData[newPhaseId];
            if (phaseData) {
                const statusTasks = phaseData.statuses[newStatus] || [];
                newOrder = statusTasks.length;
            }
        } else {
            // Dropped on another task - calculate position
            const overTask = taskList.find((t) => t._id === overId || t.id === overId);
            if (overTask) {
                // Ensure we use the phase UUID, not a temporary ID
                const targetPhase = phases.find(p => p.id === overTask.phaseId);
                newPhaseId = targetPhase ? targetPhase.id : overTask.phaseId;
                newStatus = overTask.status;
                newOrder = overTask.order || 0;
            }
        }

        const originalOrder = task.order ?? 0;
        const hasChanged =
            newPhaseId !== task.phaseId ||
            newStatus !== task.status ||
            newOrder !== originalOrder;

        if (!hasChanged) {
            return;
        }

        // Check if task is being moved to "completed" status
        if (newStatus === 'completed' && task.status !== 'completed') {
            // Store the task and update info for the modal
            setPendingCompletedTask(task);
            setPendingTaskUpdate({ newPhaseId, newStatus, newOrder, activeId, originalPhaseId: task.phaseId, originalStatus: task.status, originalOrder: task.order });
            setMoveTaskModalVisible(true);
            return; // Don't update yet, wait for user decision
        }

        // Update task
        await handleTaskDragEnd(activeId, newPhaseId, newStatus, newOrder);
        message.success('Task moved successfully');
    };

    const handleAddPhase = async (phaseData) => {
        const newPhase = await addPhase(phaseData);
        setAddPhaseModalVisible(false);
        if (newPhase) {
            setActiveTab(newPhase.id);
            message.success('Phase added successfully');
        } else {
            message.error('Failed to create phase');
        }
    };

    const handleEditPhase = (phase) => {
        setEditingPhase(phase);
        setAddPhaseModalVisible(true);
    };

    const handleUpdatePhase = async (phaseData) => {
        if (editingPhase) {
            try {
                await updatePhase(editingPhase.id, phaseData);
                setEditingPhase(null);
                setAddPhaseModalVisible(false);
                message.success('Phase updated successfully');
            } catch (error) {
                message.error('Failed to update phase');
            }
        }
    };

    const handleDeletePhase = (phaseId) => {
        Modal.confirm({
            title: 'Delete Phase',
            content: 'Are you sure you want to delete this phase? All tasks in this phase will be moved to the first phase.',
            onOk: async () => {
                try {
                    await phaseService.deletePhase(phaseId);
                    deletePhase(phaseId);
                    if (activeTab === phaseId && phases.length > 1) {
                        const remainingPhases = phases.filter(p => p.id !== phaseId);
                        setActiveTab(remainingPhases[0]?.id || null);
                    }
                    message.success('Phase deleted successfully');
                } catch (error) {
                    console.error('Error deleting phase:', error);
                    message.error('Failed to delete phase');
                }
            },
        });
    };

    const handleAddTask = (statusId) => {
        setSelectedPhaseId(activeTab);
        setSelectedTask(null);
        setAddTaskModalVisible(true);
        setIsDetailDrawerOpen(false);
    };

    const handleViewTask = async (task) => {
        setDetailTask(task);
        setIsDetailDrawerOpen(true);
        setCommentContent('');
        // Load comments for this task from API
        await loadTaskComments(task.id || task._id);
    };

    // Load comments for a task
    const loadTaskComments = async (taskId) => {
        if (!taskId) return;
        
        try {
            setLoadingComments(true);
            const response = await taskService.getTaskComments(taskId);
            
            // Handle response structure
            let comments = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    comments = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    comments = response.data.data;
                }
            }
            
            // Transform comments for display
            const transformedComments = comments.map(comment => ({
                id: comment.id,
                comment: comment.comment,
                ownerId: comment.ownerId,
                owner: comment.owner || null,
                ownerName: comment.ownerName || comment.owner?.userName || comment.owner?.name || 'Unknown',
                ownerEmail: comment.ownerEmail || comment.owner?.email || '',
                commentedDate: comment.commentedDate || comment.createdAt,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            }));
            
            setTaskComments(transformedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            message.error('Failed to load comments');
            setTaskComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCloseDrawer = () => {
        setIsDetailDrawerOpen(false);
        setDetailTask(null);
        setTaskComments([]);
        setCommentContent('');
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setSelectedPhaseId(task.phaseId);
        setAddTaskModalVisible(true);
        setIsDetailDrawerOpen(false);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (selectedTask) {
                // Update existing task
                // Build clean request body according to API structure
                const updateData = {
                    task: taskData.task,
                    phaseId: taskData.phaseId || selectedTask.phaseId,
                    status: taskData.status,
                    comments: taskData.comments !== undefined && taskData.comments !== null ? taskData.comments : (selectedTask?.comments || 0),
                    views: taskData.views !== undefined && taskData.views !== null ? taskData.views : (selectedTask?.views || 0),
                    order: taskData.order !== undefined && taskData.order !== null ? taskData.order : (selectedTask?.order || 0),
                };

                // Add optional fields only if they exist
                if (taskData.description !== undefined && taskData.description !== null && taskData.description !== '') {
                    updateData.description = taskData.description;
                }
                if (taskData.priority !== undefined && taskData.priority !== null) {
                    updateData.priority = taskData.priority;
                }
                if (taskData.dueDate !== undefined && taskData.dueDate !== null) {
                    updateData.dueDate = taskData.dueDate;
                }
                // Use assignedUserId (UUID)
                if (taskData.assignedUserId !== undefined && taskData.assignedUserId !== null) {
                    updateData.assignedUserId = taskData.assignedUserId;
                }
                // Add costingId if provided
                if (taskData.costingId !== undefined && taskData.costingId !== null) {
                    updateData.costingId = taskData.costingId;
                }
                // Add batchSize if provided
                if (taskData.batchSize !== undefined && taskData.batchSize !== null) {
                    updateData.batchSize = taskData.batchSize;
                }
                // Add rawMaterials if provided
                if (taskData.rawMaterials !== undefined && Array.isArray(taskData.rawMaterials) && taskData.rawMaterials.length > 0) {
                    updateData.rawMaterials = taskData.rawMaterials;
                }
                
                // Ensure taskId, id, _id, and updatedBy are never included
                if ('taskId' in updateData) delete updateData.taskId;
                if ('id' in updateData) delete updateData.id;
                if ('_id' in updateData) delete updateData._id;
                if ('updatedBy' in updateData) delete updateData.updatedBy;

                // Log final object to console
                console.log('Final Task Data to be sent to backend (UPDATE):', JSON.stringify(updateData, null, 2));
                
                // Check if status is being changed to "completed"
                const isStatusChangingToCompleted = updateData.status === 'completed' && selectedTask.status !== 'completed';
                
                // If status is changing to completed, show modal first
                if (isStatusChangingToCompleted) {
                    setPendingCompletedTask(selectedTask);
                    setPendingTaskUpdate({ updateData, isUpdate: true });
                    setMoveTaskModalVisible(true);
                    setAddTaskModalVisible(false); // Close edit modal
                    return; // Don't update yet, wait for user decision
                }
                
                // Use the task's UUID (id) for the API call
                const taskUuid = selectedTask.id || selectedTask._id;
                if (!taskUuid) {
                    message.error('Task ID not found');
                    return;
                }
                
                const response = await taskService.updateTask(taskUuid, updateData);
                
                if (response.success || response.data) {
                    // Extract updated task data from response
                    const updatedTaskData = response.data?.data || response.data || {};
                    const taskUuid = updatedTaskData.id || updatedTaskData._id || selectedTask.id || selectedTask._id;
                    
                    // Ensure both id and _id are set to the backend UUID
                    const updatedTask = {
                        ...selectedTask,
                        ...updateData,
                        id: taskUuid, // Primary ID - UUID from backend
                        _id: taskUuid, // Also set _id to same value for drag-and-drop compatibility
                    };
                    dispatch(updateTask(updatedTask));
                    // Refresh task list to get latest data
                    await refreshTasks();
                    message.success('Task updated successfully');
                } else {
                    message.error(response.message || 'Failed to update task');
                }
            } else {
                // Create new task
                // Build clean request body according to API structure
                const createData = {
                    task: taskData.task,
                    phaseId: taskData.phaseId || selectedPhaseId || activeTab || phases[0]?.id,
                    status: taskData.status || TASK_STATUS.PENDING,
                    comments: taskData.comments !== undefined && taskData.comments !== null ? taskData.comments : 0,
                    views: taskData.views !== undefined && taskData.views !== null ? taskData.views : 0,
                    order: taskData.order !== undefined && taskData.order !== null ? taskData.order : 0,
                };

                // Add optional fields only if they exist
                if (taskData.description !== undefined && taskData.description !== null && taskData.description !== '') {
                    createData.description = taskData.description;
                }
                if (taskData.priority !== undefined && taskData.priority !== null) {
                    createData.priority = taskData.priority;
                }
                if (taskData.dueDate !== undefined && taskData.dueDate !== null) {
                    createData.dueDate = taskData.dueDate;
                }
                // Use assignedUserId (UUID)
                if (taskData.assignedUserId !== undefined && taskData.assignedUserId !== null) {
                    createData.assignedUserId = taskData.assignedUserId;
                }
                // Add costingId if provided
                if (taskData.costingId !== undefined && taskData.costingId !== null) {
                    createData.costingId = taskData.costingId;
                }
                // Add batchSize if provided
                if (taskData.batchSize !== undefined && taskData.batchSize !== null) {
                    createData.batchSize = taskData.batchSize;
                }
                // Add rawMaterials if provided
                if (taskData.rawMaterials !== undefined && Array.isArray(taskData.rawMaterials) && taskData.rawMaterials.length > 0) {
                    createData.rawMaterials = taskData.rawMaterials;
                }
                
                // Ensure taskId, id, _id, and updatedBy are never included
                if ('taskId' in createData) delete createData.taskId;
                if ('id' in createData) delete createData.id;
                if ('_id' in createData) delete createData._id;
                if ('updatedBy' in createData) delete createData.updatedBy;

                // Log final object to console
                console.log('Final Task Data to be sent to backend (CREATE):', JSON.stringify(createData, null, 2));
                
                const response = await taskService.createTask(createData);
                
                if (response.success || response.data || response.status === 201) {
                    // Don't manually add to Redux - let refreshTasks() fetch the latest data from backend
                    // This ensures we have the correct, complete task data from the server
                    await refreshTasks();
                    message.success('Task created successfully');
                } else {
                    message.error(response.message || 'Failed to create task');
                }
            }
            setAddTaskModalVisible(false);
            setSelectedTask(null);
            setSelectedPhaseId(null);
            setDetailTask(null);
        } catch (error) {
            console.error('Error saving task:', error);
            message.error(error.message || 'Failed to save task');
        }
    };

    // Handle move task decision from modal
    const handleMoveTaskDecision = async (movementData) => {
        if (!pendingCompletedTask) return;

        try {
            const taskId = pendingCompletedTask.id || pendingCompletedTask._id;
            
            if (movementData === null) {
                // User chose "No" - just update status to completed without moving
                if (pendingTaskUpdate?.isUpdate) {
                    // Complete the update that was pending
                    const updateData = pendingTaskUpdate.updateData;
                    const response = await taskService.updateTask(taskId, updateData);
                    
                    if (response.success || response.data) {
                        await refreshTasks();
                        message.success('Task marked as completed');
                    }
                } else {
                    // Complete the drag-drop that was pending
                    const { newPhaseId, newStatus, newOrder, activeId } = pendingTaskUpdate;
                    await handleTaskDragEnd(activeId, newPhaseId, newStatus, newOrder);
                    message.success('Task marked as completed');
                }
            } else {
                // User chose "Yes" - move to another phase
                const response = await taskService.moveTaskToPhase(taskId, movementData);
                
                if (response.success || response.data) {
                    const updatedTask = response.data?.data || response.data || {};
                    const targetPhaseId = movementData.toPhaseId;
                    
                    // Switch to target phase tab
                    if (targetPhaseId && phases.find(p => p.id === targetPhaseId)) {
                        setActiveTab(targetPhaseId);
                    }
                    
                    // Refresh tasks
                    await refreshTasks();
                    
                    message.success(`Task moved to ${phases.find(p => p.id === targetPhaseId)?.name || 'target phase'} successfully`);
                } else {
                    message.error(response.message || 'Failed to move task');
                }
            }
        } catch (error) {
            console.error('Error handling move task decision:', error);
            message.error(error.response?.data?.message || 'Failed to process task movement');
            throw error;
        } finally {
            setMoveTaskModalVisible(false);
            setPendingCompletedTask(null);
            setPendingTaskUpdate(null);
        }
    };

    const handleDeleteTask = (task) => {
        Modal.confirm({
            title: 'Delete Task',
            content: 'Are you sure you want to delete this task?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    // Use the task's UUID (id) for the API call
                    const taskUuid = task.id || task._id;
                    if (!taskUuid) {
                        message.error('Task ID not found');
                        return;
                    }
                    
                    const response = await taskService.deleteTask(taskUuid);
                    console.log(response);
                    
                    if (response.status ===200) {
                        dispatch(deleteTask(taskUuid));
                        // Refresh task list to get latest data
                        await refreshTasks();
                        message.success('Task deleted successfully');
                        if (detailTask && (detailTask._id === task._id || detailTask.id === task.id)) {
                            handleCloseDrawer();
                        }
                    } else {
                        message.error(response.message || 'Failed to delete task');
                    }
                } catch (error) {
                    console.log(error.data.result);
                    
                    console.error('Error deleting task:', error);
                    message.error(error.message || 'Failed to delete task');
                }
            },
        });
    };

    const statuses = getAllStatuses();

    // Tab items with dropdown menu for phase actions
    const tabItems = phases.map((phase) => {
        const phaseData = organizedData[phase.id];
        const totalTasks = phaseData
            ? Object.values(phaseData.statuses).reduce((sum, tasks) => sum + tasks.length, 0)
            : 0;
        const filterRange = phaseFilters[phase.id]?.dateRange;
        const phaseStatusIds = phase.statuses && phase.statuses.length ? phase.statuses : statuses.map((s) => s.id);
        const statusesForPhase = phaseStatusIds
            .map((statusId) => statuses.find((status) => status.id === statusId))
            .filter(Boolean);

        return {
            key: phase.id,
            label: (
                <div className="d-flex align-items-center">
                    <span>{phase.name}</span>
                    {totalTasks > 0 && (
                        <span className="ms-2" style={{
                            backgroundColor: '#f0f0f0',
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 600
                        }}>
              {totalTasks}
            </span>
                    )}
                </div>
            ),
            children: viewMode === 'list' ? (
                <TaskListView
                    phases={phases}
                    organizedData={organizedData}
                    activeTab={phase.id}
                    onViewTask={handleViewTask}
                    onTaskEdit={handleEditTask}
                    onTaskDelete={handleDeleteTask}
                    onAddTask={(status) => handleAddTask(status)}
                    getAllStatuses={getAllStatuses}
                />
            ) : (
                <div>
                    <div
                        className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center row  gap-3">

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '16px',


                        }}>
                            <Space size="middle">
                                <RangePicker
                                    value={filterRange || null}
                                    onChange={(range) => handlePhaseFilterChange(phase.id, range)}
                                    allowClear
                                    size="middle"
                                />
                                <Button size="middle" onClick={() => handleEditPhase(phase)}>
                                    Update Phase
                                </Button>
                            </Space>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="kanban-board-full-width">
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '16px',
                                    overflowX: 'auto',
                                    overflowY: 'hidden',
                                    minHeight: 'calc(100vh - 300px)',
                                }}
                                className="status-lanes-container"
                            >
                                <SortableContext
                                    items={statusesForPhase.map((status) => status.id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    {statusesForPhase.map((statusItem) => {
                                        const rawTasks = phaseData?.statuses[statusItem.id] || [];
                                        const tasks = filterRange && filterRange[0] && filterRange[1]
                                            ? rawTasks.filter((task) => {
                                                if (!task.dueDate) return false;
                                                const taskDate = dayjs(task.dueDate, 'DD MMM, YYYY');
                                                if (!taskDate.isValid()) return false;
                                                const start = filterRange[0].startOf('day');
                                                const end = filterRange[1].endOf('day');
                                                return (
                                                    taskDate.isSame(start, 'day') ||
                                                    taskDate.isSame(end, 'day') ||
                                                    (taskDate.isAfter(start) && taskDate.isBefore(end))
                                                );
                                            })
                                            : rawTasks;
                                        return (
                                            <StatusColumn
                                                key={statusItem.id}
                                                status={statusItem.id}
                                                tasks={tasks}
                                                phaseId={phase.id}
                                                onViewTask={handleViewTask}
                                                onTaskEdit={handleEditTask}
                                                onTaskDelete={handleDeleteTask}
                                                onAddTask={() => handleAddTask(statusItem.id)}
                                            />
                                        );
                                    })}
                                </SortableContext>
                            </div>

                            <DragOverlay>
                                {activeTask ? (
                                    <div style={{opacity: 0.8, transform: 'rotate(5deg)'}}>
                                        <TaskCard task={activeTask}/>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </div>
                    </DndContext>
                </div>
            ),
        };
    });

    // Add phase tab
    tabItems.push({
        key: 'add-phase',
        label: (
            <Button
                type="primary"
                icon={<PlusOutlined/>}
                onClick={(e) => {
                    e.stopPropagation();
                    setEditingPhase(null);
                    setAddPhaseModalVisible(true);
                }}
                style={{border: 'none', boxShadow: 'none'}}
            >
                Add Phase
            </Button>
        ),
        children: null,
    });

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-0" style={{fontWeight: 600}}>
                                    Kanban Dashboard
                                </h4>
                            </div>
                            <Space>
                                {/* View Mode Toggle */}
                                <Radio.Group
                                    value={viewMode}
                                    onChange={(e) => setViewMode(e.target.value)}
                                    buttonStyle="solid"
                                    size="small"
                                >
                                    <Radio.Button value="kanban">
                                        <AppstoreOutlined style={{ marginRight: 4 }} />
                                        Kanban
                                    </Radio.Button>
                                    <Radio.Button value="list">
                                        <UnorderedListOutlined style={{ marginRight: 4 }} />
                                        List
                                    </Radio.Button>
                                </Radio.Group>
                                
                                {selectedPhase && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            icon={<EditOutlined/>}
                                            onClick={() => handleEditPhase(selectedPhase)}
                                        >
                                            Edit Phase
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            danger
                                            icon={<DeleteOutlined/>}
                                            onClick={() => handleDeletePhase(selectedPhase.id)}
                                        >
                                            Delete Phase
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </div>
                    </Col>
                </Row>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    size="large"
                    items={tabItems}
                    className="kanban-phase-tabs"
                />

                <AddPhaseModal
                    visible={addPhaseModalVisible}
                    onCancel={() => {
                        setAddPhaseModalVisible(false);
                        setEditingPhase(null);
                    }}
                    onOk={editingPhase ? handleUpdatePhase : handleAddPhase}
                    initialValues={editingPhase}
                />

                <AddTaskModal
                    visible={addTaskModalVisible}
                    onCancel={() => {
                        setAddTaskModalVisible(false);
                        setSelectedTask(null);
                        setSelectedPhaseId(null);
                    }}
                    onOk={handleSaveTask}
                    phaseId={selectedPhaseId}
                    initialValues={selectedTask}
                />

                <MoveTaskPhaseModal
                    visible={moveTaskModalVisible}
                    onCancel={() => {
                        // User cancelled - revert the drag operation by refreshing tasks
                        setMoveTaskModalVisible(false);
                        setPendingCompletedTask(null);
                        setPendingTaskUpdate(null);
                        // Refresh to revert any visual changes
                        refreshTasks();
                    }}
                    onOk={handleMoveTaskDecision}
                    task={pendingCompletedTask}
                    phases={phases}
                    currentPhaseId={pendingCompletedTask?.phaseId}
                />

                <Drawer
                    title={detailTask ? detailTask.task : 'Task Details'}
                    width={420}
                    open={isDetailDrawerOpen}
                    onClose={handleCloseDrawer}
                    destroyOnClose
                    extra={
                        detailTask ? (
                            <Space>
                                <Button 
                                    type="primary"
                                    onClick={() => {
                                        navigate('/task-details', { 
                                            state: { task: detailTask, phases: phases } 
                                        });
                                    }}
                                >
                                    See More
                                </Button>
                                <Button onClick={() => handleEditTask(detailTask)}>
                                    <EditOutlined className="me-1"/>
                                    Edit
                                </Button>
                                <Button danger onClick={() => handleDeleteTask(detailTask)}>
                                    <DeleteOutlined className="me-1"/>
                                    Delete
                                </Button>
                            </Space>
                        ) : null
                    }
                >
                    {detailTask ? (
                        <div className="kanban-task-drawer">
                            <div className="kanban-task-meta">
                                <div className="kanban-task-meta-row">
                                    <div>
                                        <div className="kanban-task-meta-label">STATUS</div>
                                        <Tag
                                            color={
                                                detailTask.status === 'completed'
                                                    ? 'green'
                                                    : detailTask.status === 'review'
                                                        ? 'orange'
                                                        : detailTask.status === 'ongoing'
                                                            ? 'blue'
                                                            : detailTask.status === 'pending'
                                                                ? 'default'
                                                                : 'red'
                                            }
                                        >
                                            {detailTask.statusLabel || detailTask.status}
                                        </Tag>
                                    </div>
                                    <div>
                                        <div className="kanban-task-meta-label">PRIORITY</div>
                                        <Tag
                                            color={
                                                detailTask.priority === 'high'
                                                    ? 'red'
                                                    : detailTask.priority === 'medium'
                                                        ? 'orange'
                                                        : 'default'
                                            }
                                        >
                                            {detailTask.priority || 'N/A'}
                                        </Tag>
                                    </div>
                                </div>
                                <div className="kanban-task-meta-row">
                                    <div>
                                        <div className="kanban-task-meta-label">DUE DATE</div>
                                        <div>{detailTask.dueDate || 'Not set'}</div>
                                    </div>
                                    <div>
                                        <div className="kanban-task-meta-label">PHASE</div>
                                        <div>{phases.find((p) => p.id === detailTask.phaseId)?.name || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="kanban-task-drawer-section">
                                <h5>Task Summary</h5>
                                <p style={{fontSize: 14, color: '#595959'}}>
                                    {detailTask.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="kanban-task-drawer-section">
                                <h5>Assigned To</h5>
                                {detailTask.assignees && detailTask.assignees.length > 0 ? (
                                    <div className="mt-2">
                                        {detailTask.assignees.map((assignee, index) => (
                                            <div key={assignee.id || index} className="d-flex align-items-center mb-3">
                                                <Avatar
                                                    src={
                                                        assignee.avatar
                                                            ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}`
                                                            : undefined
                                                    }
                                                    icon={!assignee.avatar ? <UserOutlined/> : undefined}
                                                    size={48}
                                                    style={{marginRight: 12}}
                                                />
                                                <div>
                                                    <div style={{fontWeight: 600, fontSize: 16}}>{assignee.name}</div>
                                                    {assignee.email && (
                                                        <div style={{fontSize: 12, color: '#8c8c8c'}}>{assignee.email}</div>
                                                    )}
                                                    <div style={{fontSize: 13, color: '#8c8c8c'}}>{assignee.role || 'Team Member'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : detailTask.assignee ? (
                                    <div className="d-flex align-items-center mt-2">
                                        <Avatar
                                            src={
                                                detailTask.assignee.avatar
                                                    ? `${process.env.REACT_APP_API_URL || ''}/images/users/${detailTask.assignee.avatar}`
                                                    : undefined
                                            }
                                            icon={!detailTask.assignee.avatar ? <UserOutlined/> : undefined}
                                            size={48}
                                            style={{marginRight: 12}}
                                        />
                                        <div>
                                            <div style={{fontWeight: 600, fontSize: 16}}>{detailTask.assignee.name}</div>
                                            {detailTask.assignee.email && (
                                                <div style={{fontSize: 12, color: '#8c8c8c'}}>{detailTask.assignee.email}</div>
                                            )}
                                            <div style={{fontSize: 13, color: '#8c8c8c'}}>{detailTask.assignee.role}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>Unassigned</div>
                                )}
                            </div>

                            {/* NEW: Costing Information */}
                            {detailTask.costing && (
                                <>
                                    <Divider/>
                                    <div className="kanban-task-drawer-section">
                                        <h5>Associated Product</h5>
                                        <div className="mt-2">
                                            <div style={{fontWeight: 600, fontSize: 16, marginBottom: 4}}>
                                                {detailTask.costing.itemName || 'Unnamed Product'}
                                            </div>
                                            {detailTask.costing.itemCode && (
                                                <div style={{fontSize: 13, color: '#8c8c8c', marginBottom: 4}}>
                                                    Code: {detailTask.costing.itemCode}
                                                </div>
                                            )}
                                            {detailTask.costing.version && (
                                                <Tag color="blue" style={{marginTop: 4, marginBottom: 8}}>
                                                    Version {detailTask.costing.version}
                                                </Tag>
                                            )}
                                            
                                            {/* Batch Size */}
                                            {detailTask.batchSize && (
                                                <div style={{marginTop: 12, marginBottom: 12}}>
                                                    <div style={{fontSize: 13, color: '#8c8c8c', marginBottom: 4}}>Batch Size:</div>
                                                    <Tag color="green" style={{fontSize: 13}}>
                                                        {(() => {
                                                            const batchSize = detailTask.batchSize;
                                                            const match = batchSize.match(/batch(\d+(?:\.\d+)?)kg/);
                                                            if (match) {
                                                                const kg = match[1].replace('_', '.');
                                                                return `${kg} kg`;
                                                            }
                                                            return batchSize.replace('batch', '').replace(/([A-Z])/g, ' $1').trim();
                                                        })()}
                                                    </Tag>
                                                </div>
                                            )}

                                            {/* Raw Materials */}
                                            {detailTask.rawMaterials && Array.isArray(detailTask.rawMaterials) && detailTask.rawMaterials.length > 0 && (
                                                <div style={{marginTop: 16}}>
                                                    <div style={{fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#595959'}}>
                                                        Raw Materials Required:
                                                    </div>
                                                    <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px'}}>
                                                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                                                            <thead>
                                                                <tr style={{borderBottom: '1px solid #f0f0f0', fontWeight: 600, backgroundColor: '#fafafa'}}>
                                                                    <th style={{padding: '6px 8px', textAlign: 'left'}}>Material</th>
                                                                    <th style={{padding: '6px 8px', textAlign: 'right'}}>%</th>
                                                                    <th style={{padding: '6px 8px', textAlign: 'right'}}>Amount</th>
                                                                    <th style={{padding: '6px 8px', textAlign: 'right'}}>Cost</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detailTask.rawMaterials.map((material, index) => (
                                                                    <tr key={material.rawMaterialId || index} style={{borderBottom: '1px solid #f0f0f0'}}>
                                                                        <td style={{padding: '6px 8px'}}>
                                                                            <div>
                                                                                <div style={{fontWeight: 500}}>{material.rawMaterialName || 'N/A'}</div>
                                                                                {material.category && (
                                                                                    <div style={{fontSize: '10px', color: '#8c8c8c'}}>
                                                                                        {material.category}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td style={{padding: '6px 8px', textAlign: 'right'}}>
                                                                            {parseFloat(material.percentage || 0).toFixed(2)}%
                                                                        </td>
                                                                        <td style={{padding: '6px 8px', textAlign: 'right'}}>
                                                                            {parseFloat(material.kg || 0).toFixed(2)} {material.units || 'kg'}
                                                                        </td>
                                                                        <td style={{padding: '6px 8px', textAlign: 'right', fontWeight: 500}}>
                                                                            LKR {parseFloat(material.cost || 0).toLocaleString('en-US', { 
                                                                                minimumFractionDigits: 2, 
                                                                                maximumFractionDigits: 2 
                                                                            })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr style={{borderTop: '2px solid #1890ff', fontWeight: 600, backgroundColor: '#f0f8ff'}}>
                                                                    <td colSpan={3} style={{padding: '6px 8px', textAlign: 'right'}}>
                                                                        Total Cost:
                                                                    </td>
                                                                    <td style={{padding: '6px 8px', textAlign: 'right', color: '#1890ff'}}>
                                                                        LKR {detailTask.rawMaterials
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
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="kanban-task-drawer-section">
                                <h5>Activity</h5>
                                <ul className="kanban-task-timeline">
                                    <li>
                                        <span>Phase</span>
                                        <span>{phases.find((p) => p.id === detailTask.phaseId)?.name || 'N/A'}</span>
                                    </li>
                                    <li>
                                        <span>Status</span>
                                        <span>{detailTask.statusLabel || detailTask.status}</span>
                                    </li>
                                    <li>
                                        <span>Comments</span>
                                        <span>{taskComments.length || detailTask.comments || 0}</span>
                                    </li>
                                    <li>
                                        <span>Views</span>
                                        <span>{detailTask.views || 0}</span>
                                    </li>
                                </ul>
                            </div>

                            <Divider/>

                            <div className="kanban-task-drawer-section">
                                <h5>Comments ({taskComments.length})</h5>
                                
                                {/* Comments List */}
                                {loadingComments ? (
                                    <div style={{textAlign: 'center', padding: '20px'}}>
                                        <Spin size="large" />
                                    </div>
                                ) : taskComments.length > 0 ? (
                                    <List
                                        className="comment-list"
                                        itemLayout="horizontal"
                                        dataSource={taskComments}
                                        style={{marginTop: 16, marginBottom: 16}}
                                        renderItem={(comment) => {
                                            // Get current user for delete permission
                                            const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
                                            const currentUserId = currentUser.user?.id || currentUser.user?._id || currentUser.id || currentUser._id;
                                            const canDelete = comment.ownerId === currentUserId;
                                            
                                            // Handle delete action
                                            const handleDeleteComment = async () => {
                                                try {
                                                    await taskService.deleteTaskComment(comment.id);
                                                    message.success('Comment deleted successfully');
                                                    // Reload comments
                                                    await loadTaskComments(detailTask.id || detailTask._id);
                                                    // Refresh task to update comment count
                                                    await refreshTasks();
                                                } catch (error) {
                                                    console.error('Error deleting comment:', error);
                                                    message.error(error.response?.data?.message || 'Failed to delete comment');
                                                }
                                            };
                                            
                                            // Menu items for the dot menu
                                            const menuItems = canDelete ? [
                                                {
                                                    key: 'delete',
                                                    label: (
                                                        <span style={{ color: '#ff4d4f' }}>
                                                            <DeleteOutlined style={{ marginRight: 8 }} />
                                                            Delete
                                                        </span>
                                                    ),
                                                    danger: true,
                                                    onClick: () => {
                                                        Modal.confirm({
                                                            title: 'Delete comment',
                                                            content: 'Are you sure you want to delete this comment? This action cannot be undone.',
                                                            okText: 'Yes, Delete',
                                                            okType: 'danger',
                                                            cancelText: 'Cancel',
                                                            onOk: handleDeleteComment,
                                                        });
                                                    },
                                                },
                                            ] : [];
                                            
                                            return (
                                                <List.Item
                                                    style={{
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        position: 'relative',
                                                    }}
                                                    actions={canDelete ? [
                                                        <Space key="actions" size="small">
                                                            <Popconfirm
                                                                title="Delete comment"
                                                                description="Are you sure you want to delete this comment?"
                                                                onConfirm={handleDeleteComment}
                                                                okText="Yes"
                                                                cancelText="No"
                                                                okButtonProps={{ danger: true }}
                                                            >
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    size="small"
                                                                    icon={<DeleteOutlined />}
                                                                    style={{
                                                                        color: '#ff4d4f',
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </Popconfirm>
                                                            <Dropdown
                                                                menu={{ items: menuItems }}
                                                                trigger={['click']}
                                                                placement="bottomRight"
                                                            >
                                                                <Button
                                                                    type="text"
                                                                    icon={<MoreOutlined />}
                                                                    size="small"
                                                                    style={{
                                                                        color: '#8c8c8c',
                                                                        border: 'none',
                                                                        boxShadow: 'none',
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </Dropdown>
                                                        </Space>
                                                    ] : []}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar 
                                                                src={
                                                                    comment.owner?.avatar 
                                                                        ? `${process.env.REACT_APP_API_URL || ''}/images/users/${comment.owner.avatar}`
                                                                        : undefined
                                                                }
                                                                icon={!comment.owner?.avatar ? <UserOutlined/> : undefined}
                                                                style={{backgroundColor: '#1890ff'}}
                                                            >
                                                                {!comment.owner?.avatar && comment.ownerName ? comment.ownerName.charAt(0).toUpperCase() : null}
                                                            </Avatar>
                                                        }
                                                        title={
                                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
                                                                <div>
                                                                    <span style={{fontWeight: 600, fontSize: 14}}>{comment.ownerName}</span>
                                                                    {comment.ownerEmail && (
                                                                        <span style={{fontSize: '12px', color: '#8c8c8c', marginLeft: 8}}>
                                                                            {comment.ownerEmail}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span style={{fontSize: '12px', color: '#8c8c8c'}}>
                                                                    {dayjs(comment.commentedDate || comment.createdAt).format('MMM DD, YYYY HH:mm')}
                                                                </span>
                                                            </div>
                                                        }
                                                        description={
                                                            <div 
                                                                dangerouslySetInnerHTML={{__html: comment.comment}}
                                                                style={{
                                                                    marginTop: '8px',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1.6',
                                                                    color: '#595959'
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                ) : (
                                    <Empty 
                                        description="No comments yet" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        style={{margin: '20px 0'}}
                                    />
                                )}

                                {/* Comment Editor */}
                                <Divider style={{margin: '16px 0'}} />
                                <div className="mt-3">
                                    <div className="mb-2">
                                        <ReactQuill
                                            theme="snow"
                                            value={commentContent}
                                            onChange={setCommentContent}
                                            placeholder="Add a comment... Use @ to mention assigned team members"
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    ['blockquote', 'code-block'],
                                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ],
                                            }}
                                            style={{minHeight: '120px', marginBottom: '8px'}}
                                        />
                                    </div>
                                    
                                    {/* Mention Helper - Show assigned users */}
                                    {detailTask.assignees && detailTask.assignees.length > 0 && (
                                        <div className="mb-2" style={{fontSize: '12px', color: '#8c8c8c', marginBottom: '8px'}}>
                                            <Text type="secondary">Mention: </Text>
                                            {detailTask.assignees.map((assignee, idx) => (
                                                <span key={assignee.id || idx}>
                                                    <Text code style={{fontSize: '11px'}}>@{assignee.name || assignee.userName}</Text>
                                                    {idx < detailTask.assignees.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <Button 
                                        type="primary" 
                                        loading={submittingComment}
                                        onClick={async () => {
                                            if (!commentContent.trim() || !commentContent.replace(/<[^>]*>/g, '').trim()) {
                                                message.warning('Please enter a comment');
                                                return;
                                            }
                                            
                                            try {
                                                setSubmittingComment(true);
                                                
                                                // Get current user
                                                const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
                                                const currentUserId = currentUser.user?.id || currentUser.user?._id || currentUser.id || currentUser._id;
                                                
                                                // Prepare comment data
                                                const commentData = {
                                                    comment: commentContent,
                                                };
                                                
                                                // Add ownerId if available
                                                if (currentUserId) {
                                                    commentData.ownerId = currentUserId;
                                                }
                                                
                                                // Get task ID
                                                const taskId = detailTask.id || detailTask._id;
                                                
                                                // Submit comment
                                                await taskService.addTaskComment(taskId, commentData);
                                                
                                                // Clear editor
                                                setCommentContent('');
                                                
                                                // Reload comments
                                                await loadTaskComments(taskId);
                                                
                                                // Refresh task to update comment count
                                                await refreshTasks();
                                                
                                                message.success('Comment added successfully');
                                            } catch (error) {
                                                console.error('Error adding comment:', error);
                                                message.error(error.response?.data?.message || 'Failed to add comment');
                                            } finally {
                                                setSubmittingComment(false);
                                            }
                                        }}
                                    >
                                        Add Comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>No task selected</div>
                    )}
                </Drawer>
            </Container>
        </div>
    );
};

export default KanbanBoard;
