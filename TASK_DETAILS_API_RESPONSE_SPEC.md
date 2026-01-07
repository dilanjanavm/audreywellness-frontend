# Task Details API Response Specification

## Endpoint
```
GET /tasks/:taskId/details
```

## Expected Response Structure

The frontend expects the following response structure:

```json
{
  "statusCode": 200,
  "data": {
    "task": {
      // Task object with all task details
    },
    "recipe": {
      // Active recipe associated with the task's costed product
    },
    "costedProduct": {
      // Costed product information
    },
    "recipeExecution": {
      // Current recipe execution status (if execution exists)
    },
    "comments": [
      // Array of comments (optional)
    ],
    "phases": [
      // Array of phases (optional)
    ]
  }
}
```

## Detailed Field Specifications

### 1. `task` Object (Required)

The main task object. The frontend expects the following fields:

```json
{
  "id": "uuid",
  "taskId": "string (e.g., TASK-1766432275840-5LNZ9O84E)",
  "phaseId": "uuid",
  "status": "pending" | "ongoing" | "review" | "completed" | "failed",
  "order": 0,
  "task": "string (task title)",
  "description": "string",
  "priority": "low" | "medium" | "high" | "urgent",
  "dueDate": "ISO 8601 date string",
  "assignee": {
    "id": "uuid",
    "name": "string",
    "role": "string"
  },
  "assignedUserId": "uuid",
  "assignedUser": {
    "id": "uuid",
    "userName": "string",
    "email": "string",
    "avatar": "string (optional)"
  },
  "costingId": "uuid",
  "costing": {
    "id": "uuid",
    "itemName": "string",
    "itemCode": "string",
    "version": 1,
    "isActive": true
  },
  "batchSize": "string (e.g., 'batch10kg')",
  "rawMaterials": [
    {
      "kg": 1.0,
      "cost": 500,
      "units": "Kg",
      "category": "Raw Material",
      "supplier": "string",
      "unitPrice": "500.00",
      "percentage": "10.0000",
      "rawMaterialId": "uuid",
      "rawMaterialName": "string"
    }
  ],
  "comments": 0,
  "commentList": [],
  "views": 0,
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string",
  "updatedBy": null
}
```

**Important Notes:**
- `taskId` is used for API calls (recipe execution endpoints)
- `id` is the UUID identifier
- `rawMaterials` array is displayed in a table showing material details
- `batchSize` is formatted and displayed (e.g., "batch10kg" → "10 kg")

### 2. `recipe` Object (Optional, but required if task has a costed product with recipe)

The active recipe associated with the task's costed product:

```json
{
  "id": "uuid",
  "name": "string",
  "productId": "uuid",
  "itemId": "uuid",
  "batchSize": "string (e.g., 'batch10kg')",
  "totalTime": 55,
  "status": "active",
  "version": 1,
  "isActiveVersion": true,
  "createdBy": "string",
  "updatedBy": "string",
  "steps": [
    {
      "id": "uuid",
      "order": 1,
      "instruction": "string",
      "temperature": 100,
      "duration": 10,
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "ingredients": [
    {
      "id": "uuid",
      "name": "string",
      "quantity": 1.0,
      "unit": "Kg",
      "category": "Raw Material",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string",
  "allVersions": [
    {
      "id": "uuid",
      "name": "string",
      "version": 2,
      "isActiveVersion": false,
      "status": "active",
      "totalTime": 29,
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "countOfVersions": 2
}
```

**Important Notes:**
- `steps` array must be sorted by `order` field
- `steps[].duration` is in minutes
- Frontend also accepts `activeRecipe` as an alternative field name

### 3. `costedProduct` Object (Optional, but recommended if task has costing)

The costed product information:

```json
{
  "itemId": "uuid",
  "itemCode": "string",
  "itemName": "string",
  "category": "string",
  "categoryId": "uuid",
  "units": "string (e.g., 'pcs')",
  "price": "string",
  "currency": "string (e.g., 'LKR')",
  "status": "Active" | "Inactive",
  "hasActiveCosting": true,
  "activeCostingVersion": 1,
  "totalCostingVersions": 1,
  "latestCosting": {
    "id": "uuid",
    "version": 1,
    "isActive": true,
    "itemId": "uuid",
    "itemName": "string",
    "itemCode": "string",
    "rawMaterials": [
      {
        "id": "uuid",
        "rawMaterialId": "uuid",
        "rawMaterialName": "string",
        "percentage": "10.0000",
        "unitPrice": "500.00",
        "supplier": "string",
        "supplierId": "string",
        "category": "Raw Material",
        "categoryId": "uuid",
        "units": "Kg",
        "amountNeeded": "50.00",
        "totalCost": "25000.0000",
        "batchCalculations": {
          "batch1kg": { "kg": 0.1, "cost": 50 },
          "batch10kg": { "kg": 1, "cost": 500 },
          "batch25kg": { "kg": 2.5, "cost": 1250 },
          "batch50kg": { "kg": 5, "cost": 2500 },
          "batch0_5kg": { "kg": 0.05, "cost": 25 },
          "batch100kg": { "kg": 10, "cost": 5000 },
          "batch150kg": { "kg": 15, "cost": 7500 },
          "batch200kg": { "kg": 20, "cost": 10000 }
        },
        "createdAt": "ISO 8601 date string",
        "updatedAt": "ISO 8601 date string"
      }
    ],
    "additionalCosts": [
      {
        "id": "uuid",
        "costName": "string",
        "description": "string",
        "costPerUnit": "100.00",
        "batchCosts": {
          "batch1kg": 100,
          "batch10kg": 0,
          "batch25kg": 0,
          "batch50kg": 0,
          "batch0_5kg": 100,
          "batch100kg": 0,
          "batch150kg": 0,
          "batch200kg": 0
        },
        "createdAt": "ISO 8601 date string",
        "updatedAt": "ISO 8601 date string"
      }
    ],
    "totalCosts": [
      {
        "id": "uuid",
        "batchSize": "batch10kg",
        "cost": "1700.00",
        "kg": "2.20",
        "rawMaterialCost": "1700.0000",
        "additionalCost": "0.0000",
        "createdAt": "ISO 8601 date string",
        "updatedAt": "ISO 8601 date string"
      }
    ],
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string",
    "status": "Active",
    "totalRawMaterialCost": "145000.0000",
    "totalAdditionalCost": "200.0000",
    "totalPercentage": "22.0000"
  },
  "allCostingVersions": [
    // Same structure as latestCosting
  ],
  "lastCostUpdate": "ISO 8601 date string",
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string"
}
```

### 4. `recipeExecution` Object (Optional, only if recipe execution has been started)

The current recipe execution status. This is critical for the "Start Recipe" tab:

```json
{
  "id": "uuid",
  "taskId": "uuid",
  "recipeId": "uuid",
  "status": "not_started" | "in_progress" | "paused" | "completed" | "cancelled",
  "currentStep": {
    "stepOrder": 1,
    "startedAt": "ISO 8601 date string",
    "progress": 45,
    "elapsedTime": 4.5
  },
  "overallProgress": 25,
  "elapsedTime": 10.5,
  "startedAt": "ISO 8601 date string",
  "pausedAt": "ISO 8601 date string (optional)",
  "resumedAt": "ISO 8601 date string (optional)",
  "completedAt": "ISO 8601 date string (optional)",
  "cancelledAt": "ISO 8601 date string (optional)",
  "stepExecutions": [
    {
      "id": "uuid",
      "stepOrder": 1,
      "status": "pending" | "in_progress" | "completed",
      "startedAt": "ISO 8601 date string (optional)",
      "completedAt": "ISO 8601 date string (optional)",
      "progress": 45,
      "elapsedTime": 4.5,
      "actualDuration": 10.5,
      "actualTemperature": 100,
      "notes": "string (optional)"
    }
  ],
  "recipe": {
    // Full recipe object (same structure as recipe field above)
    // This is important - the frontend prefers recipeExecution.recipe over the recipe prop
    "id": "uuid",
    "name": "string",
    "steps": [
      {
        "id": "uuid",
        "order": 1,
        "instruction": "string",
        "temperature": 100,
        "duration": 10
      }
    ],
    "totalTime": 55
  },
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string"
}
```

**Critical Notes:**
- `recipeExecution.recipe` should contain the full recipe object with all steps and durations
- Frontend prioritizes `recipeExecution.recipe` over the `recipe` field
- `currentStep.progress` and `stepExecutions[].progress` should be 0-100
- `elapsedTime` is in minutes
- `stepExecutions` array should include all steps, even if not started yet

### 5. `comments` Array (Optional)

Array of comment objects:

```json
[
  {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "user": {
      "id": "uuid",
      "userName": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "content": "string",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

### 6. `phases` Array (Optional)

Array of phase objects:

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "order": 0,
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

## Response Handling Logic

The frontend handles the response as follows:

1. **Response Structure Check:**
   ```javascript
   const responseData = response.data?.data || response.data;
   ```

2. **Task Extraction:**
   ```javascript
   if (responseData.task) {
     setTask(responseData.task);
   } else if (responseData.id || responseData.taskId) {
     // Fallback: if data is directly the task object
     setTask(responseData);
   }
   ```

3. **Recipe Extraction:**
   ```javascript
   if (responseData.recipe) {
     setRecipe(responseData.recipe);
   } else if (responseData.activeRecipe) {
     setRecipe(responseData.activeRecipe);
   }
   ```

4. **Costed Product Extraction:**
   ```javascript
   if (responseData.costedProduct) {
     setCostedProduct(responseData.costedProduct);
   }
   ```

5. **Recipe Execution Extraction:**
   ```javascript
   if (responseData.recipeExecution) {
     setRecipeExecution(responseData.recipeExecution);
   }
   ```

## Example Complete Response

```json
{
  "statusCode": 200,
  "data": {
    "task": {
      "id": "0c5e9668-7c3e-4869-b922-7dec7a4008cc",
      "taskId": "TASK-1766432275840-5LNZ9O84E",
      "phaseId": "b83469d7-ec05-42a3-af5b-71881514874e",
      "status": "pending",
      "order": 0,
      "task": "Costed Product task",
      "description": "Costed Product task",
      "priority": "medium",
      "dueDate": "2025-12-25T18:30:00.000Z",
      "assignee": {
        "id": "53f5f6e7-bbfe-4ccc-802e-2b49088759d4",
        "name": "Dilanjaan",
        "role": "Collaborator"
      },
      "assignedUserId": "53f5f6e7-bbfe-4ccc-802e-2b49088759d4",
      "assignedUser": {
        "id": "53f5f6e7-bbfe-4ccc-802e-2b49088759d4",
        "userName": "Dilanjaan",
        "email": "dilanjana@webmotech.com"
      },
      "costingId": "2b606d60-a8b0-4680-8bb4-6503bb1dc4a5",
      "costing": {
        "id": "2b606d60-a8b0-4680-8bb4-6503bb1dc4a5",
        "itemName": "4E Alovera Gel with Lavender Frg - 5L (95%)",
        "itemCode": "10007",
        "version": 1,
        "isActive": true
      },
      "batchSize": "batch10kg",
      "rawMaterials": [
        {
          "kg": 1,
          "cost": 500,
          "units": "Kg",
          "category": "Raw Material",
          "supplier": "",
          "unitPrice": "500.00",
          "percentage": "10.0000",
          "rawMaterialId": "e3b76593-14ab-40ec-a49b-0e8a07781e36",
          "rawMaterialName": "Vitamin E"
        },
        {
          "kg": 1.2,
          "cost": 1200,
          "units": "Kg",
          "category": "Raw Material",
          "supplier": "",
          "unitPrice": "1000.00",
          "percentage": "12.0000",
          "rawMaterialId": "4eb71c06-f379-4e1a-9197-3e7b68c868ee",
          "rawMaterialName": "DI Water"
        }
      ],
      "comments": 0,
      "commentList": [],
      "views": 0,
      "createdAt": "2025-12-22T19:37:56.080Z",
      "updatedAt": "2025-12-22T19:37:56.080Z",
      "updatedBy": null
    },
    "recipe": {
      "id": "9fe68d97-74d5-4cee-b267-7ec9070d12b7",
      "name": "4E Alovera Gel with Lavender Frg",
      "productId": "a50b16cf-db22-48ae-8bd6-68eab1111a17",
      "itemId": "a50b16cf-db22-48ae-8bd6-68eab1111a17",
      "batchSize": "batch10kg",
      "totalTime": 55,
      "status": "active",
      "version": 1,
      "isActiveVersion": true,
      "createdBy": "",
      "updatedBy": "",
      "steps": [
        {
          "id": "a5242047-afa4-4f4b-b6e5-a2e89c82e1ad",
          "order": 1,
          "instruction": "@DI Water add 50% e",
          "temperature": 100,
          "duration": 10,
          "createdAt": "2025-12-22T10:27:42.449Z",
          "updatedAt": "2025-12-22T10:27:42.449Z"
        },
        {
          "id": "faf4524e-a1bb-4372-9a1d-690fc3172ff7",
          "order": 2,
          "instruction": "Vitamin E all add this and mixed all 54",
          "temperature": 5,
          "duration": 45,
          "createdAt": "2025-12-22T10:27:42.453Z",
          "updatedAt": "2025-12-22T10:27:42.453Z"
        }
      ],
      "ingredients": [
        {
          "id": "0348e294-5a96-41f3-a14e-a242992e29ff",
          "name": "Vitamin E",
          "quantity": 1,
          "unit": "Kg",
          "category": "Raw Material",
          "createdAt": "2025-12-22T10:27:42.471Z",
          "updatedAt": "2025-12-22T10:27:42.471Z"
        },
        {
          "id": "c03eae66-c3fd-4151-a94c-a0de93bf2c18",
          "name": "DI Water",
          "quantity": 1.2,
          "unit": "Kg",
          "category": "Raw Material",
          "createdAt": "2025-12-22T10:27:42.474Z",
          "updatedAt": "2025-12-22T10:27:42.474Z"
        }
      ],
      "createdAt": "2025-12-22T10:18:32.486Z",
      "updatedAt": "2025-12-22T10:56:15.000Z",
      "allVersions": [
        {
          "id": "fec275ea-1658-4ac1-948d-9d48a99c7859",
          "name": "4E Alovera Gel with Lavender Frg - 5L (95%) add",
          "version": 2,
          "isActiveVersion": false,
          "status": "active",
          "totalTime": 29,
          "createdAt": "2025-12-22T10:28:39.678Z",
          "updatedAt": "2025-12-22T10:56:15.000Z"
        },
        {
          "id": "9fe68d97-74d5-4cee-b267-7ec9070d12b7",
          "name": "4E Alovera Gel with Lavender Frg",
          "version": 1,
          "isActiveVersion": true,
          "status": "active",
          "totalTime": 55,
          "createdAt": "2025-12-22T10:18:32.486Z",
          "updatedAt": "2025-12-22T10:56:15.000Z"
        }
      ],
      "countOfVersions": 2
    },
    "costedProduct": {
      "itemId": "a50b16cf-db22-48ae-8bd6-68eab1111a17",
      "itemCode": "10007",
      "itemName": "4E Alovera Gel with Lavender Frg - 5L (95%)",
      "category": "Horeka Range",
      "categoryId": "00565f16-205b-40b8-9c39-29ea8d63de31",
      "units": "pcs",
      "price": "0.00",
      "currency": "LKR",
      "status": "Active",
      "hasActiveCosting": true,
      "activeCostingVersion": 1,
      "totalCostingVersions": 1,
      "latestCosting": {
        "id": "2b606d60-a8b0-4680-8bb4-6503bb1dc4a5",
        "version": 1,
        "isActive": true,
        "itemId": "a50b16cf-db22-48ae-8bd6-68eab1111a17",
        "itemName": "4E Alovera Gel with Lavender Frg - 5L (95%)",
        "itemCode": "10007",
        "rawMaterials": [],
        "additionalCosts": [],
        "totalCosts": [],
        "createdAt": "2025-12-16T04:02:55.536Z",
        "updatedAt": "2025-12-16T04:02:55.000Z",
        "status": "Active",
        "totalRawMaterialCost": "145000.0000",
        "totalAdditionalCost": "200.0000",
        "totalPercentage": "22.0000"
      },
      "allCostingVersions": [],
      "lastCostUpdate": "2025-12-16T04:02:55.000Z",
      "createdAt": "2025-10-23T07:55:58.264Z",
      "updatedAt": "2025-10-24T09:42:43.000Z"
    },
    "recipeExecution": {
      "id": "uuid",
      "taskId": "0c5e9668-7c3e-4869-b922-7dec7a4008cc",
      "recipeId": "9fe68d97-74d5-4cee-b267-7ec9070d12b7",
      "status": "not_started",
      "currentStep": null,
      "overallProgress": 0,
      "elapsedTime": 0,
      "stepExecutions": [],
      "recipe": {
        "id": "9fe68d97-74d5-4cee-b267-7ec9070d12b7",
        "name": "4E Alovera Gel with Lavender Frg",
        "steps": [
          {
            "id": "a5242047-afa4-4f4b-b6e5-a2e89c82e1ad",
            "order": 1,
            "instruction": "@DI Water add 50% e",
            "temperature": 100,
            "duration": 10
          },
          {
            "id": "faf4524e-a1bb-4372-9a1d-690fc3172ff7",
            "order": 2,
            "instruction": "Vitamin E all add this and mixed all 54",
            "temperature": 5,
            "duration": 45
          }
        ],
        "totalTime": 55
      },
      "createdAt": "2025-12-22T19:37:56.080Z",
      "updatedAt": "2025-12-22T19:37:56.080Z"
    },
    "comments": [],
    "phases": []
  }
}
```

## Important Notes for Backend Team

1. **Response Wrapper**: The response must be wrapped in `{ statusCode: 200, data: {...} }` structure
2. **Task ID**: Both `task.id` (UUID) and `task.taskId` (string) should be present. `task.taskId` is used for API calls.
3. **Recipe Execution**: If a recipe execution exists, it should be included in `recipeExecution`. If not started yet, it can be `null` or omitted.
4. **Recipe in Execution**: The `recipeExecution.recipe` field should contain the full recipe object with all steps and durations. This is critical for the frontend.
5. **Steps Sorting**: Recipe steps should be sorted by `order` field in ascending order.
6. **Date Formats**: All dates should be in ISO 8601 format (e.g., "2025-12-22T19:37:56.080Z")
7. **Null vs Omitted**: Optional fields can be `null` or omitted entirely - the frontend handles both cases.

## Error Response

If the task is not found or there's an error:

```json
{
  "statusCode": 404,
  "message": "Task not found"
}
```

Or:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

The frontend will handle these errors and redirect users appropriately.

