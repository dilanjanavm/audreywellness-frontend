// Task Status Types
export const TASK_STATUS = {
  PENDING: 'pending',
  ONGOING: 'ongoing',
  REVIEW: 'review',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Task Status Labels
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pending',
  [TASK_STATUS.ONGOING]: 'In Progress',
  [TASK_STATUS.REVIEW]: 'Review',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.FAILED]: 'Failed',
};

// Task Status Colors (for Ant Design tags)
export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: 'default',
  [TASK_STATUS.ONGOING]: 'processing',
  [TASK_STATUS.REVIEW]: 'warning',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.FAILED]: 'error',
};

// Priority Types
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Priority Labels
export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
};

// Priority Colors
export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: 'default',
  [TASK_PRIORITY.MEDIUM]: 'warning',
  [TASK_PRIORITY.HIGH]: 'error',
};

