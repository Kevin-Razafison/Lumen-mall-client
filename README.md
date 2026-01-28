🚀 Lumen Mall | Full-Stack E-Commerce & Admin Suite

Lumen Mall is a high-performance, full-stack e-commerce platform built for the modern web. It features a sleek, responsive customer storefront and a comprehensive Admin Management Suite for handling inventory, orders, users, and community moderation.
🌟 Key Features
🛒 Customer Experience

    Responsive Storefront: Fully optimized for desktop, tablet, and mobile browsing.

    Secure Authentication: JWT-based login and registration system.

    Dynamic Catalog: Filter products by category, price, and "New Arrivals."

    Reviews & Ratings: Community-driven feedback system with admin moderation.

🛡️ Admin Management Suite

    Live Dashboard: Overview of monthly revenue, total orders, and top-performing products.

    Inventory Control: Real-time stock tracking, quick restock actions, and inline product editing.

    Order Management: End-to-end order lifecycle tracking (Awaiting Payment → Shipped → Completed).

    User Moderation: Manage user roles (User/Admin) with built-in security to prevent self-lockout.

    Review Moderation: Reply directly to customer feedback or delete inappropriate content.

💻 Tech Stack
Layer	Technology
Frontend	React 18, React Router 6 (Outlet Context), CSS Modules
Backend	Java, Spring Boot, Spring Security
Database	PostgreSQL / MySQL
Authentication	JSON Web Tokens (JWT), BCrypt Password Hashing
State Management	React Context API & Outlet Context
🛠️ Installation & Setup
Prerequisites

    Node.js (v16 or higher)

    JDK 17 or higher

    Maven (for backend dependencies)

Backend Setup

    Navigate to the server directory.

    Configure your database in src/main/resources/application.properties.

    Run the application:
    Bash

    mvn spring-boot:run

Frontend Setup

    Navigate to the client directory.

    Install dependencies:
    Bash

    npm install

    Start the development server:
    Bash

    npm start

📸 Screenshots

    Admin Inventory: Featuring responsive data tables with horizontal scroll support.

    Analytics Dashboard: Visualizing revenue trends and key performance indicators.

    Add Product Form: Optimized for mobile with asynchronous image uploading.

🔒 Security Features

    Protected Routes: Frontend routes are guarded; unauthorized users are redirected to login.

    Secure Headers: Every administrative API call is protected via Authorization headers.

    Role-Based Access Control (RBAC): Specific endpoints and UI sections are restricted based on user authority.

📝 Future Roadmap

    [ ] Add real-time stock/inventory check logic in OrderService.

    [ ] Implement Stripe/PayPal payment gateway integration.

    [ ] Add dark mode support for the Admin Suite.
