# Task Phase Movement Feature - Implementation Summary

## Overview

This document summarizes the frontend implementation for the Task Phase Movement feature, which allows users to move completed tasks between phases with complete history tracking.

---

## Feature Description

When a task reaches "completed" status (either through drag-and-drop or manual update), a modal appears asking the user:
1. **"Is this task done?"** - Yes/No question
2. **"Do you want to move it to another phase?"** - If Yes, show phase selection

This provides a smooth workflow for multi-phase production processes (e.g., Manufacturing → Packing → Quality Control).

---

## User Flow

### Scenario: Manufacturing → Packing

1. **User drags task to "completed" status** in Manufacturing phase
   - OR user edits task and changes status to "completed"

2. **Modal appears automatically** asking:
   - "This task is now completed. Would you like to move it to another phase?"
   - Options:
     - **Yes, move to another phase** → Shows phase selection form
     - **No, keep it in current phase** → Task stays in Manufacturing with completed status

3. **If user selects "Yes":**
   - Phase selection dropdown appears (all phases except current)
   - Status selection dropdown (filtered by selected phase)
   - Optional notes field
   - User selects target phase (e.g., "Packing")
   - User selects target status (e.g., "pending")
   - User clicks "Move Task"

4. **System processes:**
   - Calls `POST /tasks/:taskId/move` with movement data
   - Task is moved to Packing phase
   - Status set to "pending"
   - History record created
   - Kanban board switches to Packing phase tab
   - Task list refreshes

5. **If user selects "No":**
   - Task status is updated to "completed"
   - Task remains in current phase
   - Modal closes

---

## Technical Implementation

### 1. API Service Functions (`taskService.js`)

```javascript
// Move task to another phase
moveTaskToPhase(taskId, movementData)
// Endpoint: POST /tasks/:taskId/move
// Request body: { toPhaseId, toStatus, order, reason, movedBy }

// Get task movement history
getTaskMovementHistory(taskId, options)
// Endpoint: GET /tasks/:taskId/movement-history
```

### 2. Modal Component (`MoveTaskPhaseModal.jsx`)

**Features:**
- Two-step decision process (Yes/No radio buttons)
- Phase selection dropdown (excludes current phase)
- Status selection (filtered by selected phase)
- Optional notes/reason field
- Validation and error handling
- Loading states

**Props:**
- `visible` - Modal visibility
- `onCancel` - Cancel handler
- `onOk` - Submit handler (receives movementData or null)
- `task` - Task object being moved
- `phases` - Array of all phases
- `currentPhaseId` - Current phase ID

### 3. Kanban Board Integration (`KanbanBoard.jsx`)

**Interception Points:**

1. **Drag-and-Drop Handler** (`handleDragEnd`):
   - Detects when task is dropped on "completed" status
   - Shows modal before updating task
   - Stores pending update information

2. **Task Update Handler** (`handleSaveTask`):
   - Detects when task status is changed to "completed"
   - Shows modal before updating task
   - Stores pending update information

3. **Move Decision Handler** (`handleMoveTaskDecision`):
   - Handles user's decision (move or keep)
   - If "No": Completes the pending update/drag operation
   - If "Yes": Calls move API and switches to target phase tab

**State Management:**
- `moveTaskModalVisible` - Controls modal visibility
- `pendingCompletedTask` - Task that triggered the modal
- `pendingTaskUpdate` - Update/drag information to apply if user chooses "No"

---

## Request Body Structure

### Move Task Request

```json
{
  "toPhaseId": "phase-uuid-5678",     // Required - Target phase UUID
  "toStatus": "pending",               // Optional - Target status (default: "pending")
  "order": 0,                          // Optional - Target order (default: auto-calculated)
  "reason": "Task completed in Manufacturing, moving to Packing phase",  // Optional
  "movedBy": "user-uuid-1234"         // Optional - User UUID or name
}
```

**Note:** The `order` field is optional and will be auto-calculated by the backend if not provided.

---

## UI/UX Features

### Modal Design
- **Clear Question**: "Task Completed - Move to Another Phase?"
- **Visual Indicators**: Green checkmark icon for completed status
- **Two Clear Options**: Radio buttons with descriptions
- **Progressive Disclosure**: Phase selection only shows when "Yes" is selected
- **Smart Defaults**: Default status is "pending" for target phase
- **Helpful Placeholders**: Pre-filled reason text with context

### User Experience
- **Non-Blocking**: User can choose to keep task in current phase
- **Contextual**: Shows current phase and task name
- **Intuitive**: Clear labels and descriptions
- **Responsive**: Loading states and error handling
- **Automatic Navigation**: Switches to target phase tab after moving

---

## Error Handling

### Common Scenarios

1. **Task Not Found**
   - Error: 404
   - Action: Show error message, refresh task list

2. **Target Phase Not Found**
   - Error: 400
   - Action: Show error message, reload phases

3. **Invalid Status for Phase**
   - Error: 400
   - Action: Show error message, validate before submission

4. **Network Error**
   - Error: Network failure
   - Action: Show error message, allow retry

---

## State Flow Diagram

```
User Action (Drag/Update to "completed")
    ↓
Check: Is status changing to "completed"?
    ↓ Yes
Show MoveTaskPhaseModal
    ↓
User Decision:
    ├─ "No" → Update task status to completed (stay in phase)
    └─ "Yes" → Show phase selection
        ↓
    User selects phase and status
        ↓
    Call POST /tasks/:taskId/move
        ↓
    Success:
        - Task moved to new phase
        - Switch to target phase tab
        - Refresh task list
        - Show success message
```

---

## Files Modified/Created

### New Files
1. `src/pages/Tasks/kanban/MoveTaskPhaseModal.jsx` - Modal component
2. `API_documents/TASK_PHASE_MOVEMENT_API.md` - API documentation
3. `API_documents/TASK_PHASE_MOVEMENT_IMPLEMENTATION.md` - This file

### Modified Files
1. `src/service/taskService.js`
   - Added `moveTaskToPhase()` function
   - Added `getTaskMovementHistory()` function

2. `src/pages/Tasks/kanban/KanbanBoard.jsx`
   - Added modal state management
   - Added interception logic in `handleDragEnd`
   - Added interception logic in `handleSaveTask`
   - Added `handleMoveTaskDecision` handler
   - Integrated `MoveTaskPhaseModal` component

---

## Testing Checklist

- [ ] Drag task to "completed" status → Modal appears
- [ ] Edit task status to "completed" → Modal appears
- [ ] Select "No" → Task stays in current phase with completed status
- [ ] Select "Yes" → Phase selection form appears
- [ ] Select target phase → Status dropdown populates
- [ ] Submit move → Task moves to target phase
- [ ] After move → Tab switches to target phase
- [ ] After move → Task list refreshes
- [ ] Error handling → Shows appropriate error messages
- [ ] Validation → Prevents submission without required fields
- [ ] History → Movement history is recorded (when backend implements)

---

## Future Enhancements

1. **Automatic Phase Detection**: Suggest next phase based on workflow
2. **Bulk Movement**: Move multiple completed tasks at once
3. **Movement Templates**: Pre-configured phase transitions
4. **Notifications**: Notify team members when tasks are moved
5. **Movement History UI**: Display history timeline in task detail drawer
6. **Phase Workflow Rules**: Define allowed phase transitions

---

## Notes

- The modal only appears when status is **changing** to "completed" (not if already completed)
- If user cancels the modal, the original drag/update operation is cancelled
- The system automatically switches to the target phase tab for better UX
- All movement history is tracked by the backend automatically

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-13  
**Status:** Frontend Implementation Complete - Awaiting Backend API

