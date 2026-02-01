// Kanban Service - handles API calls and data transformations
import { TASK_STATUS, TASK_STATUS_LABELS } from '../types';

/**
 * Transform flat task list to kanban structure
 * @param {Array} tasks - Array of tasks
 * @param {Array} phases - Array of phases
 * @returns {Object} - Organized kanban data
 */
export const organizeTasksByPhaseAndStatus = (tasks, phases) => {
  const organized = {};

  phases.forEach((phase) => {
    organized[phase.id] = {
      phase,
      statuses: {
        [TASK_STATUS.PENDING]: [],
        [TASK_STATUS.ONGOING]: [],
        [TASK_STATUS.REVIEW]: [],
        [TASK_STATUS.COMPLETED]: [],
        [TASK_STATUS.FAILED]: [],
      },
    };
  });

  tasks.forEach((task) => {
    const phaseId = task.phaseId || phases[0]?.id;
    const status = task.status || TASK_STATUS.PENDING;

    if (organized[phaseId] && organized[phaseId].statuses[status]) {
      organized[phaseId].statuses[status].push(task);
    }
  });

  // Sort tasks by order within each status
  Object.keys(organized).forEach((phaseId) => {
    Object.keys(organized[phaseId].statuses).forEach((status) => {
      organized[phaseId].statuses[status].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
    });
  });

  return organized;
};

/**
 * Get default phases
 */
const defaultStatusIds = Object.values(TASK_STATUS);

export const getDefaultPhases = () => [
  {
    id: 'phase-1',
    name: 'Blending',
    order: 0,
    color: '#1890ff',
    statuses: defaultStatusIds,
    description: 'Initial blending activities and prep work.',
  },
  {
    id: 'phase-2',
    name: 'Filling and Packing',
    order: 1,
    color: '#52c41a',
    statuses: defaultStatusIds,
    description: 'Filling, packing and fulfillment tasks.',
  },
  {
    id: 'phase-3',
    name: 'Lab',
    order: 2,
    color: '#faad14',
    statuses: defaultStatusIds,
    description: 'Lab testing and QA validation.',
  },
];

/**
 * Get all statuses
 */
export const getAllStatuses = () => [
  { id: TASK_STATUS.PENDING, label: TASK_STATUS_LABELS[TASK_STATUS.PENDING] },
  { id: TASK_STATUS.ONGOING, label: TASK_STATUS_LABELS[TASK_STATUS.ONGOING] },
  { id: TASK_STATUS.REVIEW, label: TASK_STATUS_LABELS[TASK_STATUS.REVIEW] },
  { id: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED] },
  { id: TASK_STATUS.FAILED, label: TASK_STATUS_LABELS[TASK_STATUS.FAILED] },
];

export const phases = ()=>{{

}}