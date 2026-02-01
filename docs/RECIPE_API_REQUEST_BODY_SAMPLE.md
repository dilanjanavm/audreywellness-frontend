# Recipe API Request Body Sample

## Overview
This document provides sample request bodies for the Recipe Creation and Update APIs, including the new unified queue structure that supports both recipe steps and preparation/checking steps.

## Endpoints
- **Create Recipe**: `POST /recipes`
- **Update Recipe**: `PUT /recipes/{recipeId}`

---

## Request Body Structure

### Complete Request Body Sample

```json
{
  "name": "AC Aqua Bubble Bath 5L - batch150kg Recipe",
  "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "itemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "batchSize": "batch150kg",
  "totalTime": 120,
  "status": "active",
  "ingredients": [
    {
      "name": "Vitamin E",
      "quantity": 37.5,
      "unit": "Kg",
      "category": "Raw Material"
    },
    {
      "name": "DI Water",
      "quantity": 112.5,
      "unit": "Kg",
      "category": "Raw Material"
    }
  ],
  "steps": [
    {
      "order": 1,
      "instruction": "Add 50% @DI Water and heat to 100°C",
      "temperature": 100,
      "duration": 30
    },
    {
      "order": 3,
      "instruction": "Mix @Vitamin E with remaining water",
      "temperature": 50,
      "duration": 20
    },
    {
      "order": 4,
      "instruction": "Cool down to room temperature",
      "temperature": 25,
      "duration": 40
    }
  ],
  "preparationQuestions": [
    {
      "order": 2,
      "questions": [
        {
          "question": "Check all raw materials are available",
          "hasCheckbox": true
        },
        {
          "question": "Verify equipment is clean and ready",
          "hasCheckbox": true
        },
        {
          "question": "Ensure safety equipment is in place",
          "hasCheckbox": true
        }
      ]
    },
    {
      "order": 5,
      "questions": [
        {
          "question": "Quality check completed",
          "hasCheckbox": true
        },
        {
          "question": "Documentation updated",
          "hasCheckbox": false
        }
      ]
    }
  ]
}
```

---

## Field Descriptions

### Root Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Recipe name (e.g., "Product Name - batch150kg Recipe") |
| `productId` | UUID | Yes (Create only) | Product/Item UUID |
| `itemId` | UUID | Yes (Create only) | Item UUID (same as productId) |
| `batchSize` | string | Yes (Create only) | Batch size identifier (e.g., "batch150kg", "batch10kg") |
| `totalTime` | number | Yes | Total process time in minutes (sum of all step durations) |
| `status` | string | No | Recipe status: "active", "draft", "archived" (default: "active") |
| `ingredients` | array | Yes | Array of ingredient objects |
| `steps` | array | Yes | Array of recipe step objects |
| `preparationQuestions` | array | No | Array of preparation/checking step objects |

### Ingredients Array

Each ingredient object:
```json
{
  "name": "Vitamin E",
  "quantity": 37.5,
  "unit": "Kg",
  "category": "Raw Material"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Ingredient name |
| `quantity` | number | Yes | Quantity amount |
| `unit` | string | Yes | Unit of measurement (e.g., "Kg", "L", "g") |
| `category` | string | No | Ingredient category |

### Steps Array (Recipe Steps)

Each step object:
```json
{
  "order": 1,
  "instruction": "Add 50% @DI Water and heat to 100°C",
  "temperature": 100,
  "duration": 30
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order` | number | Yes | **Order in unified queue** (1, 2, 3, ...) |
| `instruction` | string | Yes | Step instruction text (supports @mentions for ingredients) |
| `temperature` | number | No | Temperature in Celsius (can be null) |
| `duration` | number | Yes | Duration in minutes |

### Preparation Questions Array

Each preparation step object:
```json
{
  "order": 2,
  "questions": [
    {
      "question": "Check all raw materials are available",
      "hasCheckbox": true
    },
    {
      "question": "Verify equipment is clean and ready",
      "hasCheckbox": true
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order` | number | Yes | **Order in unified queue** (1, 2, 3, ...) |
| `questions` | array | Yes | Array of question objects |

#### Question Object (within preparationQuestions)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | Question text (max 500 characters) |
| `hasCheckbox` | boolean | Yes | Whether to display a checkbox for this question |

---

## Unified Queue Order

**Important**: The `order` field in both `steps` and `preparationQuestions` arrays represents the **unified queue order**. The backend should maintain this order when storing and retrieving recipes.

### Example Queue Order:
1. **Step** (order: 1) - "Add 50% @DI Water and heat to 100°C"
2. **Preparation** (order: 2) - Preparation questions
3. **Step** (order: 3) - "Mix @Vitamin E with remaining water"
4. **Step** (order: 4) - "Cool down to room temperature"
5. **Preparation** (order: 5) - Quality check questions

---

## Example Scenarios

### Scenario 1: Recipe with Only Steps (No Preparation)

```json
{
  "name": "Simple Recipe - batch10kg",
  "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "itemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "batchSize": "batch10kg",
  "totalTime": 60,
  "status": "active",
  "ingredients": [
    {
      "name": "DI Water",
      "quantity": 10,
      "unit": "Kg",
      "category": "Raw Material"
    }
  ],
  "steps": [
    {
      "order": 1,
      "instruction": "Heat water to 80°C",
      "temperature": 80,
      "duration": 30
    },
    {
      "order": 2,
      "instruction": "Add ingredients and mix",
      "temperature": null,
      "duration": 30
    }
  ],
  "preparationQuestions": []
}
```

### Scenario 2: Recipe Starting with Preparation

```json
{
  "name": "Complex Recipe - batch150kg",
  "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "itemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "batchSize": "batch150kg",
  "totalTime": 180,
  "status": "active",
  "ingredients": [
    {
      "name": "Vitamin E",
      "quantity": 37.5,
      "unit": "Kg",
      "category": "Raw Material"
    },
    {
      "name": "DI Water",
      "quantity": 112.5,
      "unit": "Kg",
      "category": "Raw Material"
    }
  ],
  "steps": [
    {
      "order": 2,
      "instruction": "Add 50% @DI Water and heat to 100°C",
      "temperature": 100,
      "duration": 30
    },
    {
      "order": 4,
      "instruction": "Mix @Vitamin E with remaining water",
      "temperature": 50,
      "duration": 20
    }
  ],
  "preparationQuestions": [
    {
      "order": 1,
      "questions": [
        {
          "question": "Check all raw materials are available",
          "hasCheckbox": true
        },
        {
          "question": "Verify equipment is clean",
          "hasCheckbox": true
        }
      ]
    },
    {
      "order": 3,
      "questions": [
        {
          "question": "Temperature reached 100°C",
          "hasCheckbox": true
        }
      ]
    },
    {
      "order": 5,
      "questions": [
        {
          "question": "Final quality check",
          "hasCheckbox": true
        }
      ]
    }
  ]
}
```

### Scenario 3: Update Recipe (No productId/itemId/batchSize)

```json
{
  "name": "Updated Recipe Name",
  "totalTime": 150,
  "status": "active",
  "ingredients": [
    {
      "name": "Vitamin E",
      "quantity": 40,
      "unit": "Kg",
      "category": "Raw Material"
    }
  ],
  "steps": [
    {
      "order": 1,
      "instruction": "Updated instruction",
      "temperature": 90,
      "duration": 35
    }
  ],
  "preparationQuestions": [
    {
      "order": 2,
      "questions": [
        {
          "question": "Updated preparation question",
          "hasCheckbox": true
        }
      ]
    }
  ]
}
```

---

## Validation Rules

### Required Fields
- `name` - Must be provided
- `totalTime` - Must be a positive number
- `ingredients` - Must be a non-empty array
- `steps` - Must be a non-empty array (at least one step)
- `preparationQuestions` - Can be empty array `[]`

### Step Validation
- Each step must have:
  - `order` (positive integer, unique within recipe)
  - `instruction` (non-empty string)
  - `duration` (positive number)

### Preparation Question Validation
- Each preparation step must have:
  - `order` (positive integer, unique within recipe)
  - `questions` (non-empty array)
- Each question must have:
  - `question` (non-empty string, max 500 characters)
  - `hasCheckbox` (boolean)

### Order Validation
- `order` values in `steps` and `preparationQuestions` should be unique
- Order values should be sequential (1, 2, 3, ...) but gaps are allowed
- The backend should maintain the order as specified

---

## Notes for Backend Team

1. **Unified Queue**: The `order` field in both `steps` and `preparationQuestions` represents a unified queue. When displaying the recipe, items should be sorted by `order` regardless of type.

2. **Order Preservation**: The frontend sends the exact order values. The backend should preserve these values and return them in the same order when fetching recipes.

3. **Preparation Questions Structure**: Each preparation step contains an array of questions. This allows multiple questions per preparation step.

4. **Temperature Field**: Can be `null` if not specified. Backend should handle `null` values appropriately.

5. **Ingredient Mentions**: The `instruction` field may contain `@IngredientName` mentions. These are for display purposes only and don't need special backend processing.

6. **Update vs Create**: 
   - **Create**: Requires `productId`, `itemId`, and `batchSize`
   - **Update**: These fields are not sent (recipe already associated with product)

---

## Response Format Expected

When fetching a recipe, the backend should return the same structure:

```json
{
  "statusCode": 200,
  "data": {
    "id": "recipe-uuid",
    "name": "AC Aqua Bubble Bath 5L - batch150kg Recipe",
    "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "itemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "batchSize": "batch150kg",
    "totalTime": 120,
    "status": "active",
    "ingredients": [...],
    "steps": [...],
    "preparationQuestions": [...],
    "createdAt": "2026-01-24T10:00:00.000Z",
    "updatedAt": "2026-01-24T10:00:00.000Z"
  }
}
```

The `steps` and `preparationQuestions` arrays should be returned with their `order` values preserved, allowing the frontend to reconstruct the unified queue.
