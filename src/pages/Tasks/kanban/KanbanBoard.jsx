import React, {useState, useEffect} from 'react';
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
import {Button} from 'antd';
import {PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined} from '@ant-design/icons';
import {Tabs, message, Modal, Space, Drawer, Tag, Avatar, Typography, Divider, DatePicker, List} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {kanbanUsers} from './data/users';
import dayjs from 'dayjs';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import AddPhaseModal from './AddPhaseModal';
import AddTaskModal from './AddTaskModal';
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

    const handleViewTask = (task) => {
        setDetailTask(task);
        setIsDetailDrawerOpen(true);
        // Load comments for this task (you can fetch from API here)
        setTaskComments([]);
        setCommentContent('');
    };

    const handleCloseDrawer = () => {
        setIsDetailDrawerOpen(false);
        setDetailTask(null);
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
                // Build clean request body - only include allowed fields, exclude taskId
                const updateData = {
                    task: taskData.task,
                    phaseId: taskData.phaseId || selectedTask.phaseId,
                    status: taskData.status,
                };

                // Add optional fields only if they exist
                if (taskData.description !== undefined) updateData.description = taskData.description;
                if (taskData.priority !== undefined) updateData.priority = taskData.priority;
                if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate;
                if (taskData.assignees !== undefined) {
                    updateData.assignees = taskData.assignees;
                } else if (taskData.assignee !== undefined) {
                    // Legacy support: convert single assignee to array
                    updateData.assignees = Array.isArray(taskData.assignee) ? taskData.assignee : [taskData.assignee];
                }
                if (taskData.comments !== undefined) updateData.comments = taskData.comments;
                if (taskData.views !== undefined) updateData.views = taskData.views;
                if (taskData.order !== undefined) updateData.order = taskData.order;
                if (taskData.updatedBy) updateData.updatedBy = taskData.updatedBy;
                
                // Ensure taskId is never included (explicit check)
                if ('taskId' in updateData) {
                    delete updateData.taskId;
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
                // Build clean request body - only include allowed fields, exclude taskId
                const createData = {
                    task: taskData.task,
                    phaseId: taskData.phaseId || selectedPhaseId || activeTab || phases[0]?.id,
                    status: taskData.status || TASK_STATUS.PENDING,
                };

                // Add optional fields only if they exist
                if (taskData.description) createData.description = taskData.description;
                if (taskData.priority) createData.priority = taskData.priority;
                if (taskData.dueDate) createData.dueDate = taskData.dueDate;
                if (taskData.assignees && taskData.assignees.length > 0) {
                    createData.assignees = taskData.assignees;
                } else if (taskData.assignee) {
                    // Legacy support: convert single assignee to array
                    createData.assignees = Array.isArray(taskData.assignee) ? taskData.assignee : [taskData.assignee];
                }
                if (taskData.comments !== undefined) createData.comments = taskData.comments || 0;
                if (taskData.views !== undefined) createData.views = taskData.views || 0;
                if (taskData.order !== undefined) createData.order = taskData.order || 0;
                if (taskData.updatedBy) createData.updatedBy = taskData.updatedBy;
                
                // Ensure taskId is never included (explicit check)
                if ('taskId' in createData) {
                    delete createData.taskId;
                }
                
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
            children: (
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
                            {selectedPhase && (
                                <Space>
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
                                </Space>
                            )}
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

                <Drawer
                    title={detailTask ? detailTask.task : 'Task Details'}
                    width={420}
                    open={isDetailDrawerOpen}
                    onClose={handleCloseDrawer}
                    destroyOnClose
                    extra={
                        detailTask ? (
                            <Space>
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
                                            <div style={{fontSize: 13, color: '#8c8c8c'}}>{detailTask.assignee.role}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>Unassigned</div>
                                )}
                            </div>

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
                                        <span>{detailTask.comments || 0}</span>
                                    </li>
                                    <li>
                                        <span>Views</span>
                                        <span>{detailTask.views || 0}</span>
                                    </li>
                                </ul>
                            </div>

                            <Divider/>

                            <div className="kanban-task-drawer-section">
                                <h5>Comments</h5>
                                
                                {/* Comments List */}
                                {taskComments.length > 0 && (
                                    <List
                                        className="comment-list"
                                        itemLayout="horizontal"
                                        dataSource={taskComments}
                                        renderItem={(comment) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={comment.avatar}
                                                    title={
                                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                            <span style={{fontWeight: 600}}>{comment.author}</span>
                                                            <span style={{fontSize: '12px', color: '#8c8c8c'}}>{comment.datetime}</span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div 
                                                            dangerouslySetInnerHTML={{__html: comment.content}}
                                                            style={{marginTop: '8px'}}
                                                        />
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                )}

                                {/* Comment Editor */}
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
                                            style={{minHeight: '150px'}}
                                        />
                                    </div>
                                    
                                    {/* Mention Helper - Show assigned users */}
                                    {detailTask.assignees && detailTask.assignees.length > 0 && (
                                        <div className="mb-2" style={{fontSize: '12px', color: '#8c8c8c'}}>
                                            <Text type="secondary">Mention: </Text>
                                            {detailTask.assignees.map((assignee, idx) => (
                                                <span key={assignee.id || idx}>
                                                    <Text code style={{fontSize: '11px'}}>@{assignee.name}</Text>
                                                    {idx < detailTask.assignees.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <Button 
                                        type="primary" 
                                        onClick={async () => {
                                            if (!commentContent.trim()) {
                                                message.warning('Please enter a comment');
                                                return;
                                            }
                                            
                                            // Extract mentions from comment
                                            const mentionRegex = /@(\w+)/g;
                                            const mentions = [];
                                            let match;
                                            while ((match = mentionRegex.exec(commentContent)) !== null) {
                                                mentions.push(match[1]);
                                            }
                                            
                                            // Get current user
                                            const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
                                            const currentUserName = currentUser.user?.name || currentUser.name || 'Current User';
                                            
                                            // Create comment object
                                            const newComment = {
                                                id: Date.now().toString(),
                                                author: currentUserName,
                                                avatar: <Avatar icon={<UserOutlined/>}/>,
                                                content: commentContent,
                                                datetime: dayjs().format('YYYY-MM-DD HH:mm'),
                                                mentions: mentions,
                                            };
                                            
                                            // Add to comments list
                                            setTaskComments([...taskComments, newComment]);
                                            
                                            // Clear editor
                                            setCommentContent('');
                                            
                                            message.success('Comment added successfully');
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
