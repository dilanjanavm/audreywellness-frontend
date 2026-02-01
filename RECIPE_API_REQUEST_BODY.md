# Recipe API Request Body Documentation

## POST /recipes

### Request Body Structure

When creating a recipe, the following JSON structure is sent to the backend:

```json
{
  "name": "Product A - batch10kg Recipe",
  "productId": "c8cef53f-53f3-4610-aa74-444a0a85412b",
  "itemId": "c8cef53f-53f3-4610-aa74-444a0a85412b",
  "batchSize": "batch10kg",
  "totalTime": 15,
  "status": "active",
  "steps": [
    {
      "order": 1,
      "instruction": "add @DI Water 50% and boil it",
      "temperature": 100,
      "duration": 5
    },
    {
      "order": 2,
      "instruction": "Add @Vitamin E and mix well",
      "temperature": null,
      "duration": 10
    }
  ],
  "ingredients": [
    {
      "name": "DI Water",
      "quantity": 1.2,
      "unit": "Kg",
      "category": "Raw Material"
    },
    {
      "name": "Vitamin E",
      "quantity": 1,
      "unit": "Kg",
      "category": "Raw Material"
    }
  ]
}
```

### Field Descriptions

#### Root Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Recipe name. If not provided, defaults to "{ProductName} - {BatchSize} Recipe" |
| `productId` | string (UUID) | Yes | The UUID of the product/item this recipe belongs to |
| `itemId` | string (UUID) | Yes | Same as productId (item UUID) |
| `batchSize` | string | Yes | The batch size identifier (e.g., "batch10kg", "batch25kg") |
| `totalTime` | number | Yes | Total process time in minutes (sum of all step durations) |
| `status` | string | Yes | Recipe status. Options: "active", "draft", "archived" |
| `steps` | array | Yes | Array of recipe steps (at least 1 required) |
| `ingredients` | array | Yes | Array of ingredients with quantities for the selected batch size |

#### Steps Array Fields

Each step object contains:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order` | number | Yes | Step order number (1, 2, 3, ...) |
| `instruction` | string | Yes | Step instruction text. Can include '@' mentions for ingredients (e.g., "add @DI Water 50%") |
| `temperature` | number \| null | No | Temperature in Celsius. Can be null if not specified |
| `duration` | number | Yes | Duration in minutes for this step |

#### Ingredients Array Fields

Each ingredient object contains:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Ingredient name (e.g., "DI Water", "Vitamin E") |
| `quantity` | number | Yes | Quantity needed for the selected batch size |
| `unit` | string | Yes | Unit of measurement (e.g., "Kg", "L", "g") |
| `category` | string | No | Ingredient category (e.g., "Raw Material") |

### Example Request

```javascript
const recipeData = {
    name: "4E Alovera Gel with Lavender Frg - 5L (95%) - batch10kg Recipe",
    productId: "c8cef53f-53f3-4610-aa74-444a0a85412b",
    itemId: "c8cef53f-53f3-4610-aa74-444a0a85412b",
    batchSize: "batch10kg",
    totalTime: 15,
    steps: [
        {
            order: 1,
            instruction: "add @DI Water 50% and boil it",
            temperature: 100,
            duration: 5
        },
        {
            order: 2,
            instruction: "Add @Vitamin E and mix well at 80°C",
            temperature: 80,
            duration: 10
        }
    ],
    ingredients: [
        {
            name: "DI Water",
            quantity: 1.2,
            unit: "Kg",
            category: "Raw Material"
        },
        {
            name: "Vitamin E",
            quantity: 1,
            unit: "Kg",
            category: "Raw Material"
        }
    ],
    status: "active"
};
```

### Validation Rules

1. **Product/Item ID**: Must be a valid UUID of an existing costed product
2. **Batch Size**: Must match one of the available batch sizes from the product's costing
3. **Steps**: 
   - At least one step is required
   - Each step must have `instruction` and `duration`
   - `temperature` is optional
   - `order` must be sequential starting from 1
4. **Total Time**: Must equal the sum of all step durations
5. **Ingredients**: Automatically calculated based on selected batch size

### Notes

- The `@` symbol in instructions is used to mention ingredients (e.g., "@DI Water")
- Ingredient quantities are automatically calculated based on the selected batch size
- The `totalTime` is automatically calculated from the sum of all step durations
- If `recipeName` is not provided, it defaults to "{ProductName} - {BatchSize} Recipe"

