import {
    getTaskListSuccess,
    getTaskListFail,
    addNewTaskSuccess,
    addNewTaskFail,
    updateTaskSuccess,
    updateTaskFail,
    deleteTaskSuccess,
    deleteTaskFail,
} from "./reducer";

import * as taskService from '../../service/taskService';
import { findKanbanUser } from '../../pages/Tasks/kanban/data/users';
// Mock data for tasks - replace with actual API calls
const mockTasks = [
    {
        _id: "1",
        taskId: "#VLZ456",
        project: "Velzon - Admin Dashboard",
        task: "UI/UX Design in the age of AI",
        description: "Create modern UI/UX designs leveraging AI tools for faster iteration and better user experience.",
        creater: "Tonya Noble",
        dueDate: "05 Jan, 2022",
        status: "ongoing",
        statusLabel: "In Progress",
        priority: "high",
        assignee: { id: "tonya-noble", name: "Tonya Noble", avatar: "avatar-10.jpg", role: "Project Manager" },
        subItem: [{ name: "Tonya Noble", img: "avatar-10.jpg" }],
        phaseId: "phase-1",
        order: 0,
        comments: 11,
        views: 187,
    },
    {
        _id: "2",
        taskId: "#VLZ457",
        project: "Velzon - Admin Dashboard",
        task: "User flow confirmation for finance app",
        description: "Review and confirm user flows for the new finance application to ensure optimal user experience.",
        creater: "Thomas Taylor",
        dueDate: "02 Jan, 2022",
        status: "pending",
        statusLabel: "Pending",
        priority: "medium",
        assignee: { id: "thomas-taylor", name: "Thomas Taylor", avatar: "avatar-8.jpg", role: "Frontend Developer" },
        subItem: [{ name: "Thomas Taylor", img: "avatar-8.jpg" }],
        phaseId: "phase-1",
        order: 1,
        comments: 8,
        views: 112,
    },
    {
        _id: "3",
        taskId: "#VLZ458",
        project: "Velzon - Admin Dashboard",
        task: "Responsive Website Design for 23 more clients",
        description: "Design responsive websites for 23 new clients with modern design principles and mobile-first approach.",
        creater: "Nancy Martino",
        dueDate: "28 Dec, 2021",
        status: "completed",
        statusLabel: "Completed",
        priority: "low",
        assignee: { id: "nancy-martino", name: "Nancy Martino", avatar: "avatar-5.jpg", role: "Web Designer" },
        subItem: [{ name: "Nancy Martino", img: "avatar-5.jpg" }],
        phaseId: "phase-2",
        order: 0,
        comments: 32,
        views: 115,
    },
    {
        _id: "4",
        taskId: "#VLZ459",
        project: "Velzon - Admin Dashboard",
        task: "Dashboard Analytics Implementation",
        description: "Implement comprehensive analytics dashboard with real-time data visualization and reporting features.",
        creater: "Michael Morris",
        dueDate: "10 Jan, 2022",
        status: "review",
        statusLabel: "Review",
        priority: "high",
        assignee: { id: "michael-morris", name: "Michael Morris", avatar: "avatar-7.jpg", role: "Full Stack Developer" },
        subItem: [{ name: "Michael Morris", img: "avatar-7.jpg" }],
        phaseId: "phase-1",
        order: 2,
        comments: 987,
        views: 21800,
    },
    {
        _id: "5",
        taskId: "#VLZ460",
        project: "Velzon - Admin Dashboard",
        task: "Mobile App Wireframing",
        description: "Create detailed wireframes for the mobile application covering all major user journeys and interactions.",
        creater: "Alexis Clarke",
        dueDate: "15 Jan, 2022",
        status: "ongoing",
        statusLabel: "In Progress",
        priority: "medium",
        assignee: { id: "alexis-clarke", name: "Alexis Clarke", avatar: "avatar-6.jpg", role: "UI/UX Designer" },
        subItem: [{ name: "Alexis Clarke", img: "avatar-6.jpg" }],
        phaseId: "phase-2",
        order: 1,
        comments: 221,
        views: 87200,
    },
];

/**
 * Transform API task response to frontend format
 * @param {Object} apiTask - Task from API
 * @returns {Object} - Transformed task for frontend
 */
const transformTask = (apiTask) => {
    // Handle assignee - could be string (ID) or object
    let assignee = null;
    if (apiTask.assignee) {
        if (typeof apiTask.assignee === 'string') {
            // Try to find user in kanbanUsers by ID
            const foundUser = findKanbanUser(apiTask.assignee);
            if (foundUser) {
                assignee = foundUser;
            } else {
                // If not found, create a minimal assignee object
                assignee = { id: apiTask.assignee };
            }
        } else if (typeof apiTask.assignee === 'object' && apiTask.assignee !== null) {
            // If assignee is an object, use it directly or transform it
            assignee = {
                id: apiTask.assignee.id || apiTask.assignee._id || apiTask.assignee.userId,
                name: apiTask.assignee.name || apiTask.assignee.username || apiTask.assignee.fullName || 'Unknown',
                avatar: apiTask.assignee.avatar || apiTask.assignee.profilePicture || apiTask.assignee.image,
                role: apiTask.assignee.role || apiTask.assignee.position || apiTask.assignee.jobTitle,
            };
        }
    }

    // Format dueDate if it's an ISO string
    let formattedDueDate = apiTask.dueDate || null;
    if (formattedDueDate && typeof formattedDueDate === 'string') {
        // Keep ISO format for consistency, frontend can format as needed
        formattedDueDate = formattedDueDate;
    }

    return {
        _id: apiTask.id || apiTask._id,
        taskId: apiTask.taskId,
        task: apiTask.task,
        description: apiTask.description || '',
        phaseId: apiTask.phaseId,
        status: apiTask.status || 'pending',
        priority: apiTask.priority || 'medium',
        dueDate: formattedDueDate,
        assignee: assignee,
        comments: apiTask.comments || 0,
        views: apiTask.views || 0,
        order: apiTask.order || 0,
        updatedBy: apiTask.updatedBy || null,
        // Legacy fields for compatibility
        statusLabel: apiTask.statusLabel || apiTask.status,
        subItem: assignee && assignee.name ? [{ name: assignee.name, img: assignee.avatar }] : [],
    };
};

/**
 * Get Task List
 */
export const getTaskList = (filters = {}) => async (dispatch) => {
    try {
        const response = await taskService.getAllTasks(filters);

        // Handle different response structures
        let tasks = [];
        if (response && response.data) {
            // Check if response.data is an array or nested
            if (Array.isArray(response.data)) {
                tasks = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                tasks = response.data.data;
            } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
                tasks = response.data.tasks;
            } else if (response.data.items && Array.isArray(response.data.items)) {
                tasks = response.data.items;
            }
        }

        // Transform tasks to frontend format
        const transformedTasks = tasks.map(transformTask);

        dispatch(getTaskListSuccess(transformedTasks));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        dispatch(getTaskListFail(error.message || 'Failed to load tasks'));
        // Fallback to empty array on error
        dispatch(getTaskListSuccess([]));
    }
};

/**
 * Add New Task
 */
export const addNewTask = (task) => async (dispatch) => {
    try {
        // API call is handled in the component, this just updates Redux state
        // The task object passed here should already have the backend-generated ID
        dispatch(addNewTaskSuccess(task));
    } catch (error) {
        dispatch(addNewTaskFail(error.message));
    }
};

/**
 * Update Task
 */
export const updateTask = (task) => async (dispatch) => {
    try {
        // Update Redux state directly (API call is handled in component)
        dispatch(updateTaskSuccess(task));
    } catch (error) {
        dispatch(updateTaskFail(error.message));
    }
};

/**
 * Delete Task
 */
export const deleteTask = (taskId) => async (dispatch) => {
    try {
        await taskService.deleteTask(taskId);
        dispatch(deleteTaskSuccess(taskId));
    } catch (error) {
        dispatch(deleteTaskFail(error.message));
    }
};

