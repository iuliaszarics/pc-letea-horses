# Proiect Colectiv - Delivery Platform Documentation

## Introduction

**App name** is a dual-sided delivery platform designed to connect customers with a variety of restaurants. The platform serves two primary user types: **Customers** who browse menus and place orders, and **Company Users** who manage their restaurants, menus, and sales.

This documentation outlines the features, user flows, and functional specifications for both sides of the platform.


## User Roles & Access Levels

The platform's functionality is divided based on the user's authentication status and role.

| User Type | Access Level | Description |
| :--- | :--- | :--- |
| **Guest / Customer** | Not Logged In | A user browsing the platform, viewing restaurants, and placing orders. |
| **Authenticated Customer (optional)** | Logged In (Customer) | A registered customer who can access order history and a streamlined checkout. |
| **Company User** | Logged In (Company) | A restaurant owner/manager who manages their restaurant(s), menus, and views analytics. |

---

## I. Customer-Facing Platform (Not Logged In / Customer Account)

This is the public-facing side of the application where users discover restaurants and place orders.

### 1. Presentation Page (Landing Page)
- **Purpose:** To introduce the platform and its value proposition.
- **Features:**
  - Engaging hero section with a call-to-action (e.g., "Find Food Now").
  - Display of featured or popular restaurants.
  - A prominent search bar to find restaurants or cuisines.

### 2. Restaurants List Page
- **Purpose:** To allow users to browse all available restaurants.
- **Features:**
  - **Search:** Users can search for restaurants by name or cuisine type.
  - **Filtering & Sorting:** Options to filter by criteria (e.g., rating, delivery time, price range) and sort (e.g., closest, highest rated).
  - **Restaurant Card:** Each restaurant is displayed with its name, image, (optional average rating, delivery time), and a prominent indicator if it is currently **open** or **closed**.
  - **Click Action:** Clicking on a restaurant card navigates the user to that restaurant's menu page.

### 3. Restaurant Menu Page
- **Access:** Triggered by clicking on an **open** restaurant from the list.
- **Purpose:** To display the restaurant's menu and allow item selection.
- **Features:**
  - ~~Restaurant header with name, image, and operating hours.~~
  - ~~Menu categorized into logical sections (e.g., Appetizers, Main Courses, Desserts).~~
  - ~~Each product is listed with its name, description, price, and an image.~~
  - An **"Add to Cart"** button for each menu item. **If a product has a modifier active, a pop-up with the modifier will appear**
  - ~~A persistent shopping cart summary that updates as items are added.~~

### 4. Checkout & Order Placement
- **Access:** Proceeding from the shopping cart.
- **Purpose:** To finalize the order and payment.
- **Features:**
  - **Cart Review:** Ability to modify quantities or remove items.
  - **Details Form:** Fields for delivery address, contact information, and special delivery instructions.
  - **Order Confirmation:** A clear confirmation screen with an Order ID is displayed upon successful placement.

### 5. Real-Time Order Tracking
- **Purpose:** To allow customers to monitor the status of their order after placement.
- **Features:**
  - A dedicated order tracking page or modal.
  - A visual progress bar with statuses (e.g., `Order Received` -> `Preparing` -> `Out for Delivery` -> `Delivered`).
  - Real-time updates powered by WebSockets or frequent API polling.
  - Estimated delivery time is displayed.

### 6. (Optional) Order History
- **Purpose:** To allow logged customers to see their previous orders.

## II. Company-Facing Platform (Logged In - Company Account)

This is the administrative dashboard for restaurant owners and managers.

### 1. Authentication & Onboarding
- **Company Registration:** A process for businesses to create an account and register their restaurant(s) on the platform.
- **Login:** Secure login to access the company dashboard.

### 2. Dashboard
- **Purpose:** The default landing page after login, providing a high-level overview of business performance.
- **Features:**
  - **Key Metrics:** Display of top-level stats (e.g., Total Revenue, New Orders, Completed Orders).
  - **Interactive Charts:**
    - **Bar Chart:** Sales amounts & number of orders over time.
    - **Pie Chart:** Breakdown of sales by product category.
    - **Top Products List:** A list of the top 5 most sold products.
  - **Time Period Selector:** A dropdown or button group to filter all charts and data by predefined periods: **Last Day, Last Week, Last Month, Last Quarter, Custom Range.**

### 3. Products Page
- **Purpose:** A central hub for managing all menu-related configurations.
- **Structure:** Organized into three main tabs.

#### a. All Products
- **Purpose:** To view and manage all menu items.
- **Features:**
  - **Paginated List:** A table of all products.
  - **Search:** Search products by name.
  - **Filtering:** Filter products by category, availability (active/inactive), etc.
  - **Actions:**
    - **Add New Product:** Button to create a new menu item.
    - **Edit Product:** Edit details of an existing product (name, price, description, category, image).
    - **Toggle Availability:** Quickly enable/disable a product.

#### b. Modifiers
- **Purpose:** To manage product customizations (e.g., "Add extra cheese," "Choose spiciness level," "Select side dish").
- **Features:**
  - List of all modifier groups (e.g., "Toppings," "Sauces").
  - Ability to create, edit, and delete modifier groups.
  - Within each group, manage the individual options (e.g., "Ketchup," "Mayo") and their associated prices.

#### c. Restaurants
- **Purpose:** To manage the company's restaurant profile(s).
- **Features:**
  - Edit restaurant details: Name, address, contact information, logo, and header image.
  - Configure operating hours for each day of the week.
  - Set delivery zones and minimum order amounts.

### 4. Sales Page
- **Purpose:** To provide a detailed, transaction-level view of all sales data.
- **Features:**
  - A detailed, filterable, and exportable list of all orders.
  - View order details: items, customer information, final amount, and payment status.
  - Filter by date range, order status, or payment method.

### 5. Orders Page
- **Purpose:** To manage the order fulfillment workflow in real-time.
- **Features:**
  - A Kanban-style or list view of orders, organized by status (`New`, `Preparing`, `Ready for Pickup`, `Out for Delivery`, `Delivered`).
  - Company users can update the status of an order, which triggers a real-time update on the customer's tracking page.
  - View order details directly from this page.

### 6. Settings Page
- **Purpose:** To manage the company account and platform settings.
- **Features:**
  - **Company Profile:** Update company name, contact email, and phone number.
  - **Notification Settings:** Manage preferences for order alerts (e.g., Email).


### [Architecture & Design](https://docs.google.com/document/d/17z7K8K0-BEWeR7gGJUU6PjUv2zk8x4A8DacJgFuKwtQ/edit?usp=sharing)