import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Container, Row, Col } from 'reactstrap';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MoreOutlined, SwapOutlined, CheckCircleOutlined, AppstoreOutlined, UnorderedListOutlined, CloseOutlined, FileTextOutlined, FolderOutlined, PhoneOutlined, HomeOutlined, TruckOutlined, ShoppingOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { Tabs, message, Modal, Space, Drawer, Tag, Avatar, Typography, Divider, DatePicker, List, Spin, Empty, Popconfirm, Dropdown, Button, Radio } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { kanbanUsers } from './data/users';
import dayjs from 'dayjs';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import AddPhaseModal from './AddPhaseModal';
import AddTaskModal from './AddTaskModal';
import MoveTaskPhaseModal from './MoveTaskPhaseModal';
import TaskListView from './TaskListView';
import TaskCard from './TaskCard';
import TemplateManagement from './TemplateManagement';
import CustomerNotificationModal from './CustomerNotificationModal';
import { useKanban } from './hooks/useKanban';
import { updateTask, deleteTask } from '../../../slices/tasks/thunk';
import { useDispatch } from 'react-redux';
import * as taskService from '../../../service/taskService';
import * as phaseService from '../../../service/phaseService';
import * as templateService from '../../../service/templateService';
import * as customerService from '../../../service/customerService';
import { TASK_STATUS } from './types';
import { getAllStatuses } from './services/kanbanService';
import './KanbanBoard.css';
import StatusColumn from './StatusColumn';
import AssigneeFilterDrawer from './AssigneeFilterDrawer';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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

    // Initialize activeTab from sessionStorage or default to first phase
    const [activeTab, setActiveTab] = useState(() => {
        const storedTab = sessionStorage.getItem('kanbanActiveTab');
        return storedTab || phases[0]?.id || null;
    });



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
    const [viewMode, setViewMode] = useState('list'); // 'kanban' or 'list'
    const [assigneeFilterVisible, setAssigneeFilterVisible] = useState(false);
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
    const [activeSubNav, setActiveSubNav] = useState('board'); // 'board' or 'templates'
    const [templates, setTemplates] = useState([]);
    const [phaseTemplateMap, setPhaseTemplateMap] = useState({}); // phaseId -> template
    const [defaultTemplate, setDefaultTemplate] = useState(null);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [customerNotificationModalVisible, setCustomerNotificationModalVisible] = useState(false);
    const [pendingTaskStatusUpdate, setPendingTaskStatusUpdate] = useState(null); // { task, updateData, callback }

    // Helper function to check if a phase is "Filling & Packing" by name
    // Phase name from API: "Filling & Packing" (with &)
    const isFillingAndPackingPhase = useCallback((phaseId) => {
        if (!phaseId) return false;
        const phase = phases.find(p => p.id === phaseId);
        if (!phase) return false;
        // Check by exact name or variations (case-insensitive)
        // API response name: "Filling & Packing"
        const phaseName = (phase.name || '').toLowerCase().trim();
        // Check for exact match or variations: "Filling & Packing", "Filling and Packing", etc.
        return (phaseName === 'filling & packing' ||
            phaseName === 'filling and packing' ||
            (phaseName.includes('filling') && phaseName.includes('packing')));
    }, [phases]);

    // Verify activeTab matches a valid phase when phases load or change
    useEffect(() => {
        if (phases.length > 0) {
            // Check if current activeTab is valid
            const isCurrentTabValid = activeTab && phases.some(p => p.id === activeTab);

            if (!isCurrentTabValid) {
                // If invalid (or not set), try to restore from storage
                const storedTab = sessionStorage.getItem('kanbanActiveTab');
                const isStoredTabValid = storedTab && phases.some(p => p.id === storedTab);

                if (isStoredTabValid) {
                    setActiveTab(storedTab);
                } else {
                    // Default to first phase
                    const newActiveTab = phases[0].id;
                    setActiveTab(newActiveTab);
                    // We don't need to manually set sessionStorage here, the other effect will do it
                    // but doing it for immediate consistency is fine
                }
            }
            // If current tab IS valid, do nothing. Let the user navigate. 
            // The other effect will update sessionStorage.
        }
    }, [phases, activeTab]);

    // Load all templates and create phase mapping
    const loadTemplates = useCallback(async () => {
        try {
            setLoadingTemplates(true);
            const response = await templateService.getAllTemplates();
            const templatesData = response.data?.data || response.data || [];
            setTemplates(templatesData);

            // Find default template
            const defaultTemplateData = templatesData.find(t => t.isDefault === true);
            setDefaultTemplate(defaultTemplateData || null);

            // Create phaseId -> template mapping
            const mapping = {};
            templatesData.forEach(template => {
                if (template.assignedPhaseId) {
                    mapping[template.assignedPhaseId] = template;
                }
            });
            setPhaseTemplateMap(mapping);
        } catch (error) {
            console.error('Error loading templates:', error);
            message.error('Failed to load task templates');
        } finally {
            setLoadingTemplates(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Reload templates when switching back to board view from templates
    useEffect(() => {
        if (activeSubNav === 'board') {
            loadTemplates();
        }
    }, [activeSubNav, loadTemplates]);

    // Helper function to get template for a phase
    const getTemplateForPhase = (phaseId) => {
        if (!phaseId) return defaultTemplate;
        return phaseTemplateMap[phaseId] || defaultTemplate;
    };

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

    // Verify activeTab matches a valid phase when phases load
    useEffect(() => {
        if (phases.length > 0) {
            // Validation logic merged into the effect above
        }
    }, [phases, activeTab]);

    // Save activeTab to sessionStorage whenever it changes
    useEffect(() => {
        if (activeTab) {
            sessionStorage.setItem('kanbanActiveTab', activeTab);
        }
    }, [activeTab]);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
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

        // Check if task is in Filling & Packing phase (either current or new phase)
        // Also check if task has customer information
        const isInFillingPackingPhase = isFillingAndPackingPhase(newPhaseId) || isFillingAndPackingPhase(task.phaseId);
        const hasCustomerInfo = task.customerName || task.customerMobile || task.customerContact || task.orderNumber;
        console.log('hasCustomerInfo', hasCustomerInfo);
        // Show modal if task is in Filling & Packing phase
        if (isInFillingPackingPhase) {
            // Enrich task with customer details if customerName is a UUID
            const enrichedTask = await enrichTaskWithCustomerDetails({
                ...task,
                status: newStatus,
                phaseId: newPhaseId,
                statusLabel: getAllStatuses().find(s => s.id === newStatus)?.label || newStatus
            });

            setPendingTaskStatusUpdate({
                task: enrichedTask,
                updateData: { newPhaseId, newStatus, newOrder, activeId },
                callback: async () => {
                    await handleTaskDragEnd(activeId, newPhaseId, newStatus, newOrder);
                    message.success('Task moved successfully');
                }
            });
            setCustomerNotificationModalVisible(true);
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
            // AddTaskModal already sends the complete, correct payload with all required and optional fields
            // We just need to clean it up and ensure unwanted fields are removed

            // Create a clean copy of taskData
            const cleanTaskData = { ...taskData };

            // Remove fields that should never be sent (backend auto-generates or doesn't accept them)
            const fieldsToRemove = ['taskId', 'id', '_id', 'updatedBy', 'comments', 'views', 'order'];
            fieldsToRemove.forEach(field => {
                if (field in cleanTaskData) {
                    delete cleanTaskData[field];
                }
            });

            if (selectedTask) {
                // Update existing task
                // Ensure phaseId is preserved if not provided in update
                if (!cleanTaskData.phaseId) {
                    cleanTaskData.phaseId = selectedTask.phaseId;
                }

                console.log('Final Task Data to be sent to backend (UPDATE):', JSON.stringify(cleanTaskData, null, 2));

                // Check if status is being changed to "completed"
                const isStatusChangingToCompleted = cleanTaskData.status === 'completed' && selectedTask.status !== 'completed';

                // If status is changing to completed, show modal first
                if (isStatusChangingToCompleted) {
                    setPendingCompletedTask(selectedTask);
                    setPendingTaskUpdate({ updateData: cleanTaskData, isUpdate: true });
                    setMoveTaskModalVisible(true);
                    setAddTaskModalVisible(false); // Close edit modal
                    return; // Don't update yet, wait for user decision
                }

                // Check if task is in Filling & Packing phase
                // Also check if task has customer information
                const taskPhaseId = cleanTaskData.phaseId || selectedTask.phaseId;
                const isFillingPacking = isFillingAndPackingPhase(taskPhaseId);
                const hasCustomerInfo = selectedTask.customerName || selectedTask.customerMobile || selectedTask.customerContact || selectedTask.orderNumber;

                // Show modal if task is in Filling & Packing phase
                if (isFillingPacking) {
                    // Enrich task with customer details if customerName is a UUID
                    const enrichedTask = await enrichTaskWithCustomerDetails({
                        ...selectedTask,
                        ...cleanTaskData,
                        status: cleanTaskData.status || selectedTask.status,
                        phaseId: taskPhaseId,
                        statusLabel: getAllStatuses().find(s => s.id === (cleanTaskData.status || selectedTask.status))?.label || (cleanTaskData.status || selectedTask.status)
                    });

                    setPendingTaskStatusUpdate({
                        task: enrichedTask,
                        updateData: cleanTaskData,
                        callback: async () => {
                            const taskUuid = selectedTask.id || selectedTask._id;
                            if (!taskUuid) {
                                message.error('Task ID not found');
                                return;
                            }

                            const response = await taskService.updateTask(taskUuid, cleanTaskData);

                            if (response.success || response.data) {
                                const updatedTaskData = response.data?.data || response.data || {};
                                const taskUuid = updatedTaskData.id || updatedTaskData._id || selectedTask.id || selectedTask._id;

                                const updatedTask = {
                                    ...selectedTask,
                                    ...cleanTaskData,
                                    id: taskUuid,
                                    _id: taskUuid,
                                };
                                dispatch(updateTask(updatedTask));
                                await refreshTasks();
                                message.success('Task updated successfully');
                            } else {
                                message.error(response.message || 'Failed to update task');
                            }
                        }
                    });
                    setCustomerNotificationModalVisible(true);
                    setAddTaskModalVisible(false); // Close edit modal
                    return; // Don't update yet, wait for user decision
                }

                // Use the task's UUID (id) for the API call
                const taskUuid = selectedTask.id || selectedTask._id;
                if (!taskUuid) {
                    message.error('Task ID not found');
                    return;
                }

                const response = await taskService.updateTask(taskUuid, cleanTaskData);

                if (response.success || response.data) {
                    // Extract updated task data from response
                    const updatedTaskData = response.data?.data || response.data || {};
                    const taskUuid = updatedTaskData.id || updatedTaskData._id || selectedTask.id || selectedTask._id;

                    // Ensure both id and _id are set to the backend UUID
                    const updatedTask = {
                        ...selectedTask,
                        ...cleanTaskData,
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
                // Ensure phaseId is set (fallback to selectedPhaseId or activeTab)
                if (!cleanTaskData.phaseId) {
                    cleanTaskData.phaseId = selectedPhaseId || activeTab || phases[0]?.id;
                }

                // Ensure status is set (fallback to PENDING)
                if (!cleanTaskData.status) {
                    cleanTaskData.status = TASK_STATUS.PENDING;
                }

                console.log('Final Task Data to be sent to backend (CREATE):', JSON.stringify(cleanTaskData, null, 2));

                const response = await taskService.createTask(cleanTaskData);

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

    // Helper function to check if a string is a UUID
    const isUUID = (str) => {
        if (!str || typeof str !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    // Helper function to enrich task with customer details if customerName is a UUID
    const enrichTaskWithCustomerDetails = async (task) => {
        if (!task) return task;

        // If customerName is a UUID, fetch customer details
        if (task.customerName && isUUID(task.customerName)) {
            try {
                const customerResponse = await customerService.getCustomerById(task.customerName);
                const customerData = customerResponse.data?.data || customerResponse.data;
                if (customerData) {
                    // Enrich with customer data, but prioritize task data if it exists
                    return {
                        ...task,
                        customerName: customerData.name || customerData.shortName || task.customerName,
                        customerMobile: task.customerMobile || customerData.smsPhone || customerData.mobileNumber || customerData.phone || null,
                        customerAddress: task.customerAddress || customerData.address || customerData.fullAddress || null,
                        customerEmail: customerData.email || null,
                        // Keep all other task fields including orderNumber, courierNumber, courierService
                        orderNumber: task.orderNumber || null,
                        courierNumber: task.courierNumber || null,
                        courierService: task.courierService || null,
                    };
                }
            } catch (error) {
                console.error('Error fetching customer details:', error);
                // Continue with original task data if fetch fails
            }
        }

        // If customerName is not a UUID, return task as-is with all fields
        return {
            ...task,
            customerName: task.customerName || null,
            customerMobile: task.customerMobile || task.customerContact || null,
            customerAddress: task.customerAddress || null,
            orderNumber: task.orderNumber || null,
            courierNumber: task.courierNumber || null,
            courierService: task.courierService || null,
        };
    };

    // Handle customer notification modal confirmation
    const handleCustomerNotificationConfirm = async (smsSent) => {
        if (!pendingTaskStatusUpdate) return;

        try {
            // Execute the callback to update the task
            await pendingTaskStatusUpdate.callback();

            // Reset state
            setPendingTaskStatusUpdate(null);
            setCustomerNotificationModalVisible(false);
        } catch (error) {
            console.error('Error updating task after customer notification:', error);
            message.error('Failed to update task');
        }
    };

    const handleCustomerNotificationCancel = () => {
        setPendingTaskStatusUpdate(null);
        setCustomerNotificationModalVisible(false);
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

                    if (response.status === 200) {
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

    // Filter tasks by selected assignees
    const filterTasksByAssignees = (tasks) => {
        if (!selectedAssigneeIds || selectedAssigneeIds.length === 0) {
            return tasks;
        }

        return tasks.filter(task => {
            // Check for unassigned
            if (selectedAssigneeIds.includes('unassigned')) {
                const hasAssignees = (
                    (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) ||
                    task.assignedUser ||
                    task.assignee ||
                    task.assignedUserId
                );
                if (!hasAssignees) {
                    return true;
                }
            }

            // Check if task is assigned to any selected user
            const taskAssigneeIds = [];

            if (task.assignees && Array.isArray(task.assignees)) {
                task.assignees.forEach(assignee => {
                    const id = assignee.id || assignee._id || assignee;
                    if (id) taskAssigneeIds.push(id);
                });
            } else if (task.assignedUser) {
                const id = task.assignedUser.id || task.assignedUser._id || task.assignedUserId;
                if (id) taskAssigneeIds.push(id);
            } else if (task.assignee) {
                const id = typeof task.assignee === 'object'
                    ? (task.assignee.id || task.assignee._id)
                    : task.assignee;
                if (id) taskAssigneeIds.push(id);
            } else if (task.assignedUserId) {
                taskAssigneeIds.push(task.assignedUserId);
            }

            return taskAssigneeIds.some(id => selectedAssigneeIds.includes(id));
        });
    };

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
                    organizedData={(() => {
                        // Apply assignee filter to organizedData for list view
                        if (!selectedAssigneeIds || selectedAssigneeIds.length === 0) {
                            return organizedData;
                        }

                        const filteredOrganizedData = { ...organizedData };
                        if (filteredOrganizedData[phase.id]) {
                            filteredOrganizedData[phase.id] = {
                                ...filteredOrganizedData[phase.id],
                                statuses: Object.keys(filteredOrganizedData[phase.id].statuses).reduce((acc, status) => {
                                    acc[status] = filterTasksByAssignees(filteredOrganizedData[phase.id].statuses[status]);
                                    return acc;
                                }, {})
                            };
                        }
                        return filteredOrganizedData;
                    })()}
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
                                        let tasks = rawTasks;

                                        // Apply date filter
                                        if (filterRange && filterRange[0] && filterRange[1]) {
                                            tasks = tasks.filter((task) => {
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
                                            });
                                        }

                                        // Apply assignee filter
                                        tasks = filterTasksByAssignees(tasks);
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
                                    <div style={{ opacity: 0.8, transform: 'rotate(5deg)' }}>
                                        <TaskCard task={activeTask} />
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
                icon={<PlusOutlined />}
                onClick={(e) => {
                    e.stopPropagation();
                    setEditingPhase(null);
                    setAddPhaseModalVisible(true);
                }}
                style={{ border: 'none', boxShadow: 'none' }}
            >
                Add Phase
            </Button>
        ),
        children: null,
    });

    // Handle template applied callback
    const handleTemplateApplied = () => {
        refreshTasks();
        // Reload templates to get the latest changes
        loadTemplates();
        // Refresh phases by calling useKanban refresh
        message.success('Template applied successfully');
    };

    // Handle template deleted callback - reload templates
    const handleTemplateDeleted = () => {
        loadTemplates();
        message.success('Template deleted successfully');
    };

    // Sub-navigation items
    const subNavItems = [
        {
            key: 'board',
            label: (
                <Space>
                    <AppstoreOutlined />
                    <span>Kanban Board</span>
                </Space>
            ),
        },
        {
            key: 'templates',
            label: (
                <Space>
                    <FolderOutlined />
                    <span>Templates</span>
                </Space>
            ),
        },
    ];

    return (
        <div className="page-content">
            <Container fluid>
                {/* Sub Navigation */}
                <Row className="mb-3">
                    <Col>
                        <Tabs
                            activeKey={activeSubNav}
                            onChange={setActiveSubNav}
                            type="line"
                            size="large"
                            items={subNavItems}
                            style={{ marginBottom: 0 }}
                        />
                    </Col>
                </Row>

                {/* Content based on active sub-nav */}
                {activeSubNav === 'templates' ? (
                    <TemplateManagement
                        phases={phases}
                        onTemplateApplied={handleTemplateApplied}
                        onTemplateDeleted={handleTemplateDeleted}
                    />
                ) : (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h4 className="mb-0" style={{ fontWeight: 600 }}>
                                            Kanban Dashboard
                                        </h4>
                                    </div>
                                    <Space>
                                        {/* Assignee Filter Button */}
                                        <Button
                                            icon={<UserOutlined />}
                                            onClick={() => setAssigneeFilterVisible(true)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}
                                        >
                                            Assignee
                                            {selectedAssigneeIds.length > 0 && (
                                                <span style={{
                                                    marginLeft: 4,
                                                    backgroundColor: '#1890ff',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>
                                                    {selectedAssigneeIds.length}
                                                </span>
                                            )}
                                        </Button>

                                        {/* Selected Assignee Badges */}
                                        {selectedAssigneeIds.length > 0 && selectedAssigneeIds.slice(0, 3).map((assigneeId) => {
                                            if (assigneeId === 'unassigned') {
                                                return (
                                                    <Tag
                                                        key={assigneeId}
                                                        closable
                                                        onClose={() => {
                                                            setSelectedAssigneeIds(selectedAssigneeIds.filter(id => id !== assigneeId));
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        Unassigned
                                                    </Tag>
                                                );
                                            }

                                            // Find user info from taskList
                                            let assignee = null;
                                            for (const task of taskList) {
                                                if (task.assignees && Array.isArray(task.assignees)) {
                                                    assignee = task.assignees.find(a => {
                                                        const id = a.id || a._id;
                                                        return id === assigneeId;
                                                    });
                                                    if (assignee) break;
                                                }
                                                if (task.assignedUser && (task.assignedUser.id === assigneeId || task.assignedUserId === assigneeId)) {
                                                    assignee = task.assignedUser;
                                                    break;
                                                }
                                                if (task.assignee) {
                                                    const assigneeObj = typeof task.assignee === 'object' ? task.assignee : null;
                                                    if (assigneeObj && (assigneeObj.id === assigneeId || assigneeObj._id === assigneeId)) {
                                                        assignee = assigneeObj;
                                                        break;
                                                    }
                                                }
                                                if (task.assignedUserId === assigneeId) {
                                                    // Only ID available, create minimal object
                                                    assignee = { id: assigneeId, name: 'User' };
                                                    break;
                                                }
                                            }

                                            const userName = assignee?.name || assignee?.userName || assignee?.email || 'User';
                                            const userInitial = userName.charAt(0).toUpperCase();

                                            return (
                                                <Tag
                                                    key={assigneeId}
                                                    closable
                                                    onClose={() => {
                                                        setSelectedAssigneeIds(selectedAssigneeIds.filter(id => id !== assigneeId));
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        padding: '4px 8px'
                                                    }}
                                                >
                                                    <Avatar
                                                        size={16}
                                                        src={
                                                            assignee?.avatar
                                                                ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}`
                                                                : undefined
                                                        }
                                                        style={{
                                                            backgroundColor: assignee?.avatar ? undefined : '#1890ff',
                                                            color: 'white',
                                                            fontSize: 10
                                                        }}
                                                    >
                                                        {!assignee?.avatar && userInitial}
                                                    </Avatar>
                                                    {userName}
                                                </Tag>
                                            );
                                        })}
                                        {selectedAssigneeIds.length > 3 && (
                                            <Tag style={{ padding: '4px 8px' }}>
                                                +{selectedAssigneeIds.length - 3} more
                                            </Tag>
                                        )}

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
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditPhase(selectedPhase)}
                                                >
                                                    Edit Phase
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    danger
                                                    icon={<DeleteOutlined />}
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
                            onOk={async (phaseData) => {
                                if (editingPhase) {
                                    await handleUpdatePhase(phaseData);
                                } else {
                                    await handleAddPhase(phaseData);
                                }
                            }}
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
                            template={getTemplateForPhase(selectedPhaseId)}
                        />

                        <CustomerNotificationModal
                            visible={customerNotificationModalVisible}
                            task={pendingTaskStatusUpdate?.task}
                            onConfirm={handleCustomerNotificationConfirm}
                            onCancel={handleCustomerNotificationCancel}
                            loading={false}
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

                        <AssigneeFilterDrawer
                            visible={assigneeFilterVisible}
                            onClose={() => setAssigneeFilterVisible(false)}
                            selectedAssignees={selectedAssigneeIds}
                            onSelectAssignees={setSelectedAssigneeIds}
                            tasks={taskList}
                        />

                        <Drawer
                            title={
                                <div style={{ width: '100%', paddingRight: 8 }}>
                                    {/* First Line: Task Title */}
                                    <div style={{
                                        fontSize: 20,
                                        fontWeight: 600,
                                        color: '#262626',
                                        marginBottom: 12,
                                        lineHeight: 1.4
                                    }}>
                                        {detailTask ? detailTask.task : 'Task Details'}
                                    </div>
                                    {/* Second Line: Context Tags */}
                                    {detailTask?.costing && (
                                        <div style={{
                                            display: 'flex',
                                            gap: 6,
                                            flexWrap: 'wrap',
                                            marginBottom: 12
                                        }}>
                                            {detailTask.costing?.category?.categoryHierarchy && (
                                                <Tag
                                                    closable={false}
                                                    style={{
                                                        fontSize: 12,
                                                        padding: '4px 12px',
                                                        margin: 0,
                                                        borderRadius: '6px',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {detailTask.costing.category.categoryHierarchy}
                                                </Tag>
                                            )}
                                            {detailTask.costing?.product?.name && (
                                                <Tag
                                                    closable={false}
                                                    style={{
                                                        fontSize: 12,
                                                        padding: '4px 12px',
                                                        margin: 0,
                                                        borderRadius: '6px',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {detailTask.costing.product.name}
                                                </Tag>
                                            )}
                                            {detailTask.costing?.supplier?.name && (
                                                <Tag
                                                    closable={false}
                                                    style={{
                                                        fontSize: 12,
                                                        padding: '4px 12px',
                                                        margin: 0,
                                                        borderRadius: '6px',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {detailTask.costing.supplier.name}
                                                </Tag>
                                            )}
                                        </div>
                                    )}
                                    {/* Third Line: Action Buttons */}
                                    {detailTask && (
                                        <div style={{
                                            display: 'flex',
                                            gap: 8,
                                            alignItems: 'center'
                                        }}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => {
                                                    navigate('/task-details', {
                                                        state: { task: detailTask, phases: phases }
                                                    });
                                                }}
                                                style={{
                                                    height: '32px',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                See More
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => handleEditTask(detailTask)}
                                                style={{
                                                    height: '32px',
                                                    fontSize: '13px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <EditOutlined style={{ fontSize: 14 }} />
                                                <span style={{ marginLeft: 4 }}>Edit</span>
                                            </Button>
                                            <Button
                                                danger
                                                size="small"
                                                onClick={() => handleDeleteTask(detailTask)}
                                                style={{
                                                    height: '32px',
                                                    fontSize: '13px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <DeleteOutlined style={{ fontSize: 14 }} />
                                                <span style={{ marginLeft: 4 }}>Delete</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            }
                            width={480}
                            open={isDetailDrawerOpen}
                            onClose={handleCloseDrawer}
                            destroyOnClose
                            styles={{
                                body: {
                                    padding: '24px'
                                }
                            }}
                        >
                            {detailTask ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {/* Task Overview Card */}
                                    <div style={{
                                        background: '#fafafa',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '20px',
                                            marginBottom: '16px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: '#8c8c8c',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Status
                                                </div>
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
                                                    style={{
                                                        fontSize: '13px',
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        margin: 0
                                                    }}
                                                >
                                                    {detailTask.statusLabel || detailTask.status}
                                                </Tag>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: '#8c8c8c',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Priority
                                                </div>
                                                <Tag
                                                    color={
                                                        detailTask.priority === 'high'
                                                            ? 'red'
                                                            : detailTask.priority === 'medium'
                                                                ? 'orange'
                                                                : 'default'
                                                    }
                                                    style={{
                                                        fontSize: '13px',
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        margin: 0
                                                    }}
                                                >
                                                    {detailTask.priority || 'N/A'}
                                                </Tag>
                                            </div>
                                        </div>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '20px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: '#8c8c8c',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Start Date
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#262626',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}>
                                                    <CalendarOutlined />
                                                    {detailTask.startDate ? dayjs(detailTask.startDate).format('MMM DD, YYYY') : 'Not set'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: '#8c8c8c',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Due Date
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#262626',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}>
                                                    <CalendarOutlined />
                                                    {detailTask.dueDate ? dayjs(detailTask.dueDate).format('MMM DD, YYYY') : 'Not set'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: '#8c8c8c',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Phase
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#262626',
                                                    fontWeight: 500
                                                }}>
                                                    {phases.find((p) => p.id === detailTask.phaseId)?.name || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Card - Prominent */}
                                    <div style={{
                                        background: '#ffffff',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '2px solid #52c41a',
                                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.15)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            marginBottom: 16
                                        }}>
                                            <FileTextOutlined style={{
                                                fontSize: 18,
                                                color: '#52c41a'
                                            }} />
                                            <h5 style={{
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                margin: 0,
                                                color: '#262626'
                                            }}>
                                                Description
                                            </h5>
                                        </div>
                                        <p style={{
                                            fontSize: '15px',
                                            color: '#595959',
                                            lineHeight: 1.7,
                                            margin: 0,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {detailTask.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {/* Assigned To Card */}
                                    {(detailTask.assignedUser || detailTask.assignee || (detailTask.assignees && detailTask.assignees.length > 0)) && (
                                        <div style={{
                                            background: '#ffffff',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            <h5 style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#262626',
                                                marginBottom: 16,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <TeamOutlined />
                                                Assigned To
                                            </h5>
                                            {detailTask.assignees && detailTask.assignees.length > 0 ? (
                                                <div>
                                                    {detailTask.assignees.map((assignee, index) => (
                                                        <div key={assignee.id || index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 12,
                                                            padding: '12px 0',
                                                            borderBottom: index < detailTask.assignees.length - 1 ? '1px solid #f0f0f0' : 'none'
                                                        }}>
                                                            <Avatar
                                                                src={
                                                                    assignee.avatar
                                                                        ? `${process.env.REACT_APP_API_URL || ''}/images/users/${assignee.avatar}`
                                                                        : undefined
                                                                }
                                                                icon={!assignee.avatar ? <UserOutlined /> : undefined}
                                                                size={40}
                                                                style={{ flexShrink: 0 }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 600, fontSize: 15, color: '#262626', marginBottom: 4 }}>
                                                                    {assignee.name || assignee.userName}
                                                                </div>
                                                                {assignee.email && (
                                                                    <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 2 }}>
                                                                        {assignee.email}
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                                    {assignee.role || assignee.role?.name || 'Team Member'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : detailTask.assignedUser ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Avatar
                                                        src={
                                                            detailTask.assignedUser.avatar
                                                                ? `${process.env.REACT_APP_API_URL || ''}/images/users/${detailTask.assignedUser.avatar}`
                                                                : undefined
                                                        }
                                                        icon={!detailTask.assignedUser.avatar ? <UserOutlined /> : undefined}
                                                        size={40}
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 15, color: '#262626', marginBottom: 4 }}>
                                                            {detailTask.assignedUser.userName || detailTask.assignedUser.name || 'Unknown'}
                                                        </div>
                                                        {detailTask.assignedUser.email && (
                                                            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 2 }}>
                                                                {detailTask.assignedUser.email}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                            {detailTask.assignedUser.role?.name || detailTask.assignedUser.role || 'Team Member'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : detailTask.assignee ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Avatar
                                                        src={
                                                            detailTask.assignee.avatar
                                                                ? `${process.env.REACT_APP_API_URL || ''}/images/users/${detailTask.assignee.avatar}`
                                                                : undefined
                                                        }
                                                        icon={!detailTask.assignee.avatar ? <UserOutlined /> : undefined}
                                                        size={40}
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 15, color: '#262626', marginBottom: 4 }}>
                                                            {detailTask.assignee.name}
                                                        </div>
                                                        {detailTask.assignee.email && (
                                                            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 2 }}>
                                                                {detailTask.assignee.email}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                            {detailTask.assignee.role || 'Team Member'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#8c8c8c', fontSize: 14, fontStyle: 'italic' }}>
                                                    Unassigned
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Order & Customer Information */}
                                    {(detailTask.orderNumber || detailTask.customerName || detailTask.customerMobile || detailTask.customerAddress) && (
                                        <>
                                            <Divider />
                                            <div style={{
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                padding: '20px',
                                                border: '1px solid #f0f0f0'
                                            }}>
                                                <h5 style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#262626',
                                                    marginBottom: 16,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}>
                                                    <ShoppingOutlined />
                                                    Order & Customer Information
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {detailTask.orderNumber && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '10px 0',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}>
                                                            <span style={{ fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <ShoppingOutlined />
                                                                Order Number
                                                            </span>
                                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                                {detailTask.orderNumber}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {detailTask.customerName && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '10px 0',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}>
                                                            <span style={{ fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <UserOutlined />
                                                                Customer Name
                                                            </span>
                                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                                {detailTask.customerName}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {detailTask.customerMobile && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '10px 0',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}>
                                                            <span style={{ fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <PhoneOutlined />
                                                                Customer Mobile
                                                            </span>
                                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                                {detailTask.customerMobile}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {detailTask.customerAddress && (
                                                        <div style={{
                                                            padding: '10px 0'
                                                        }}>
                                                            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <HomeOutlined />
                                                                Customer Address
                                                            </div>
                                                            <div style={{ fontSize: 14, color: '#262626', fontWeight: 500, lineHeight: 1.6 }}>
                                                                {detailTask.customerAddress}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Courier Information */}
                                    {(detailTask.courierNumber || detailTask.courierService) && (
                                        <>
                                            <Divider />
                                            <div style={{
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                padding: '20px',
                                                border: '1px solid #f0f0f0'
                                            }}>
                                                <h5 style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#262626',
                                                    marginBottom: 16,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}>
                                                    <TruckOutlined />
                                                    Courier Information
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {detailTask.courierNumber && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '10px 0',
                                                            borderBottom: detailTask.courierService ? '1px solid #f0f0f0' : 'none'
                                                        }}>
                                                            <span style={{ fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <FileTextOutlined />
                                                                Courier Number
                                                            </span>
                                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                                {detailTask.courierNumber}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {detailTask.courierService && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '10px 0'
                                                        }}>
                                                            <span style={{ fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <TruckOutlined />
                                                                Courier Service
                                                            </span>
                                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                                {detailTask.courierService}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* NEW: Costing Information */}
                                    {detailTask.costing && (
                                        <>
                                            <Divider />
                                            <div className="kanban-task-drawer-section">
                                                <h5>Associated Product</h5>
                                                <div className="mt-2">
                                                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                                        {detailTask.costing.itemName || 'Unnamed Product'}
                                                    </div>
                                                    {detailTask.costing.itemCode && (
                                                        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>
                                                            Code: {detailTask.costing.itemCode}
                                                        </div>
                                                    )}
                                                    {detailTask.costing.version && (
                                                        <Tag color="blue" style={{ marginTop: 4, marginBottom: 8 }}>
                                                            Version {detailTask.costing.version}
                                                        </Tag>
                                                    )}

                                                    {/* Batch Size */}
                                                    {detailTask.batchSize && (
                                                        <div style={{ marginTop: 12, marginBottom: 12 }}>
                                                            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>Batch Size:</div>
                                                            <Tag color="green" style={{ fontSize: 13 }}>
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
                                                        <div style={{ marginTop: 16 }}>
                                                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#595959' }}>
                                                                Raw Materials Required:
                                                            </div>
                                                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' }}>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                                    <thead>
                                                                        <tr style={{ borderBottom: '1px solid #f0f0f0', fontWeight: 600, backgroundColor: '#fafafa' }}>
                                                                            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Material</th>
                                                                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>%</th>
                                                                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount</th>
                                                                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Cost</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {detailTask.rawMaterials.map((material, index) => (
                                                                            <tr key={material.rawMaterialId || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                                                <td style={{ padding: '6px 8px' }}>
                                                                                    <div>
                                                                                        <div style={{ fontWeight: 500 }}>{material.rawMaterialName || 'N/A'}</div>
                                                                                        {material.category && (
                                                                                            <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                                                                                                {material.category}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                                                                    {parseFloat(material.percentage || 0).toFixed(2)}%
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                                                                    {parseFloat(material.kg || 0).toFixed(2)} {material.units || 'kg'}
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                                                    LKR {parseFloat(material.cost || 0).toLocaleString('en-US', {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2
                                                                                    })}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr style={{ borderTop: '2px solid #1890ff', fontWeight: 600, backgroundColor: '#f0f8ff' }}>
                                                                            <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>
                                                                                Total Cost:
                                                                            </td>
                                                                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#1890ff' }}>
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

                                    {/* Activity Card */}
                                    <div style={{
                                        background: '#ffffff',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <h5 style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#262626',
                                            marginBottom: 16,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Activity
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 0',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>Phase</span>
                                                <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                    {phases.find((p) => p.id === detailTask.phaseId)?.name || 'N/A'}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 0',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>Status</span>
                                                <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                    {detailTask.statusLabel || detailTask.status}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 0',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>Comments</span>
                                                <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                    {taskComments.length || detailTask.comments || 0}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 0'
                                            }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>Views</span>
                                                <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                    {detailTask.views || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Card */}
                                    <div style={{
                                        background: '#ffffff',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <h5 style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#262626',
                                            marginBottom: 16,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Comments ({taskComments.length})
                                        </h5>

                                        {/* Comments List */}
                                        {loadingComments ? (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <Spin size="large" />
                                            </div>
                                        ) : taskComments.length > 0 ? (
                                            <List
                                                className="comment-list"
                                                itemLayout="horizontal"
                                                dataSource={taskComments}
                                                style={{ marginTop: 16, marginBottom: 16 }}
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
                                                                        icon={!comment.owner?.avatar ? <UserOutlined /> : undefined}
                                                                        style={{ backgroundColor: '#1890ff' }}
                                                                    >
                                                                        {!comment.owner?.avatar && comment.ownerName ? comment.ownerName.charAt(0).toUpperCase() : null}
                                                                    </Avatar>
                                                                }
                                                                title={
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                        <div>
                                                                            <span style={{ fontWeight: 600, fontSize: 14 }}>{comment.ownerName}</span>
                                                                            {comment.ownerEmail && (
                                                                                <span style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: 8 }}>
                                                                                    {comment.ownerEmail}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                                            {dayjs(comment.commentedDate || comment.createdAt).format('MMM DD, YYYY HH:mm')}
                                                                        </span>
                                                                    </div>
                                                                }
                                                                description={
                                                                    <div
                                                                        dangerouslySetInnerHTML={{ __html: comment.comment }}
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
                                                style={{ margin: '20px 0' }}
                                            />
                                        )}

                                        {/* Comment Editor */}
                                        <Divider style={{ margin: '16px 0' }} />
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
                                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                            ['link'],
                                                            ['clean']
                                                        ],
                                                    }}
                                                    style={{ minHeight: '120px', marginBottom: '8px' }}
                                                />
                                            </div>

                                            {/* Mention Helper - Show assigned users */}
                                            {detailTask.assignees && detailTask.assignees.length > 0 && (
                                                <div className="mb-2" style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                                                    <Text type="secondary">Mention: </Text>
                                                    {detailTask.assignees.map((assignee, idx) => (
                                                        <span key={assignee.id || idx}>
                                                            <Text code style={{ fontSize: '11px' }}>@{assignee.name || assignee.userName}</Text>
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
                    </>
                )}
            </Container>
        </div>
    );
};

export default KanbanBoard;
