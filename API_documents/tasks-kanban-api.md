# Tasks Module – Kanban Enhancements API Specification

_Last updated: 2025-11-21_

## 1. Overview

The Tasks module now exposes a phase-based Kanban experience. The backend services must support:

- Managing phases (name, allowed statuses, color, description, ordering).
- Fetching tasks grouped by phase/status with optional date filtering.
- Creating, updating, deleting tasks (including assignee metadata).
- Reordering tasks when dragged between statuses/phases.
- Providing reference data (status list, default phase templates).

All endpoints are JSON-based and require the standard auth headers used elsewhere (`Authorization: Bearer <token>`).

---

## 2. Entities

### Phase
```json
{
  "id": "phase-1",
  "name": "Blending",
  "color": "#1890ff",
  "description": "Initial blending activities and prep work.",
  "order": 0,
  "statuses": ["pending", "ongoing", "review", "completed", "failed"],
  "createdAt": "2025-11-15T10:21:00Z",
  "updatedAt": "2025-11-20T08:05:00Z"
}
```

### Task (subset)
```json
{
  "_id": "task-123",
  "taskId": "#VLZ456",
  "phaseId": "phase-1",
  "status": "ongoing",
  "order": 2,
  "task": "UI/UX Design in the age of AI",
  "description": "Create modern UI/UX designs leveraging AI tools...",
  "priority": "high",
  "dueDate": "05 Jan, 2026",
  "assignee": {
    "id": "tonya-noble",
    "name": "Tonya Noble",
    "avatar": "avatar-10.jpg",
    "role": "Project Manager"
  },
  "comments": 11,
  "views": 187,
  "createdAt": "2025-11-15T10:21:00Z",
  "updatedAt": "2025-11-20T08:05:00Z"
}
```

---

## 3. API Catalogue

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 3.1 | `/api/tasks/phases` | GET | List all phases with their metadata & allowed statuses. |
| 3.2 | `/api/tasks/phases` | POST | Create a new phase. |
| 3.3 | `/api/tasks/phases/{phaseId}` | PUT | Update phase (name, statuses, description, color, order). |
| 3.4 | `/api/tasks/phases/{phaseId}` | DELETE | Remove a phase (and optionally decide what happens to tasks). |
| 3.5 | `/api/tasks/phases/{phaseId}/tasks` | GET | Fetch tasks for a phase with optional filters (status/date range/search). |
| 3.6 | `/api/tasks` | POST | Create a new task. |
| 3.7 | `/api/tasks/{taskId}` | PUT | Update a task (title, description, status, phase, assignee, due date, etc.). |
| 3.8 | `/api/tasks/{taskId}` | DELETE | Delete a task. |
| 3.9 | `/api/tasks/{taskId}/position` | PATCH | Update task order/phase/status after drag & drop. |
| 3.10 | `/api/tasks/reference/statuses` | GET | Static list of supported statuses and display labels. |

---

## 4. Detailed Specs

### 3.1 GET `/api/tasks/phases`
**Query Params:** `includeTasks=0|1` (optional).  
**Response 200**
```json
{
  "data": [
    {
      "id": "phase-1",
      "name": "Blending",
      "order": 0,
      "color": "#1890ff",
      "description": "Initial blending activities and prep work.",
      "statuses": ["pending","ongoing","review","completed","failed"],
      "taskCount": 12,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### 3.2 POST `/api/tasks/phases`
**Request Body**
```json
{
  "name": "New Phase",
  "color": "#5b8def",
  "description": "Optional description",
  "statuses": ["pending","ongoing","review"],
  "order": 3
}
```
**Response 201** – returns created phase object.

### 3.3 PUT `/api/tasks/phases/{phaseId}`
Allows partial updates.
```json
{
  "name": "Filling & Packing",
  "color": "#52c41a",
  "description": "Updated copy",
  "statuses": ["pending","ongoing","review","completed"],
  "order": 2
}
```

### 3.4 DELETE `/api/tasks/phases/{phaseId}`
**Query Option:** `reassignPhaseId=<id>` – backend should move tasks to the provided phase before deletion (or reject if missing).  
**Response:** 204 No Content.

### 3.5 GET `/api/tasks/phases/{phaseId}/tasks`
**Query Params**
- `status=pending` (optional, multi-valued)
- `dateFrom=2025-01-01` / `dateTo=2025-01-31` (ISO date)
- `search=dashboard`

**Response 200**
```json
{
  "phaseId": "phase-1",
  "filters": {
    "status": ["pending","review"],
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-31"
  },
  "data": [
    { "_id":"task-123", "...": "..." }
  ]
}
```

### 3.6 POST `/api/tasks`
```json
{
  "taskId": "#VLZ461",
  "task": "Supplier onboarding",
  "description": "Collect documents, verify KYC, upload to portal.",
  "phaseId": "phase-2",
  "status": "pending",
  "priority": "medium",
  "dueDate": "17 Jan, 2026",
  "assignee": "tonya-noble",
  "comments": 0,
  "views": 0,
  "order": 0
}
```
**Response 201** – returns created task with expanded assignee profile.

### 3.7 PUT `/api/tasks/{taskId}`
Same payload structure as POST but all fields optional.  
Backend should update `updatedAt` and return the full task object.

### 3.8 DELETE `/api/tasks/{taskId}`
**Response:** 204 No Content.

### 3.9 PATCH `/api/tasks/{taskId}/position`
Used after drag-and-drop.
```json
{
  "phaseId": "phase-3",
  "status": "review",
  "order": 1
}
```
**Response 200**
```json
{
  "_id": "task-123",
  "phaseId": "phase-3",
  "status": "review",
  "order": 1,
  "updatedAt": "..."
}
```

### 3.10 GET `/api/tasks/reference/statuses`
Returns canonical status metadata for dropdowns/badges.
```json
{
  "data": [
    { "id": "pending", "label": "Pending", "color": "#d9d9d9" },
    { "id": "ongoing", "label": "In Progress", "color": "#722ed1" },
    { "id": "review", "label": "Review", "color": "#fa8c16" },
    { "id": "completed", "label": "Completed", "color": "#52c41a" },
    { "id": "failed", "label": "Failed", "color": "#ff4d4f" }
  ]
}
```

---

## 5. Notes & Requirements

1. **Validation**
   - Phase name must be unique per account.
   - `statuses` array cannot be empty and must only contain supported IDs.
   - Task `phaseId` must exist; `status` must be in the phase’s status list.
   - `order` is numeric (int); backend should auto-resolve collisions.

2. **Sorting & Ordering**
   - Phases should be returned sorted by `order ASC`.
   - Tasks within a status returned sorted by `order ASC`.

3. **Date Filtering**
   - `dateFrom`/`dateTo` inclusive; compare using task `dueDate`.

4. **Assignee Resolution**
   - Client sends `assignee` as user ID; backend should expand to `{ id, name, avatar, role }` for responses.

5. **Audit Fields**
   - Every mutation should update `updatedAt` and track `updatedBy` (if available) for auditing.

---

### Contact
For questions ping **Frontend Team – Tasks Squad** on Slack. Provide sample payloads when reporting issues.

