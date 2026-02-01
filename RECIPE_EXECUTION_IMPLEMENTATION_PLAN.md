# Recipe Execution Implementation Plan

## Current State Analysis

### Current Implementation (Local State Only)
- Uses React `useState` for step tracking
- Timer runs in browser (client-side only)
- No persistence - data lost on page refresh
- No backend sync
- Manual step management logic

### Problems with Current Approach
1. **No Persistence**: If user refreshes page, all progress is lost
2. **No Resume Capability**: Cannot resume from where left off
3. **Single User**: No multi-user awareness
4. **No Audit Trail**: No history of execution steps

---

## Solution Architecture

### Backend API Integration
The backend provides a complete recipe execution API that handles:
- Execution state persistence
- Step progress tracking
- Automatic step transitions
- Status management (not_started, in_progress, paused, completed, cancelled)

### Implementation Strategy

#### 1. **API Service Layer** (taskService.js)
Add functions for all recipe execution endpoints:
- `startRecipeExecution(taskId, recipeId?)`
- `pauseRecipeExecution(taskId)`
- `resumeRecipeExecution(taskId)`
- `updateStepProgress(taskId, stepOrder, progress, actualTemperature?, notes?)`
- `completeStep(taskId, stepOrder, actualDuration?, actualTemperature?, notes?)`
- `cancelRecipeExecution(taskId)`
- `getRecipeExecutionStatus(taskId)`

#### 2. **State Management**
- Load execution status from backend on component mount
- Sync local UI state with backend state
- Use backend state as source of truth
- Local state only for UI responsiveness

#### 3. **Data Flow**

```
Component Mount
    ↓
GET /tasks/:taskId (includes recipeExecution)
    ↓
Check recipeExecution.status
    ↓
If status === 'in_progress' or 'paused':
    - Restore step states from stepExecutions
    - Restore current step
    - Restore elapsed times
    - Restore completion status
    ↓
User Actions:
    - Start → POST /recipe/start
    - Pause → POST /recipe/pause
    - Resume → POST /recipe/resume
    - Complete Step → POST /recipe/steps/:order/complete
    - Cancel → POST /recipe/cancel
    ↓
Update Local State
    ↓
Periodic Progress Updates (every 30s):
    POST /recipe/steps/:order/progress
```

#### 4. **Execution Status Mapping**

Backend Status → UI State:
- `not_started` → No active execution, can start
- `in_progress` → Active execution, show current step timer
- `paused` → Execution paused, show resume button
- `completed` → All steps done, show completion state
- `cancelled` → Execution cancelled, can restart

#### 5. **Step Execution Status Mapping**

Backend Step Status → UI State:
- `pending` → Step not started, button enabled if previous steps completed
- `in_progress` → Step active, show timer and controls
- `paused` → Step paused (when execution is paused)
- `completed` → Step done, show checkmark
- `skipped` → Step skipped (if applicable)

---

## Implementation Details

### Phase 1: API Integration
1. Add API functions to `taskService.js`
2. Handle response parsing
3. Error handling

### Phase 2: State Loading
1. Load execution status on component mount
2. Parse `recipeExecution` from task details response
3. Initialize local state from backend data
4. Handle cases: no execution, in_progress, paused, completed

### Phase 3: Action Handlers
1. Replace local state updates with API calls
2. Update UI after successful API responses
3. Handle errors gracefully

### Phase 4: Progress Tracking
1. Implement periodic progress updates (every 30 seconds)
2. Update on step completion
3. Calculate progress from elapsed time

### Phase 5: UI Updates
1. Show execution status badge
2. Display current step from backend
3. Show resume capability for paused executions
4. Handle step transitions automatically

---

## Key Implementation Points

### 1. Execution Status Recovery
When component mounts:
```javascript
if (recipeExecution?.status === 'in_progress' || recipeExecution?.status === 'paused') {
    // Restore current step from currentStep
    // Restore step executions from stepExecutions array
    // Calculate elapsed time from startedAt
    // Restore completed steps
}
```

### 2. Progress Calculation
- Backend provides `overallProgress` (0-100)
- Backend provides `currentStep.progress` (0-100)
- Backend provides `elapsedTime` in minutes
- Calculate remaining time from step duration and progress

### 3. Step Completion
- Call API: `POST /tasks/:taskId/recipe/steps/:stepOrder/complete`
- Backend automatically starts next step
- Update local state from response
- Backend returns updated execution status with new currentStep

### 4. Timer Management
- Use `currentStep.startedAt` to calculate elapsed time for current step
- Use `elapsedTime` from backend for total elapsed time
- Update progress periodically via API

### 5. Pause/Resume
- Pause saves current progress to backend
- Resume restores from backend
- Backend maintains pause/resume history (pausedAt, resumedAt)

---

## Edge Cases to Handle

1. **Page Refresh**: Load state from backend, restore UI
2. **Multiple Tabs**: Backend is source of truth, refresh on focus
3. **Network Errors**: Show error, allow retry
4. **Concurrent Updates**: Use backend state to prevent conflicts
5. **Execution Already Started**: Check status before allowing start
6. **Step Already Completed**: Prevent duplicate completion
7. **Execution Completed**: Disable all actions, show completion state
8. **Execution Cancelled**: Allow restart from beginning

---

## Benefits of Backend Integration

1. **Persistence**: Progress saved, survives page refresh
2. **Resume**: Can pause and resume later
3. **Multi-user**: Backend handles concurrent access
4. **Audit Trail**: Complete history of execution
5. **Data Integrity**: Backend validates state transitions
6. **Real-time Sync**: Multiple users see same state
7. **Offline Support**: Can queue actions when offline (future)

---

## Next Steps

1. Implement API service functions
2. Update StartRecipe component to use backend APIs
3. Add execution status loading
4. Replace local state management with API calls
5. Add periodic progress updates
6. Test pause/resume scenarios
7. Test page refresh recovery
8. Add error handling and user feedback

