# Task Phase Movement & History Tracking API Documentation

**⭐ NEW** - Newly added endpoints for task phase movement and history tracking

## Base URL
```
http://localhost:3003
```

---

## Table of Contents
1. [Overview](#overview)
2. [Move Task to Another Phase](#move-task-to-another-phase)
3. [Get Task Movement History](#get-task-movement-history)
4. [Data Models](#data-models)
5. [Frontend Requirements](#frontend-requirements)

---

## Overview

This feature allows moving completed tasks from one phase to another phase while maintaining a complete audit trail of all phase movements. This is particularly useful in manufacturing workflows where tasks need to progress through multiple phases (e.g., Manufacturing → Packing → Quality Control).

### Use Cases
- **Manufacturing Workflow**: When a task in "Manufacturing" phase is completed, move it to "Packing" phase
- **Multi-Phase Production**: Track task progression through multiple production stages
- **Audit Trail**: Maintain complete history of task movements for compliance and tracking

---

## Move Task to Another Phase

Move a task from its current phase to a target phase. This endpoint automatically creates a history record.

**Endpoint:** `POST /tasks/:taskId/move`

**Path Parameters:**
- `taskId` (string, required): Task ID (UUID or taskId string)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "targetPhaseId": "phase-uuid-5678",  // required - UUID of target phase
  "targetStatus": "pending",            // optional - Status in new phase (default: "pending")
  "notes": "Task completed in Manufacturing, moving to Packing phase",  // optional - Reason/notes for movement
  "updatedBy": "user-uuid-1234"        // optional - User UUID who initiated the move
}
```

**Request Body Fields:**
- `targetPhaseId` (string, required): UUID of the phase to move the task to. Phase must exist and be active.
- `targetStatus` (string, optional): Status to set in the new phase. Default: `"pending"`. Must be a valid status for the target phase.
- `notes` (string, optional): Optional notes explaining why the task is being moved (e.g., "Completed manufacturing, ready for packing").
- `updatedBy` (string, optional): UUID of the user who initiated the move. If not provided, will be extracted from authentication token.

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "task-uuid-1234",
    "taskId": "TASK-1234567890-ABC",
    "phaseId": "phase-uuid-5678",
    "previousPhaseId": "phase-uuid-1234",
    "status": "pending",
    "previousStatus": "completed",
    "task": "Manufacturing Gel - 100ml pack",
    "description": "Task description",
    "priority": "high",
    "dueDate": "2025-12-15T00:00:00.000Z",
    "assignedUserId": "user-uuid-1234",
    "assignedUser": {
      "id": "user-uuid-1234",
      "userName": "john_doe",
      "email": "john@example.com"
    },
    "costingId": "costing-uuid-1234",
    "costing": {
      "id": "costing-uuid-1234",
      "itemName": "Product Name",
      "itemCode": "ITEM-001",
      "version": 1,
      "isActive": true
    },
    "batchSize": "batch10kg",
    "rawMaterials": [...],
    "assignee": {...},
    "comments": 2,
    "views": 0,
    "order": 0,
    "createdAt": "2025-12-05T10:30:00.000Z",
    "updatedAt": "2025-12-13T15:45:00.000Z",
    "updatedBy": "user-uuid-1234",
    "movementHistory": {
      "id": "history-uuid-1234",
      "taskId": "task-uuid-1234",
      "fromPhaseId": "phase-uuid-1234",
      "fromPhaseName": "Manufacturing",
      "toPhaseId": "phase-uuid-5678",
      "toPhaseName": "Packing",
      "fromStatus": "completed",
      "toStatus": "pending",
      "movedBy": "user-uuid-1234",
      "movedByUser": {
        "id": "user-uuid-1234",
        "userName": "john_doe",
        "email": "john@example.com"
      },
      "notes": "Task completed in Manufacturing, moving to Packing phase",
      "movedAt": "2025-12-13T15:45:00.000Z"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-13T15:45:00.000Z",
  "path": "/tasks/task-uuid-1234/move-phase",
  "method": "POST",
  "message": "Target phase not found or inactive"
}
```

**Response (Error - 400):**
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-13T15:45:00.000Z",
  "path": "/tasks/task-uuid-1234/move-phase",
  "method": "POST",
  "message": "Task must be in 'completed' status to move to another phase"
}
```

**Response (Error - 404):**
```json
{
  "statusCode": 404,
  "timestamp": "2025-12-13T15:45:00.000Z",
  "path": "/tasks/invalid-id/move-phase",
  "method": "POST",
  "message": "Task invalid-id not found"
}
```

**Business Rules:**
1. Task must be in `"completed"` status in the current phase before it can be moved
2. Target phase must exist and be active
3. Target status must be a valid status for the target phase
4. A history record is automatically created when a task is moved
5. Task's `order` is reset to 0 in the new phase (or calculated based on existing tasks)
6. Task's `updatedAt` timestamp is updated
7. Task's `updatedBy` is set to the user who initiated the move

---

## Get Task Movement History

Get the complete movement history for a task, showing all phase transitions.

**Endpoint:** `GET /tasks/:taskId/movement-history`

**Path Parameters:**
- `taskId` (string, required): Task ID (UUID or taskId string)

**Query Parameters:**
- `limit` (number, optional): Maximum number of history records to return (default: 50, max: 100)
- `offset` (number, optional): Number of records to skip for pagination (default: 0)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "data": {
    "taskId": "task-uuid-1234",
    "taskName": "Manufacturing Gel - 100ml pack",
    "currentPhaseId": "phase-uuid-5678",
    "currentPhaseName": "Packing",
    "totalMovements": 2,
    "history": [
      {
        "id": "history-uuid-1234",
        "taskId": "task-uuid-1234",
        "fromPhaseId": "phase-uuid-1234",
        "fromPhaseName": "Manufacturing",
        "toPhaseId": "phase-uuid-5678",
        "toPhaseName": "Packing",
        "fromStatus": "completed",
        "toStatus": "pending",
        "movedBy": "user-uuid-1234",
        "movedByUser": {
          "id": "user-uuid-1234",
          "userName": "john_doe",
          "email": "john@example.com"
        },
        "notes": "Task completed in Manufacturing, moving to Packing phase",
        "movedAt": "2025-12-13T15:45:00.000Z",
        "createdAt": "2025-12-13T15:45:00.000Z"
      },
      {
        "id": "history-uuid-5678",
        "taskId": "task-uuid-1234",
        "fromPhaseId": "phase-uuid-0000",
        "fromPhaseName": "Planning",
        "toPhaseId": "phase-uuid-1234",
        "toPhaseName": "Manufacturing",
        "fromStatus": "completed",
        "toStatus": "pending",
        "movedBy": "user-uuid-5678",
        "movedByUser": {
          "id": "user-uuid-5678",
          "userName": "jane_doe",
          "email": "jane@example.com"
        },
        "notes": "Planning completed, ready for manufacturing",
        "movedAt": "2025-12-10T10:30:00.000Z",
        "createdAt": "2025-12-10T10:30:00.000Z"
      }
    ]
  }
}
```

**Response (Error - 404):**
```json
{
  "statusCode": 404,
  "timestamp": "2025-12-13T15:45:00.000Z",
  "path": "/tasks/invalid-id/movement-history",
  "method": "GET",
  "message": "Task invalid-id not found"
}
```

**Notes:**
- History records are ordered by `movedAt` in descending order (most recent first)
- If a task has never been moved, the history array will be empty
- The response includes the task's current phase information for context

---

## Data Models

### Task Movement History Entity

```typescript
interface TaskMovementHistory {
  id: string;                    // UUID - Primary key
  taskId: string;                // UUID - Foreign key to Task
  fromPhaseId: string;           // UUID - Phase the task was moved from
  fromPhaseName: string;         // Name of the source phase (denormalized for history)
  toPhaseId: string;             // UUID - Phase the task was moved to
  toPhaseName: string;           // Name of the target phase (denormalized for history)
  fromStatus: string;            // Status in the source phase (e.g., "completed")
  toStatus: string;              // Status in the target phase (e.g., "pending")
  movedBy: string;               // UUID - User who initiated the move
  movedByUser?: {                // User object (populated from relation)
    id: string;
    userName: string;
    email: string;
  };
  notes?: string;                // Optional notes explaining the movement
  movedAt: Date;                 // Timestamp when the move occurred
  createdAt: Date;               // Record creation timestamp
  updatedAt: Date;               // Record update timestamp
}
```

### Database Schema Recommendations

```sql
CREATE TABLE task_movement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_phase_id UUID NOT NULL REFERENCES phases(id),
  from_phase_name VARCHAR(255) NOT NULL,
  to_phase_id UUID NOT NULL REFERENCES phases(id),
  to_phase_name VARCHAR(255) NOT NULL,
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  moved_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  moved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_task_id (task_id),
  INDEX idx_moved_at (moved_at DESC),
  INDEX idx_from_phase_id (from_phase_id),
  INDEX idx_to_phase_id (to_phase_id)
);
```

---

## Frontend Requirements

### UI Components Needed

1. **Move Task Button/Icon**
   - Should appear on completed tasks in the task detail drawer
   - Should be visible in the task card when task status is "completed"
   - Icon: `SwapOutlined` or `ArrowRightOutlined` from Ant Design

2. **Move Task Modal**
   - Phase selection dropdown (showing all available phases except current phase)
   - Status selection dropdown (showing valid statuses for selected phase)
   - Notes textarea (optional)
   - Confirmation before moving

3. **Task Movement History Section**
   - Display in task detail drawer
   - Show timeline/chronological list of movements
   - Display: From Phase → To Phase, Status changes, Moved by, Date, Notes

### User Flow

1. User views a completed task
2. User clicks "Move to Another Phase" button
3. Modal opens with:
   - Current phase and status (read-only)
   - Target phase dropdown (all phases except current)
   - Target status dropdown (filtered by selected phase)
   - Notes textarea
4. User selects target phase and status, optionally adds notes
5. User confirms the move
6. Task is moved to new phase with status reset
7. History record is created
8. Success message shown
9. Task list refreshes
10. History section updates

### Validation Rules (Frontend)

- Only show "Move" option when task status is "completed"
- Disable current phase in target phase dropdown
- Filter statuses based on selected target phase
- Require target phase selection
- Optional: Require notes (can be made mandatory via configuration)

---

## Error Handling

### Common Error Scenarios

1. **Task Not Completed**
   - Error: `"Task must be in 'completed' status to move to another phase"`
   - Frontend: Disable move button for non-completed tasks

2. **Target Phase Not Found**
   - Error: `"Target phase not found or inactive"`
   - Frontend: Show error message, refresh phase list

3. **Invalid Status for Phase**
   - Error: `"Status 'invalid-status' is not valid for phase 'phase-name'"`
   - Frontend: Validate status against phase before submission

4. **Task Already in Target Phase**
   - Error: `"Task is already in the target phase"`
   - Frontend: Filter out current phase from dropdown

---

## Example Use Cases

### Use Case 1: Manufacturing to Packing
```
Task: "Manufacturing Gel - 100ml pack"
Current Phase: Manufacturing
Current Status: completed

Action: Move to Packing phase
Target Phase: Packing
Target Status: pending
Notes: "Manufacturing completed, ready for packing"

Result:
- Task moved to Packing phase
- Status set to pending
- History record created
```

### Use Case 2: Packing to Quality Control
```
Task: "Manufacturing Gel - 100ml pack"
Current Phase: Packing
Current Status: completed

Action: Move to Quality Control phase
Target Phase: Quality Control
Target Status: pending
Notes: "Packing completed, ready for quality inspection"

Result:
- Task moved to Quality Control phase
- Status set to pending
- Second history record created
```

---

## Integration Notes

1. **Task Update Endpoint**: The move endpoint internally uses the task update endpoint to change phase and status
2. **History Creation**: History record is created automatically, no separate API call needed
3. **Notifications**: Consider sending notifications when tasks are moved (optional enhancement)
4. **Permissions**: Consider adding permission checks (e.g., only managers can move tasks)
5. **Bulk Operations**: Future enhancement could support moving multiple tasks at once

---

## Testing Checklist

- [ ] Move completed task to another phase
- [ ] Verify task status changes correctly
- [ ] Verify history record is created
- [ ] Verify task cannot be moved if not completed
- [ ] Verify error when target phase doesn't exist
- [ ] Verify error when invalid status is selected
- [ ] Verify history retrieval returns correct data
- [ ] Verify pagination works for history
- [ ] Verify task order is reset in new phase
- [ ] Verify updatedBy is set correctly

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-13  
**Generated For:** Backend Development Team

