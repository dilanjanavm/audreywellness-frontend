import {useState, useEffect, useMemo, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {organizeTasksByPhaseAndStatus, getDefaultPhases, getAllStatuses} from '../services/kanbanService';
import {getTaskListSuccess, updateTaskSuccess} from '../../../../slices/tasks/reducer';
import * as phaseService from '../../../../service/phaseService';
import * as taskService from '../../../../service/taskService';
import {findKanbanUser} from '../data/users';

const defaultStatusIds = getAllStatuses().map((status) => status.id);

/**
 * Custom hook for Kanban board data management
 */
export const useKanban = () => {
    const dispatch = useDispatch();
    const {taskList, isTaskSuccess} = useSelector((state) => state.Tasks);
    const [isLoading, setIsLoading] = useState(true);

    const [phases, setPhases] = useState([]);
    const [tasksByPhase, setTasksByPhase] = useState({});

    // Transform task from API to frontend format
    const transformTask = (apiTask) => {
        // Handle assigned user - NEW API structure
        // Priority: assignedUser (new) > assignee (legacy) > assignedUserId (ID only)
        let assignees = [];
        let assignedUserId = apiTask.assignedUserId;
        
        if (apiTask.assignedUser) {
            // NEW: Use assignedUser object from API
            const assignedUser = apiTask.assignedUser;
            assignees = [{
                id: assignedUser.id || assignedUserId,
                name: assignedUser.userName || assignedUser.name || assignedUser.email || 'Unknown',
                email: assignedUser.email,
                avatar: assignedUser.avatar || assignedUser.profilePicture || assignedUser.image,
                role: assignedUser.role?.name || assignedUser.role?.code || assignedUser.role || null,
            }];
        } else if (apiTask.assignee) {
            // Legacy: Support assignee field (could be object or string)
            if (typeof apiTask.assignee === 'object' && apiTask.assignee !== null) {
                assignees = [{
                    id: apiTask.assignee.id || apiTask.assignee._id || assignedUserId,
                    name: apiTask.assignee.name || apiTask.assignee.userName || 'Unknown',
                    email: apiTask.assignee.email,
                    avatar: apiTask.assignee.avatar || apiTask.assignee.profilePicture,
                    role: apiTask.assignee.role || null,
                }];
            } else if (typeof apiTask.assignee === 'string') {
                // Legacy string assignee - try to find in kanbanUsers
                const foundUser = findKanbanUser(apiTask.assignee);
                assignees = foundUser ? [foundUser] : [{ id: apiTask.assignee }];
            }
        } else if (assignedUserId) {
            // Only ID available - create minimal assignee object
            const foundUser = findKanbanUser(assignedUserId);
            assignees = foundUser ? [foundUser] : [{ id: assignedUserId }];
        }
        
        // Handle assignees array (if present for backward compatibility)
        if (apiTask.assignees && Array.isArray(apiTask.assignees) && apiTask.assignees.length > 0) {
            assignees = apiTask.assignees.map((assigneeItem) => {
                if (typeof assigneeItem === 'string') {
                    const foundUser = findKanbanUser(assigneeItem);
                    return foundUser || { id: assigneeItem };
                } else if (typeof assigneeItem === 'object' && assigneeItem !== null) {
                    return {
                        id: assigneeItem.id || assigneeItem._id || assigneeItem.userId,
                        name: assigneeItem.name || assigneeItem.userName || assigneeItem.username || assigneeItem.fullName || 'Unknown',
                        email: assigneeItem.email,
                        avatar: assigneeItem.avatar || assigneeItem.profilePicture || assigneeItem.image,
                        role: assigneeItem.role?.name || assigneeItem.role?.code || assigneeItem.role || null,
                    };
                }
                return null;
            }).filter(Boolean);
        }
        
        // For backward compatibility, also set assignee to first assignee
        const assignee = assignees.length > 0 ? assignees[0] : null;

        // Handle costing - NEW API structure
        let costing = null;
        if (apiTask.costing) {
            costing = {
                id: apiTask.costing.id || apiTask.costingId,
                itemName: apiTask.costing.itemName,
                itemCode: apiTask.costing.itemCode,
                version: apiTask.costing.version,
                isActive: apiTask.costing.isActive,
            };
        } else if (apiTask.costingId) {
            costing = {
                id: apiTask.costingId,
            };
        }

        // Preserve batchSize and rawMaterials from API response
        const batchSize = apiTask.batchSize || null;
        const rawMaterials = apiTask.rawMaterials && Array.isArray(apiTask.rawMaterials) ? apiTask.rawMaterials : null;

        // Ensure we use the backend UUID as the primary ID
        const taskId = apiTask.id || apiTask._id;
        
        return {
            id: taskId, // Primary ID - UUID from backend (used for API calls)
            _id: taskId, // Also set _id to same value for drag-and-drop compatibility
            taskId: apiTask.taskId, // taskId is auto-generated by backend (display ID)
            task: apiTask.task,
            description: apiTask.description || '',
            phaseId: apiTask.phaseId,
            status: apiTask.status || 'pending',
            priority: apiTask.priority || 'medium',
            dueDate: apiTask.dueDate || null,
            assignedUserId: assignedUserId, // NEW: Store assignedUserId
            assignedUser: apiTask.assignedUser || null, // NEW: Store assignedUser object
            costingId: apiTask.costingId || null, // NEW: Store costingId
            costing: costing, // NEW: Store costing object
            batchSize: batchSize, // NEW: Store batchSize
            rawMaterials: rawMaterials, // NEW: Store rawMaterials array
            assignees: assignees, // Array of assignees (for display)
            assignee: assignee, // For backward compatibility - first assignee
            comments: apiTask.comments || 0,
            views: apiTask.views || 0,
            order: apiTask.order || 0,
            updatedBy: apiTask.updatedBy || null,
            statusLabel: apiTask.statusLabel || apiTask.status,
            subItem: assignees.map(a => ({ name: a.name, img: a.avatar })).filter(a => a.name),
        };
    };

    // Load tasks for each phase
    const loadTasksPerPhase = async (phasesList) => {
        try {
            const allTasks = [];
            for (const phase of phasesList) {
                try {
                    const response = await taskService.getPhaseTasks(phase.id);
                    let tasks = [];
                    
                    // Handle response structure: Backend returns { data: [...] }
                    // ApiService wraps it, so it might be response.data or response.data.data
                    if (response) {
                        if (response.data) {
                            // If response.data is an array, use it directly
                            if (Array.isArray(response.data)) {
                                tasks = response.data;
                            }
                            // If response.data.data exists and is an array, use that
                            else if (response.data.data && Array.isArray(response.data.data)) {
                                tasks = response.data.data;
                            }
                        }
                    }
                    
                    if (tasks.length > 0) {
                        const transformedTasks = tasks.map(task => transformTask({ ...task, phaseId: phase.id }));
                        allTasks.push(...transformedTasks);
                    }
                } catch (error) {
                    console.error(`Error loading tasks for phase ${phase.id}:`, error);
                }
            }
            if (allTasks.length > 0) {
                dispatch(getTaskListSuccess(allTasks));
            }
        } catch (error) {
            console.error('Error loading tasks per phase:', error);
        }
    };

    // Load phases and tasks
    useEffect(() => {
        const loadPhasesAndTasks = async () => {
            try {
                setIsLoading(true);
                // Load phases with tasks included
                const response = await phaseService.getAllPhase(true); // includeTasks=true
                
                // Handle response structure: Backend returns { data: [...] }
                // ApiService wraps it, so it might be response.data or response.data.data
                let phasesData = [];
                
                if (response) {
                    // Check if response has data property
                    if (response.data) {
                        // If response.data is an array, use it directly
                        if (Array.isArray(response.data)) {
                            phasesData = response.data;
                        }
                        // If response.data.data exists and is an array, use that
                        else if (response.data.data && Array.isArray(response.data.data)) {
                            phasesData = response.data.data;
                        }
                    }
                }

                if (phasesData.length > 0) {
                    // Transform backend data to match frontend structure
                    const transformedPhases = phasesData.map((phase, index) => ({
                        id: phase.id || phase._id,
                        name: phase.name,
                        order: phase.order ?? index,
                        color: phase.color || '#1890ff',
                        statuses: phase.statuses && phase.statuses.length ? phase.statuses : defaultStatusIds,
                        description: phase.description || '',
                    }));
                    setPhases(transformedPhases);

                    // Extract tasks from phases if included
                    const allTasks = [];
                    const tasksMap = {};
                    phasesData.forEach((phase) => {
                        const phaseId = phase.id || phase._id;
                        // Check for tasks in different possible structures
                        const phaseTasks = phase.tasks || phase.taskList || [];
                        if (Array.isArray(phaseTasks) && phaseTasks.length > 0) {
                            tasksMap[phaseId] = phaseTasks;
                            allTasks.push(...phaseTasks.map(task => ({ ...task, phaseId })));
                        }
                    });
                    
                    if (allTasks.length > 0) {
                        setTasksByPhase(tasksMap);
                        // Transform and dispatch tasks to Redux
                        const transformedTasks = allTasks.map(transformTask);
                        dispatch(getTaskListSuccess(transformedTasks));
                    } else {
                        // If tasks not included, load them per phase
                        loadTasksPerPhase(transformedPhases);
                    }
                } else {
                    // Fallback to localStorage or defaults
                    const savedPhases = localStorage.getItem('kanban-phases');
                    const parsed = savedPhases ? JSON.parse(savedPhases) : getDefaultPhases();
                    const fallbackPhases = (parsed || []).map((phase, index) => ({
                        ...phase,
                        order: phase.order ?? index,
                        color: phase.color || '#1890ff',
                        statuses: phase.statuses && phase.statuses.length ? phase.statuses : defaultStatusIds,
                        description: phase.description || '',
                    }));
                    setPhases(fallbackPhases);
                }
            } catch (error) {
                console.error('Error loading phases from backend:', error);
                console.error('Error details:', error.response || error.message);
                // Fallback to localStorage or defaults on error
                const savedPhases = localStorage.getItem('kanban-phases');
                const parsed = savedPhases ? JSON.parse(savedPhases) : getDefaultPhases();
                const fallbackPhases = (parsed || []).map((phase, index) => ({
                    ...phase,
                    order: phase.order ?? index,
                    color: phase.color || '#1890ff',
                    statuses: phase.statuses && phase.statuses.length ? phase.statuses : defaultStatusIds,
                    description: phase.description || '',
                }));
                setPhases(fallbackPhases);
            } finally {
                setIsLoading(false);
            }
        };

        loadPhasesAndTasks();
    }, []);

    // Save phases to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('kanban-phases', JSON.stringify(phases));
    }, [phases]);

    // Load tasks when phases change (if not already loaded)
    useEffect(() => {
        if (phases.length > 0 && (!taskList || taskList.length === 0)) {
            loadTasksPerPhase(phases);
        }
    }, [phases.length, taskList, loadTasksPerPhase]); // Include all dependencies

    // Organize tasks by phase and status
    const organizedData = useMemo(() => {
        if (!taskList || !phases) return {};
        return organizeTasksByPhaseAndStatus(taskList, phases);
    }, [taskList, phases]);

    // Add new phase
    const addPhase = async (phaseData) => {
        const phasePayload = {
            name: phaseData.name,
            order: phases.length,
            color: phaseData.color || '#1890ff',
            statuses: phaseData.statuses && phaseData.statuses.length ? phaseData.statuses : defaultStatusIds,
            description: phaseData.description || '',
        };
        
        try {
            const response = await phaseService.createPhase(phasePayload);
            
            // Extract phase data from response - backend returns the created phase with UUID
            const createdPhaseData = response.data?.data || response.data || {};
            const phaseUuid = createdPhaseData.id || createdPhaseData._id;
            
            if (phaseUuid) {
                const newPhase = {
                    id: phaseUuid, // Use backend UUID
                    name: phaseData.name,
                    order: createdPhaseData.order ?? phases.length,
                    color: createdPhaseData.color || phaseData.color || '#1890ff',
                    statuses: createdPhaseData.statuses && createdPhaseData.statuses.length 
                        ? createdPhaseData.statuses 
                        : (phaseData.statuses && phaseData.statuses.length ? phaseData.statuses : defaultStatusIds),
                    description: createdPhaseData.description || phaseData.description || '',
                };
                setPhases((prev) => [...prev, newPhase]);
                return newPhase;
            } else {
                console.error('Phase UUID not found in response:', response);
                return null;
            }
        } catch (error) {
            console.error('Error creating phase:', error);
            return null;
        }
    };

    // Update phase
    const updatePhase = async (phaseId, updates) => {
        try {
            const response = await phaseService.updatePhaseById(phaseId, updates);
            
            // Extract updated phase data from response
            const updatedPhaseData = response.data?.data || response.data || {};
            
            setPhases((prev) =>
                prev.map((phase) =>
                    phase.id === phaseId
                        ? {
                            ...phase,
                            ...updates,
                            ...updatedPhaseData,
                            statuses: updates.statuses && updates.statuses.length 
                                ? updates.statuses 
                                : (updatedPhaseData.statuses && updatedPhaseData.statuses.length 
                                    ? updatedPhaseData.statuses 
                                    : phase.statuses),
                        }
                        : phase
                )
            );
        } catch (error) {
            console.error('Error updating phase:', error);
            throw error;
        }
    };

    // Delete phase
    const deletePhase = (phaseId) => {
        setPhases((prev) => prev.filter((phase) => phase.id !== phaseId));
    };

    // Handle task drag end
    const handleTaskDragEnd = async (taskId, newPhaseId, newStatus, newOrder) => {
        // Find task by _id (used in drag-and-drop) or id
        const task = taskList.find(t => t._id === taskId || t.id === taskId);
        if (!task) {
            console.error('Task not found for drag operation:', taskId, 'Available tasks:', taskList.map(t => ({ id: t.id, _id: t._id })));
            return;
        }

        try {
            // Use the task's UUID (id) for the API call - this is the backend UUID
            // id should always be the backend UUID, _id is set to same value for compatibility
            const taskUuid = task.id;
            if (!taskUuid) {
                console.error('Task UUID (id) not found:', task);
                return;
            }

            // Validate that phaseId is a valid UUID (not a temporary ID)
            // Check if the phase exists in our phases list
            const targetPhase = phases.find(p => p.id === newPhaseId);
            if (!targetPhase) {
                console.error('Phase not found:', newPhaseId, 'Available phases:', phases.map(p => p.id));
                return;
            }

            // Use the phase's UUID
            const phaseUuid = targetPhase.id;
            if (!phaseUuid) {
                console.error('Phase UUID not found:', targetPhase);
                return;
            }

            // Call API to update task position
            const positionData = {
                phaseId: phaseUuid,
                status: newStatus,
                order: newOrder,
            };
            
            console.log('Updating task position:', { taskUuid, positionData });
            const response = await taskService.updateTaskPosition(taskUuid, positionData);
            
            if (response.success || response.data) {
                const updatedTask = {
                    ...task,
                    phaseId: newPhaseId,
                    status: newStatus,
                    order: newOrder,
                };
                dispatch(updateTaskSuccess(updatedTask));
                // Refresh tasks to ensure we have the latest data
                if (phases.length > 0) {
                    await loadTasksPerPhase(phases);
                }
            }
        } catch (error) {
            console.error('Error updating task position:', error);
        }
    };

    // Refresh tasks for all phases
    const refreshTasks = async () => {
        if (phases.length > 0) {
            await loadTasksPerPhase(phases);
        }
    };

    return {
        phases,
        organizedData,
        taskList,
        isTaskSuccess,
        isLoading,
        addPhase,
        updatePhase,
        deletePhase,
        handleTaskDragEnd,
        refreshTasks,
    };
};

