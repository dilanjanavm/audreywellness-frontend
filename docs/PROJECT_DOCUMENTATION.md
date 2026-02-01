# Project Documentation - Audrey Wellness Frontend

**Version:** 2.4.0  
**Last Updated:** January 2025  
**Framework:** React 18.2.0  
**UI Library:** Ant Design 5.16.1, Reactstrap 9.2.0  
**State Management:** Redux Toolkit

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Getting Started After Login](#getting-started-after-login)
4. [Navigation Structure](#navigation-structure)
5. [Master Data vs Dependent Data](#master-data-vs-dependent-data)
6. [Initial Setup Workflow](#initial-setup-workflow)
7. [Module Catalog](#module-catalog)
8. [User Workflows](#user-workflows)
9. [Data Import Order](#data-import-order)
10. [Module Dependencies](#module-dependencies)
11. [Quick Reference Guide](#quick-reference-guide)

---

## Overview

The Audrey Wellness Frontend is a comprehensive admin dashboard built with React, designed to manage the complete business operations including customers, suppliers, products, recipes, tasks, costing, complaints, and courier services. The system provides an intuitive interface with role-based access control and permission management.

### Key Features

- **User & Role Management:** Complete user management with roles and permissions
- **Customer Management:** Customer data with CSV import capabilities
- **Supplier Management:** Supplier data with item relationships
- **Item/Product Management:** Product catalog with categories and pricing
- **Category Management:** Product categorization system
- **Recipe Management:** Product recipes with versioning support
- **Task Management:** Task tracking with phases and Kanban board
- **Costing Management:** Product costing calculations and history
- **Complaint Management:** Customer complaint tracking with status workflow
- **Courier Tracking:** Integration with Citypak (Falcon) courier service
- **Order Management:** Order processing and tracking
- **Public Order Tracking:** Public-facing order tracking page

---

## System Architecture

### Technology Stack

- **Framework:** React 18.2.0
- **Language:** JavaScript (ES6+)
- **UI Libraries:** 
  - Ant Design 5.16.1 (Tables, Forms, Modals, etc.)
  - Reactstrap 9.2.0 (Bootstrap components)
  - Bootstrap 5.3.0
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM 6.14.0
- **HTTP Client:** Axios 1.4.0
- **Authentication:** JWT (stored in cookies)
- **Form Handling:** Formik, Yup validation
- **Rich Text Editor:** CKEditor 5
- **Icons:** Feather Icons, Remix Icon, Ant Design Icons

### Application Structure

```
src/
├── pages/              # Feature pages/modules
├── Components/         # Reusable components
├── Layouts/           # Layout components (Header, Sidebar, Footer)
├── Routes/            # Route configuration
├── service/           # API service layer
├── slices/            # Redux state management
├── common/            # Common utilities and constants
├── helpers/           # Helper functions
├── assets/            # Images, fonts, styles
└── locales/           # i18n translation files
```

---

## Getting Started After Login

### Step 1: Access the Dashboard

After successful login, you will be redirected to the **Dashboard** (`/dashboard`). The dashboard provides an overview of:
- System statistics
- Recent activities
- Quick access to key modules

### Step 2: Understand Your Role

Your access to modules depends on your assigned role and permissions:
- **Super Admin:** Full access to all modules
- **Admin/Manager:** Access to most modules with some restrictions
- **User:** Limited access based on assigned permissions

### Step 3: Navigate Using the Sidebar

The left sidebar contains all available modules organized by category:
- **Menu** section: Dashboard
- **Users** section: User and Customer management
- **Other** section: Business modules (Categories, Products, etc.)
- **Recipes** section: Recipe management
- **Task Management** section: Task tracking
- **Courier Management** section: Courier tracking

---

## Navigation Structure

### Main Navigation Menu

The application uses a hierarchical navigation structure:

#### 1. **Dashboard** 🏠
- **Path:** `/dashboard`
- **Icon:** Home
- **Description:** Main dashboard with system overview
- **Access:** All authenticated users

#### 2. **Users and Customer** 👥
- **Path:** `#` (Parent menu with sub-items)
- **Icon:** Users
- **Sub-items:**
  - **Customer Management** (`/customer-management`)
  - **User Management** (`/user-management`)
  - **Role Management** (`/role-management`)
  - **Permission Management** (`/permission-management`)

#### 3. **Other** 📦
- **Category Management** (`/category-management`)
- **Items Management** (`/product-management`)
- **Cost Management** (`/product-cost-management`)
  - Cost Management
  - Cost Calculator
  - Costing Management
  - Costed Products

#### 4. **Recipes** 📋
- **Recipes Management** (`/recipes-management`)
- **Create Recipe** (`/recipes/select-product`)

#### 5. **Task Management** ✅
- **Task List** (`/task-management`)
- **Task Details** (`/task-details`)
- **Kanban Board** (`/kanban-board`)

#### 6. **Courier Management** 🚚
- **Courier Management** (`/courier-management`)
- **Courier Tracking Detail** (`/courier-tracking-detail`)

### Public Routes (No Authentication Required)

- **Track Your Order** (`/track-your-order`) - Public order tracking page
- **Login** (`/login`)
- **Register** (`/register`)
- **Forgot Password** (`/forgot-password`)

---

## Master Data vs Dependent Data

Understanding master data and dependent data is crucial for proper system setup and data entry.

### Master Data (Standalone - No Dependencies)

Master data can be created independently without requiring other data to exist first.

#### 1. **Categories** ✅
- **Page:** Category Management (`/category-management`)
- **Dependencies:** None
- **Purpose:** Product categorization
- **Action:** Create categories before importing items
- **When to Use:** First step in product setup

#### 2. **Users** ✅
- **Page:** User Management (`/user-management`)
- **Dependencies:** Roles (optional)
- **Purpose:** System users and employees
- **Action:** Create users/staff for system access
- **When to Use:** After roles are set up (if needed)

#### 3. **Roles** ✅
- **Page:** Role Management (`/role-management`)
- **Dependencies:** None (but linked to Permissions)
- **Purpose:** User role definitions
- **Action:** Create roles and assign permissions
- **When to Use:** Before creating users (recommended)

#### 4. **Permissions** ✅
- **Page:** Permission Management (`/permission-management`)
- **Dependencies:** None
- **Purpose:** System permission definitions
- **Action:** View and manage permissions (usually pre-configured)
- **When to Use:** When setting up role-based access

#### 5. **Suppliers** ✅
- **Page:** Suppliers Management (`/suppliers-management`)
- **Dependencies:** None (items can be linked later)
- **Purpose:** Supplier/vendor information
- **Action:** Import or create suppliers
- **When to Use:** Before linking suppliers to items

#### 6. **Customers** ✅
- **Page:** Customer Management (`/customer-management`)
- **Dependencies:** None (complaints can be created later)
- **Purpose:** Customer/client information
- **Action:** Import or create customers
- **When to Use:** Before creating complaints or orders

---

### Dependent Data (Requires Master Data)

Dependent data requires one or more master data records to exist before it can be created.

#### 1. **Items/Products** ⚠️ DEPENDS ON: Categories
- **Page:** Items Management (`/product-management`)
- **Dependencies:** 
  - **Category** (recommended - for proper organization)
  - **Suppliers** (optional - can be linked after creation)
- **Action:** Import or create items after categories exist
- **When to Use:** After categories are set up

#### 2. **Recipes** ⚠️ DEPENDS ON: Items
- **Page:** Recipes Management (`/recipes-management`)
- **Dependencies:** 
  - **Item/Product** (required)
- **Action:** Create recipes for existing products
- **When to Use:** After items are created

#### 3. **Costing** ⚠️ DEPENDS ON: Items, Recipes (optional)
- **Page:** Costing Management (`/costing-management`)
- **Dependencies:** 
  - **Item/Product** (required)
  - **Recipe** (optional)
- **Action:** Calculate and manage product costs
- **When to Use:** After items (and optionally recipes) are created

#### 4. **Tasks** ⚠️ DEPENDS ON: Users, Costing (optional), Recipes (optional)
- **Page:** Task Management (`/task-management`)
- **Dependencies:** 
  - **User** (optional - for assignment)
  - **Costing** (optional)
  - **Recipe** (optional)
- **Action:** Create and manage tasks
- **When to Use:** After users are created (for assignment)

#### 5. **Complaints** ⚠️ DEPENDS ON: Customers, Users
- **Page:** Complaint Management (`/complaint-management`)
- **Dependencies:** 
  - **Customer** (required)
  - **User** (required - for assignment)
- **Action:** Create and track customer complaints
- **When to Use:** After customers and users are created

#### 6. **Courier Orders** ⚠️ DEPENDS ON: None (but related to business operations)
- **Page:** Courier Management (`/courier-management`)
- **Dependencies:** None (standalone tracking)
- **Action:** Create and track courier packages
- **When to Use:** When shipping packages

#### 7. **Supplier-Item Relationships** ⚠️ DEPENDS ON: Suppliers, Items
- **Page:** Items Management or Suppliers Management
- **Dependencies:** 
  - **Supplier** (required)
  - **Item** (required)
- **Action:** Link suppliers to items they supply
- **When to Use:** After both suppliers and items are created

---

## Initial Setup Workflow

Follow this workflow when setting up the system for the first time or after a fresh installation:

### Phase 1: System Configuration (First Steps)

#### Step 1: Verify Login Access
1. Login with Super Admin credentials:
   - Email: `test##@app.com`
   - Password: `######`
2. Verify you can access the dashboard
3. Check your user profile (`/profile`)

#### Step 2: Set Up Roles and Permissions
1. Navigate to **Role Management** (`/role-management`)
2. Review existing roles (Super Admin should already exist)
3. Create additional roles if needed:
   - Manager
   - Staff
   - Customer Service
   - etc.
4. Navigate to **Permission Management** (`/permission-management`)
5. Review available permissions (46 permissions across 9 modules)
6. Assign permissions to roles via Role Management

#### Step 3: Create Users/Staff
1. Navigate to **User Management** (`/user-management`)
2. Click "Add" or "Create User" button
3. Fill in user details:
   - User Name
   - Email
   - Mobile Number
   - Role (select from created roles)
   - Password (optional - auto-generated if not provided)
4. Save the user
5. Repeat for all staff members

---

### Phase 2: Master Data Setup (No Dependencies)

#### Step 4: Create Categories
1. Navigate to **Category Management** (`/category-management`)
2. Click "Add Category" or similar button
3. Enter category details:
   - Category ID
   - Category Name
   - Category Description
   - Status
4. Save the category
5. Repeat for all product categories
   - Example: "Herbal Products", "Supplements", "Wellness Items", etc.

**Why First?** Categories are needed before importing items to properly organize products.

#### Step 5: Import or Create Suppliers
1. Navigate to **Suppliers Management** (`/suppliers-management`)
2. **Option A - CSV Import (Recommended for bulk data):**
   - Click "Import" button
   - Select CSV file with supplier data
   - Review import results
3. **Option B - Manual Creation:**
   - Click "Add Supplier" button
   - Fill in supplier details
   - Save
4. Verify suppliers are listed correctly

#### Step 6: Import or Create Customers
1. Navigate to **Customer Management** (`/customer-management`)
2. **Option A - CSV Import (Recommended for bulk data):**
   - Click "Import" button
   - Select CSV file with customer data
   - Review import results
3. **Option B - Manual Creation:**
   - Click "Add Customer" button
   - Fill in customer details
   - Save
4. Verify customers are listed correctly

---

### Phase 3: Dependent Data Setup (Requires Master Data)

#### Step 7: Import or Create Items/Products
**Prerequisites:** Categories must exist

1. Navigate to **Items Management** (`/product-management`)
2. **Option A - CSV Import (Recommended for bulk data):**
   - Click "Import" button
   - Select CSV file with item data
   - Ensure CSV includes category information
   - Review import results
3. **Option B - Manual Creation:**
   - Click "Add Item" button
   - Fill in item details:
     - Item Code
     - Description
     - Category (select from existing categories)
     - Price
     - Currency
     - etc.
   - Save
4. Verify items are properly categorized

#### Step 8: Link Suppliers to Items
**Prerequisites:** Suppliers and Items must exist

1. Navigate to **Items Management** (`/product-management`)
2. Find an item you want to link suppliers to
3. Click "View" or "Edit" on the item
4. Go to "Suppliers" section
5. Select suppliers that provide this item
6. Save the relationship
7. Repeat for all items

#### Step 9: Create Recipes
**Prerequisites:** Items must exist

1. Navigate to **Recipes Management** (`/recipes-management`)
2. Click "Create Recipe" button
3. Select a product/item for the recipe
4. Fill in recipe details:
   - Recipe Name
   - Batch Size
   - Ingredients (select items)
   - Quantities
   - Instructions
5. Save the recipe
6. Repeat for all products that need recipes

#### Step 10: Create Costing
**Prerequisites:** Items must exist (Recipes optional)

1. Navigate to **Costing Management** (`/costing-management`)
2. Click "Add Costing" or use **Cost Calculator** (`/product-cost-calculate`)
3. Select an item
4. Enter cost details:
   - Item costs
   - Recipe costs (if recipe exists)
   - Overhead costs
   - Selling price
5. Calculate and save costing
6. View costed products in **Costed Products** (`/costed-products`)

#### Step 11: Create Tasks
**Prerequisites:** Users should exist (for assignment)

1. Navigate to **Task Management** (`/task-management`)
2. Click "Create Task" or "Add Task"
3. Fill in task details:
   - Task Name
   - Phase (select from available phases)
   - Assign To (select user)
   - Related Costing (optional)
   - Related Recipe (optional)
   - Due Date
   - Priority
4. Save the task
5. View tasks in **Kanban Board** (`/kanban-board`) for visual management

#### Step 12: Create Complaints
**Prerequisites:** Customers and Users must exist

1. Navigate to **Complaint Management** (`/complaint-management`)
2. Click "Add" button to create new complaint
3. Fill in complaint details:
   - **Customer** (search and select existing customer)
   - **Assign To Employee** (required - select user)
   - Headline
   - Category
   - Priority
   - Description
   - Target Resolution Date
4. Save the complaint
5. Use status tabs to manage complaints:
   - All Complaints
   - Open
   - In Progress
   - Resolved
   - Awaiting Feedback
   - Closed
   - Reopened

---

## Module Catalog

### Core Modules

| Module | Path | Description | Master/Dependent |
|--------|------|-------------|------------------|
| **Dashboard** | `/dashboard` | System overview and statistics | - |
| **User Management** | `/user-management` | Manage system users and employees | Master |
| **Role Management** | `/role-management` | Manage user roles | Master |
| **Permission Management** | `/permission-management` | Manage system permissions | Master |
| **Customer Management** | `/customer-management` | Manage customers (CSV import available) | Master |
| **Staff Management** | `/staff-management` | Manage staff members | Master |

### Business Modules

| Module | Path | Description | Master/Dependent |
|--------|------|-------------|------------------|
| **Category Management** | `/category-management` | Product categories | Master |
| **Items Management** | `/product-management` | Product/item catalog (CSV import available) | Dependent (Categories) |
| **Suppliers Management** | `/suppliers-management` | Supplier/vendor management (CSV import available) | Master |
| **Recipes Management** | `/recipes-management` | Product manufacturing recipes | Dependent (Items) |
| **Costing Management** | `/costing-management` | Product costing calculations | Dependent (Items, Recipes) |
| **Cost Calculator** | `/product-cost-calculate` | Calculate product costs | Dependent (Items) |
| **Costed Products** | `/costed-products` | View products with costing | Dependent (Costing) |
| **Task Management** | `/task-management` | Task tracking and management | Dependent (Users) |
| **Kanban Board** | `/kanban-board` | Visual task board | Dependent (Tasks) |
| **Complaint Management** | `/complaint-management` | Customer complaint tracking | Dependent (Customers, Users) |
| **Courier Management** | `/courier-management` | Courier package tracking | Independent |
| **Order Management** | `/order-management` | Order processing | - |
| **Payment Management** | `/payment-management` | Payment tracking | - |

### Supporting Modules

| Module | Path | Description |
|--------|------|-------------|
| **Settings** | `/settings` | System settings |
| **Stores Management** | `/stores` | Store locations |
| **Banner Management** | `/banner-management` | Banner management |
| **Feature Management** | `/feature-management` | Feature management |

### Public Modules

| Module | Path | Description | Authentication |
|--------|------|-------------|---------------|
| **Track Your Order** | `/track-your-order` | Public order tracking | No |

---

## User Workflows

### Workflow 1: Setting Up Product Catalog

**Goal:** Set up complete product catalog with categories, items, and suppliers

1. **Create Categories** (`/category-management`)
   - Create all product categories first
   - Example: "Herbal Products", "Supplements", "Wellness"

2. **Import/Create Items** (`/product-management`)
   - Import items via CSV or create manually
   - Assign each item to a category
   - Set prices and other details

3. **Link Suppliers** (`/product-management` or `/suppliers-management`)
   - For each item, link relevant suppliers
   - This helps track which suppliers provide which items

**Result:** Complete product catalog ready for use

---

### Workflow 2: Creating a Recipe and Costing

**Goal:** Create a recipe for a product and calculate its cost

1. **Navigate to Recipes** (`/recipes-management`)
2. **Create Recipe:**
   - Click "Create Recipe"
   - Select product/item
   - Add ingredients (other items)
   - Set quantities
   - Define batch size
   - Save recipe

3. **Calculate Costing:**
   - Navigate to **Cost Calculator** (`/product-cost-calculate`)
   - Select the product
   - Enter ingredient costs
   - Add overhead costs
   - Calculate total cost
   - Set selling price
   - Save costing

4. **View Costed Product:**
   - Navigate to **Costed Products** (`/costed-products`)
   - View all products with calculated costs

**Result:** Product with recipe and costing information

---

### Workflow 3: Managing Customer Complaints

**Goal:** Handle customer complaints efficiently

1. **Navigate to Complaint Management** (`/complaint-management`)
2. **Create Complaint:**
   - Click "Add" button
   - Search and select customer
   - **Assign to Employee** (required)
   - Enter complaint details
   - Set priority and category
   - Save

3. **Track Complaint:**
   - Use status tabs to filter:
     - **Open:** New complaints
     - **In Progress:** Being handled
     - **Resolved:** Fixed, awaiting feedback
     - **Closed:** Completed
   - Click "View" to see details
   - Click "Update Status" to change status
   - Add notes as you work on the complaint

4. **Update Status:**
   - Click the status update icon
   - Change status
   - Add notes
   - Save

**Result:** Efficient complaint tracking and resolution

---

### Workflow 4: Courier Order Management

**Goal:** Create and track courier packages

1. **Navigate to Courier Management** (`/courier-management`)
2. **Create Courier Order:**
   - Click "Create Order" button
   - Fill in sender information
   - Fill in receiver information
   - Enter package details (weight, description)
   - Set cash on delivery amount (if applicable)
   - Save

3. **Track Order:**
   - View order in the list
   - Click "View" to see tracking details
   - Or use search to find by tracking number
   - View timeline of status updates

4. **Print Waybills:**
   - Click "Print" on individual orders
   - Or select multiple orders and click "Print Selected"
   - PDF will download automatically

**Result:** Complete courier order management

---

### Workflow 5: Task Management

**Goal:** Create and manage tasks with Kanban board

1. **Navigate to Task Management** (`/task-management`)
2. **Create Task:**
   - Click "Create Task"
   - Enter task details
   - Assign to user
   - Link to costing or recipe (optional)
   - Set phase and priority
   - Save

3. **View in Kanban Board:**
   - Navigate to **Kanban Board** (`/kanban-board`)
   - Drag and drop tasks between phases
   - View task details by clicking on cards
   - Update task status visually

4. **Task Details:**
   - Click on any task to view details
   - Add comments
   - Update status
   - View history

**Result:** Visual task management with phase tracking

---

## Data Import Order

Follow this order when importing or setting up data to avoid dependency errors:

### ✅ Phase 1: System Initialization (Automatic)

This happens automatically when the backend starts:
- Permissions (46 permissions)
- Super Admin role
- Super Admin user (admin@app.com / 1234)

### ✅ Phase 2: Master Data Setup (No Dependencies)

Set up these in the frontend (can be done in any order, but recommended order):

1. **Categories** (`/category-management`)
   - Create via UI
   - **Why First?** Needed for item organization

2. **Roles** (`/role-management`)
   - Create additional roles if needed
   - Assign permissions

3. **Users/Staff** (`/user-management` or `/staff-management`)
   - Create employees/staff
   - Assign roles

4. **Suppliers** (`/suppliers-management`)
   - Import via CSV or create manually
   - **When:** Before linking to items

5. **Customers** (`/customer-management`)
   - Import via CSV or create manually
   - **When:** Before creating complaints

### ⚠️ Phase 3: Dependent Data Setup (Requires Master Data)

Set up these after master data exists:

1. **Items/Products** (`/product-management`)
   - **Requires:** Categories
   - Import via CSV or create manually
   - Assign categories

2. **Supplier-Item Relationships**
   - **Requires:** Suppliers and Items
   - Link via Items Management or Suppliers Management

3. **Recipes** (`/recipes-management`)
   - **Requires:** Items
   - Create recipes for products

4. **Costing** (`/costing-management` or `/product-cost-calculate`)
   - **Requires:** Items (and optionally Recipes)
   - Calculate product costs

5. **Tasks** (`/task-management`)
   - **Requires:** Users (for assignment)
   - Create tasks and assign to users

6. **Complaints** (`/complaint-management`)
   - **Requires:** Customers and Users
   - Create complaints and assign to employees

7. **Courier Orders** (`/courier-management`)
   - **Requires:** None
   - Create as needed for shipping

---

## Module Dependencies

### Dependency Flow Diagram

```
Categories (Master)
    ↓
Items/Products (Depends on Categories)
    ↓
Recipes (Depends on Items)
    ↓
Costing (Depends on Items, optionally Recipes)
    ↓
Tasks (Depends on Users, optionally Costing/Recipes)

Suppliers (Master)
    ↓
Supplier-Item Links (Depends on Suppliers + Items)

Customers (Master)
    ↓
Complaints (Depends on Customers + Users)

Users (Master)
    ↓
Complaints (Depends on Customers + Users)
    ↓
Tasks (Depends on Users)
```

### Quick Dependency Reference

| Module | Can Create After | Blocked By |
|--------|------------------|------------|
| Categories | Login | Nothing |
| Roles | Login | Nothing |
| Users | Login | Roles (optional) |
| Suppliers | Login | Nothing |
| Customers | Login | Nothing |
| Items | Categories exist | Categories missing |
| Recipes | Items exist | Items missing |
| Costing | Items exist | Items missing |
| Tasks | Users exist | Users missing |
| Complaints | Customers + Users exist | Customers or Users missing |
| Supplier-Item Links | Suppliers + Items exist | Suppliers or Items missing |

---

## Quick Reference Guide

### Common Tasks

#### How to Import Data via CSV

1. **Customers:**
   - Go to `/customer-management`
   - Click "Import" button
   - Select CSV file
   - Review and confirm

2. **Suppliers:**
   - Go to `/suppliers-management`
   - Click "Import" button
   - Select CSV file
   - Review and confirm

3. **Items:**
   - Go to `/product-management`
   - Click "Import" button
   - Select CSV file
   - Ensure categories exist first
   - Review and confirm

#### How to Assign Permissions to Roles

1. Go to `/role-management`
2. Find the role you want to edit
3. Click "Edit" or "Permissions"
4. Select permissions to assign
5. Save

#### How to Track a Courier Package

**For Admin Users:**
1. Go to `/courier-management`
2. Search by tracking number or view list
3. Click "View" to see details

**For Public Users:**
1. Go to `/track-your-order` (no login required)
2. Enter tracking number
3. Click "Track My Order"
4. View status timeline

#### How to Filter Complaints by Status

1. Go to `/complaint-management`
2. Use status tabs at the top:
   - All Complaints
   - Open
   - In Progress
   - Resolved
   - Awaiting Feedback
   - Closed
   - Reopened
3. Each tab shows count badge

#### How to Create a Recipe

1. Go to `/recipes-management`
2. Click "Create Recipe"
3. Select product/item
4. Add ingredients (select items and quantities)
5. Set batch size
6. Add instructions
7. Save

#### How to Calculate Product Cost

1. Go to `/product-cost-calculate`
2. Select product/item
3. Enter ingredient costs
4. Add overhead costs
5. Click "Calculate"
6. Set selling price
7. Save

---

## Navigation Tips

### Finding Modules Quickly

- **Use the Sidebar:** All modules are organized in the left sidebar
- **Use Search:** Some modules have search functionality
- **Use Filters:** Most list pages have filters for quick access
- **Use Tabs:** Complaint Management uses tabs for status filtering

### Keyboard Shortcuts

- **Sidebar Toggle:** Click menu icon (top-left)
- **Search:** Use search boxes in list pages
- **Quick Actions:** Use action buttons in tables

### Best Practices

1. **Start with Master Data:** Always set up master data before dependent data
2. **Use CSV Import:** For bulk data, use CSV import instead of manual entry
3. **Verify Dependencies:** Check that required data exists before creating dependent records
4. **Use Filters:** Use filters and search to find records quickly
5. **Check Permissions:** Ensure you have required permissions before accessing modules

---

## Troubleshooting

### Common Issues

#### "Cannot create item - category not found"
**Solution:** Create categories first in Category Management

#### "Cannot create complaint - customer not found"
**Solution:** Create or import customers first in Customer Management

#### "Cannot assign complaint - no employees available"
**Solution:** Create users/staff first in User Management

#### "Cannot create recipe - item not found"
**Solution:** Create items first in Items Management

#### "Cannot link supplier - supplier or item missing"
**Solution:** Ensure both supplier and item exist before linking

---

## Summary: Quick Start Checklist

Use this checklist when setting up the system:

### ✅ Phase 1: System Setup
- [ ] Login with Super Admin (admin@app.com / 1234)
- [ ] Verify dashboard access
- [ ] Review and create roles (if needed)
- [ ] Assign permissions to roles
- [ ] Create users/staff

### ✅ Phase 2: Master Data
- [ ] Create categories
- [ ] Import/create suppliers
- [ ] Import/create customers

### ⚠️ Phase 3: Dependent Data
- [ ] Import/create items (after categories)
- [ ] Link suppliers to items
- [ ] Create recipes (after items)
- [ ] Create costing (after items)
- [ ] Create tasks (after users)
- [ ] Create complaints (after customers and users)

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Frontend Development Team
