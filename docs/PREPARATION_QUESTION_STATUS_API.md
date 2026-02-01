# Preparation Question Status Update API Documentation

## Overview
This API endpoint allows updating the checked/unchecked status of preparation questions (checklist items) in recipe execution. This is used to track which preparation/checking steps have been completed before proceeding with recipe steps.

## Endpoint

### Update Preparation Question Checkbox Status

**Endpoint:** `PATCH /tasks/{taskId}/recipe/preparation/{preparationStepId}/questions/{questionId}/check`

**Authentication:** Required (Bearer Token)

**Description:** Updates the checked status of a specific preparation question within a preparation step for a task's recipe execution.

---

## Request

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string (UUID) | Yes | The UUID of the task |
| `preparationStepId` | string (UUID) | Yes | The UUID of the preparation step (from `preparationQuestions` array) |
| `questionId` | string (UUID) | Yes | The UUID of the question within the preparation step |

### Request Body

```json
{
  "checked": true
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `checked` | boolean | Yes | `true` to mark as checked, `false` to mark as unchecked |

### Example Request

```http
PATCH /tasks/efb24364-646c-4d83-8e98-a774faba0ee6/recipe/preparation/d87407fb-8434-47a6-bc78-ca755e5420fb/questions/ef6b82a4-e50d-48d7-9e52-88432bebfefc/check
Content-Type: application/json
Authorization: Bearer <token>

{
  "checked": true
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Preparation question status updated successfully",
  "data": {
    "taskId": "efb24364-646c-4d83-8e98-a774faba0ee6",
    "preparationStepId": "d87407fb-8434-47a6-bc78-ca755e5420fb",
    "questionId": "ef6b82a4-e50d-48d7-9e52-88432bebfefc",
    "checked": true,
    "updatedAt": "2026-01-26T18:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid request body. 'checked' field is required and must be a boolean."
}
```

#### 404 Not Found - Task Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Task not found"
}
```

#### 404 Not Found - Preparation Step Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Preparation step not found for this task"
}
```

#### 404 Not Found - Question Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Question not found in preparation step"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized. Please provide a valid authentication token."
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal server error"
}
```

---

## Implementation Details

### Frontend Implementation

The frontend implementation uses optimistic UI updates for better user experience:

1. **Immediate UI Update**: The checkbox state is updated immediately when clicked
2. **API Call**: The status is sent to the backend asynchronously
3. **Error Handling**: If the API call fails, the UI is reverted to the previous state and an error message is shown

### Example Frontend Code

```javascript
// In StartRecipe.js component
const handleCheckboxChange = async (e, taskId, preparationStepId, questionId) => {
    const newCheckedState = e.target.checked;
    
    // Optimistically update UI
    setCheckedQuestions(prev => {
        const newSet = new Set(prev);
        if (newCheckedState) {
            newSet.add(questionKey);
        } else {
            newSet.delete(questionKey);
        }
        return newSet;
    });
    
    // Update backend
    try {
        await taskService.updatePreparationQuestionStatus(
            taskId,
            preparationStepId,
            questionId,
            { checked: newCheckedState }
        );
    } catch (error) {
        // Revert on error
        setCheckedQuestions(prev => {
            const newSet = new Set(prev);
            if (newCheckedState) {
                newSet.delete(questionKey);
            } else {
                newSet.add(questionKey);
            }
            return newSet;
        });
        message.error('Failed to update preparation question status');
    }
};
```

### Service Function

```javascript
// In taskService.js
export async function updatePreparationQuestionStatus(taskId, preparationStepId, questionId, statusData) {
    const apiObject = {};
    apiObject.method = "PATCH";
    apiObject.authentication = true;
    apiObject.endpoint = `tasks/${taskId}/recipe/preparation/${preparationStepId}/questions/${questionId}/check`;
    apiObject.body = statusData;
    return await ApiService.callApi(apiObject);
}
```

---

## Business Logic

### Preparation Step Completion Rules

1. **All checkboxes must be checked**: Before a recipe step can be started, all preparation steps that come before it (based on `order` field) must have all their checkboxes with `hasCheckbox: true` checked.

2. **Order-based validation**: Preparation steps are validated based on their `order` field. If a preparation step has `order: 1` and a recipe step has `order: 2`, the preparation step must be completed before the recipe step can start.

3. **Real-time validation**: The frontend validates preparation step completion in real-time and disables recipe step buttons until all required preparation steps are completed.

---

## Data Flow

1. User clicks a checkbox in a preparation step
2. Frontend immediately updates the UI (optimistic update)
3. Frontend sends PATCH request to backend
4. Backend validates and updates the status in database
5. Backend returns success response
6. If error occurs, frontend reverts the UI change

---

## Related Endpoints

- `GET /tasks/{taskId}/details` - Get task details including recipe and preparation questions
- `POST /tasks/{taskId}/recipe/start` - Start recipe execution (validates preparation steps)
- `POST /tasks/{taskId}/recipe/steps/{stepOrder}/start` - Start a recipe step (validates preparation steps)

---

## Notes

- The endpoint is idempotent - calling it multiple times with the same `checked` value will have no additional effect
- The status update is tracked with timestamps for audit purposes
- Preparation question status is persisted and will be maintained across page refreshes
- The frontend uses optimistic updates for better UX, but the backend is the source of truth
