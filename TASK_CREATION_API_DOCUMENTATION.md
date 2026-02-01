# Task Creation API Documentation - Phase-Wise Request Bodies

## Overview

This document provides a comprehensive guide for creating tasks in the system, organized by phase. All tasks are created using the same API endpoint, but the required and optional fields may vary depending on the phase and use case.

---

## API Endpoint

**Endpoint:** `POST /tasks`

**Authentication:** Required (Bearer Token)

**Content-Type:** `application/json`

---

## Common Request Body Structure

All task creation requests share the same base structure. The fields included depend on the phase and specific requirements.

### Base Request Body

```json
{
  "task": "string (required)",
  "phaseId": "uuid (required)",
  "status": "string (required)",
  "description": "string (optional)",
  "priority": "string (optional)",
  "dueDate": "string (ISO 8601, optional)",
  "assignedUserId": "uuid (optional)",
  "costingId": "uuid (optional)",
  "batchSize": "string (optional)",
  "rawMaterials": "array (optional)",
  "comments": "number (optional, default: 0)",
  "views": "number (optional, default: 0)",
  "order": "number (optional, default: 0)"
}
```

---

## Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `task` | string | Task title/name | `"Prepare Herbal Blend Mix"` |
| `phaseId` | uuid | UUID of the phase this task belongs to | `"550e8400-e29b-41d4-a716-446655440000"` |
| `status` | string | Task status (see Status Values below) | `"pending"` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Detailed task description | `"Mix ingredients according to recipe"` |
| `priority` | string | Task priority level | `"high"`, `"medium"`, `"low"`, `"urgent"` |
| `dueDate` | string | Due date in ISO 8601 format | `"2024-12-31T23:59:59.000Z"` |
| `assignedUserId` | uuid | UUID of user assigned to the task | `"660e8400-e29b-41d4-a716-446655440001"` |
| `costingId` | uuid | UUID of costed product to associate | `"770e8400-e29b-41d4-a716-446655440002"` |
| `batchSize` | string | Batch size identifier | `"batch1kg"`, `"batch10kg"`, `"batch25kg"` |
| `rawMaterials` | array | Raw materials array (see Raw Materials Structure) | See below |
| `comments` | number | Initial comment count | `0` |
| `views` | number | Initial view count | `0` |
| `order` | number | Display order within phase/status | `0` |

### Status Values

Valid status values:
- `"pending"` - Task is pending/not started
- `"ongoing"` - Task is in progress
- `"review"` - Task is under review
- `"completed"` - Task is completed
- `"failed"` - Task has failed

### Priority Values

Valid priority values:
- `"low"` - Low priority
- `"medium"` - Medium priority (default)
- `"high"` - High priority
- `"urgent"` - Urgent priority

### Batch Size Values

Common batch size identifiers:
- `"batch0_5kg"` - 0.5 kg batch
- `"batch1kg"` - 1 kg batch
- `"batch10kg"` - 10 kg batch
- `"batch25kg"` - 25 kg batch
- `"batch50kg"` - 50 kg batch
- `"batch100kg"` - 100 kg batch
- `"batch150kg"` - 150 kg batch
- `"batch200kg"` - 200 kg batch

---

## Raw Materials Structure

When `batchSize` is provided, you can optionally include `rawMaterials` array with detailed material information:

```json
{
  "rawMaterials": [
    {
      "rawMaterialId": "string (required)",
      "rawMaterialName": "string (required)",
      "percentage": "number (required)",
      "unitPrice": "number (required)",
      "units": "string (required)",
      "supplier": "string (optional)",
      "category": "string (optional)",
      "kg": "number (required)",
      "cost": "number (required)"
    }
  ]
}
```

### Raw Material Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `rawMaterialId` | string | Raw material identifier | `"RM-001"` |
| `rawMaterialName` | string | Name of raw material | `"Turmeric Powder"` |
| `percentage` | number | Percentage in recipe | `15.5` |
| `unitPrice` | number | Price per unit | `250.00` |
| `units` | string | Unit of measurement | `"kg"` |
| `supplier` | string | Supplier name | `"ABC Suppliers"` |
| `category` | string | Material category | `"Herbs"` |
| `kg` | number | Quantity in kg for this batch | `0.5` |
| `cost` | number | Total cost for this material | `125.00` |

---

## Phase-Wise Request Body Examples

### Phase 1: Blending

**Phase Description:** Initial blending activities and prep work.

**Typical Use Cases:**
- Raw material preparation
- Ingredient mixing
- Pre-blending activities

#### Example 1: Basic Blending Task

```json
{
  "task": "Prepare Herbal Blend Mix",
  "phaseId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "description": "Mix turmeric, ginger, and cinnamon according to recipe",
  "priority": "high",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001"
}
```

#### Example 2: Blending Task with Costing and Batch Size

```json
{
  "task": "Prepare 10kg Herbal Blend",
  "phaseId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "description": "Prepare 10kg batch of herbal blend for production",
  "priority": "high",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "costingId": "770e8400-e29b-41d4-a716-446655440002",
  "batchSize": "batch10kg",
  "rawMaterials": [
    {
      "rawMaterialId": "RM-001",
      "rawMaterialName": "Turmeric Powder",
      "percentage": 30.0,
      "unitPrice": 250.00,
      "units": "kg",
      "supplier": "ABC Suppliers",
      "category": "Herbs",
      "kg": 3.0,
      "cost": 750.00
    },
    {
      "rawMaterialId": "RM-002",
      "rawMaterialName": "Ginger Powder",
      "percentage": 25.0,
      "unitPrice": 300.00,
      "units": "kg",
      "supplier": "XYZ Suppliers",
      "category": "Herbs",
      "kg": 2.5,
      "cost": 750.00
    },
    {
      "rawMaterialId": "RM-003",
      "rawMaterialName": "Cinnamon Powder",
      "percentage": 20.0,
      "unitPrice": 400.00,
      "units": "kg",
      "supplier": "ABC Suppliers",
      "category": "Spices",
      "kg": 2.0,
      "cost": 800.00
    }
  ],
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example 3: Minimal Blending Task

```json
{
  "task": "Check Raw Material Inventory",
  "phaseId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

---

### Phase 2: Filling and Packing

**Phase Description:** Filling, packing and fulfillment tasks.

**Typical Use Cases:**
- Product filling
- Packaging operations
- Labeling
- Quality checks before packing

#### Example 1: Basic Filling Task

```json
{
  "task": "Fill 100ml Bottles",
  "phaseId": "660e8400-e29b-41d4-a716-446655440010",
  "status": "pending",
  "description": "Fill 100ml bottles with prepared blend",
  "priority": "medium",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example 2: Packing Task with Costing

```json
{
  "task": "Package 50kg Batch",
  "phaseId": "660e8400-e29b-41d4-a716-446655440010",
  "status": "pending",
  "description": "Package the 50kg batch into appropriate containers",
  "priority": "high",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "costingId": "770e8400-e29b-41d4-a716-446655440002",
  "batchSize": "batch50kg",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example 3: Labeling Task

```json
{
  "task": "Label Product Containers",
  "phaseId": "660e8400-e29b-41d4-a716-446655440010",
  "status": "pending",
  "description": "Apply labels to all filled containers",
  "priority": "medium",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

### Phase 3: Lab

**Phase Description:** Lab testing and QA validation.

**Typical Use Cases:**
- Quality assurance testing
- Lab analysis
- Product validation
- Compliance checks

#### Example 1: Basic Lab Testing Task

```json
{
  "task": "Quality Assurance Test",
  "phaseId": "770e8400-e29b-41d4-a716-446655440020",
  "status": "pending",
  "description": "Perform QA testing on completed batch",
  "priority": "high",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example 2: Lab Analysis with Costing

```json
{
  "task": "Chemical Analysis - Batch 10kg",
  "phaseId": "770e8400-e29b-41d4-a716-446655440020",
  "status": "pending",
  "description": "Perform chemical analysis on 10kg batch",
  "priority": "urgent",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "costingId": "770e8400-e29b-41d4-a716-446655440002",
  "batchSize": "batch10kg",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example 3: Compliance Check Task

```json
{
  "task": "Regulatory Compliance Check",
  "phaseId": "770e8400-e29b-41d4-a716-446655440020",
  "status": "pending",
  "description": "Verify product meets regulatory requirements",
  "priority": "high",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

## Custom Phases

The system supports custom phases created by administrators. When creating tasks for custom phases, use the same request body structure. The `phaseId` will be the UUID of the custom phase.

### Example: Custom Phase Task

```json
{
  "task": "Custom Phase Task",
  "phaseId": "880e8400-e29b-41d4-a716-446655440030",
  "status": "pending",
  "description": "Task in custom phase",
  "priority": "medium",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

## Request Body Validation Rules

### Required Field Validation

1. **`task`**: Must be a non-empty string
2. **`phaseId`**: Must be a valid UUID
3. **`status`**: Must be one of: `"pending"`, `"ongoing"`, `"review"`, `"completed"`, `"failed"`

### Optional Field Validation

1. **`priority`**: If provided, must be one of: `"low"`, `"medium"`, `"high"`, `"urgent"`
2. **`dueDate`**: If provided, must be a valid ISO 8601 date string
3. **`assignedUserId`**: If provided, must be a valid UUID
4. **`costingId`**: If provided, must be a valid UUID
5. **`batchSize`**: If provided, should match a valid batch size identifier
6. **`rawMaterials`**: If provided, must be an array of valid raw material objects
7. **`comments`**: If provided, must be a non-negative number (default: 0)
8. **`views`**: If provided, must be a non-negative number (default: 0)
9. **`order`**: If provided, must be a number (default: 0)

### Fields to Exclude

**Never include these fields in the request body:**
- `taskId` - Auto-generated by backend
- `id` - Auto-generated by backend
- `_id` - Auto-generated by backend
- `updatedBy` - Auto-managed by backend

---

## Complete Request Examples

### Minimal Request (Only Required Fields)

```json
{
  "task": "Simple Task",
  "phaseId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

### Full Request (All Optional Fields)

```json
{
  "task": "Complete Production Task",
  "phaseId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "description": "Complete task with all optional fields",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedUserId": "660e8400-e29b-41d4-a716-446655440001",
  "costingId": "770e8400-e29b-41d4-a716-446655440002",
  "batchSize": "batch10kg",
  "rawMaterials": [
    {
      "rawMaterialId": "RM-001",
      "rawMaterialName": "Material Name",
      "percentage": 30.0,
      "unitPrice": 250.00,
      "units": "kg",
      "supplier": "Supplier Name",
      "category": "Category",
      "kg": 3.0,
      "cost": 750.00
    }
  ],
  "comments": 0,
  "views": 0,
  "order": 0
}
```

---

## Response Structure

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "taskId": "TASK-1234567890-ABCDEF",
    "task": "Task Title",
    "phaseId": "uuid",
    "status": "pending",
    "description": "Task description",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "assignedUserId": "uuid",
    "costingId": "uuid",
    "batchSize": "batch10kg",
    "rawMaterials": [...],
    "comments": 0,
    "views": 0,
    "order": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "field": "task",
      "message": "Task title is required"
    }
  ]
}
```

---

## Best Practices

1. **Always include `phaseId`**: Every task must belong to a phase
2. **Use appropriate status**: Start with `"pending"` for new tasks
3. **Set priority wisely**: Use `"urgent"` only for critical tasks
4. **Include `costingId` when relevant**: Link tasks to costed products for better tracking
5. **Include `batchSize` with costing**: When using `costingId`, include `batchSize` for accurate material tracking
6. **Include `rawMaterials` with batch**: When `batchSize` is provided, include `rawMaterials` array for complete information
7. **Set `dueDate` for time-sensitive tasks**: Helps with scheduling and prioritization
8. **Assign tasks appropriately**: Use `assignedUserId` to assign tasks to specific users
9. **Provide clear descriptions**: Help team members understand task requirements
10. **Exclude auto-generated fields**: Never include `taskId`, `id`, `_id`, or `updatedBy`

---

## Common Use Cases by Phase

### Blending Phase
- Raw material preparation
- Ingredient mixing
- Pre-production blending
- Quality checks before filling

### Filling and Packing Phase
- Product filling operations
- Container packaging
- Labeling and branding
- Final quality checks

### Lab Phase
- Quality assurance testing
- Chemical analysis
- Regulatory compliance checks
- Product validation

---

## Notes

1. **Phase IDs are dynamic**: Phase UUIDs are generated when phases are created. Always fetch current phases before creating tasks.

2. **Costing and Batch Size relationship**: When `costingId` is provided, you can optionally include `batchSize`. When `batchSize` is included, you should also include `rawMaterials` array with calculated values.

3. **Raw Materials calculation**: The `rawMaterials` array should contain materials calculated for the specific `batchSize`. The `kg` and `cost` fields should reflect the batch size requirements.

4. **Status transitions**: Tasks can be moved between statuses (`pending` → `ongoing` → `review` → `completed` or `failed`).

5. **Order field**: The `order` field determines the display order within a phase and status. Lower numbers appear first.

---

## Support

For questions or issues regarding task creation, please refer to:
- API documentation: `/api-docs`
- Backend team for phase-specific requirements
- Frontend team for UI-related questions

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-01  
**Maintained By:** Development Team
