# MenuKart - Digital Menu & Order Management System

MenuKart is a comprehensive digital menu and order management system designed for restaurants and food establishments. It allows businesses to create and manage their menus, track orders, gather customer feedback, and gain insights through analytics, all while providing a seamless experience for customers.

## Features

### Core Functionality
-   **Modern Tech Stack:** Built with Next.js (App Router) and styled with Shadcn UI and Tailwind CSS for a responsive and modern user interface.
-   **Authentication:** Secure user signup and login for hotel administrators.

### Menu Management (Admin)
-   **CRUD Operations:** Administrators can easily Add, Edit, and Delete menu items.
-   **Modal Forms:** Intuitive modal dialogs for adding and editing menu items, improving the user experience.
-   **Item Details:** Each menu item includes:
    -   Item Name
    -   Price
    -   Category (for organization and filtering)
    -   Visibility Toggle (control whether an item appears on the customer-facing menu)
-   **Menu Scheduling:** Define availability for menu items based on:
    -   Time (e.g., breakfast menu available from 08:00 to 11:00)
    -   Days of the Week (e.g., weekend specials)
-   **Promotions & Highlights:** Mark items with special attributes:
    -   `Special`
    -   `New`
    -   `Popular`
    -   `Discount Percentage` (apply limited-time offers or discounts)
-   **Upsell Suggestions:** Link related items to suggest add-ons or pairings to customers.
-   **Search & Filter:** Efficiently search for menu items by name and filter by category.

### Order Management (Admin)
-   **Current Orders:** View all active customer orders.
-   **Order Completion:** Mark orders as completed, moving them to the historical records.
-   **Completed Orders:** Review a history of all fulfilled orders.

### Customer Interaction
-   **QR Code Access:** Generate unique QR codes for each hotel, allowing customers to easily access the digital menu by scanning.
-   **User-Friendly Menu:** Customers can browse the menu, filtered by visibility and scheduling rules.
-   **Quantity Selection:** Customers can specify quantities for each item before adding to their cart.
-   **Shopping Cart:** A dedicated cart page to review selected items, adjust quantities, and proceed to order.
-   **Upsell Suggestions (Customer-facing):** Display relevant upsell items on the cart page to encourage additional purchases.
-   **Order Placement:** Customers can place orders directly from their cart.
-   **Customer Feedback:** Provide optional feedback on dishes or overall experience through ratings and comments.

### Analytics & Insights (Admin Dashboard)
-   **Key Performance Indicators (KPIs):** A dashboard displaying crucial metrics:
    -   Total Number of Menu Items
    -   Total Number of Current Orders
    -   Total Number of Completed Orders
    -   Total Revenue generated from completed orders
-   **Popular Menu Items:** Identify top-selling items based on order history.
-   **QR Code Scan Tracking:** Basic tracking of QR code scans including timestamp, device type, and IP address.

### User Experience
-   **Responsive Design:** Optimized for seamless viewing and interaction across various devices (desktops, tablets, mobile phones).
-   **Shadcn UI Components:** Utilizes a consistent and modern UI library for a polished look and feel.
-   **Loaders & Toasts:** Provides clear visual feedback during data loading and for successful/failed operations.
-   **Admin Navigation:** A dedicated navigation bar for administrators to easily switch between different management sections.

## Getting Started

To set up and run the MenuKart application locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd menukart-nextjs
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root of the `menukart-nextjs` directory and add your MongoDB URI and a JWT secret key:
    ```
    MONGODB_URI=your_mongodb_connection_string
    TOKEN_KEY=your_jwt_secret_key
    ```
    Replace `your_mongodb_connection_string` with your actual MongoDB connection string (e.g., from MongoDB Atlas) and `your_jwt_secret_key` with a strong, random string.

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.

## Usage

### Admin Panel
-   Access the admin login/signup at `http://localhost:3000/login` or `http://localhost:3000/signup`.
-   After logging in, navigate through the admin dashboard, menu management, order tracking, and QR code generation sections using the top navigation bar.

### Customer View
-   Scan the QR code generated from the admin panel (or manually navigate to `/user/[hotelId]`) to access the customer-facing menu.
-   Browse items, add to cart, and place orders.
-   Provide feedback on your experience.