Lumen Mall - Frontend (React)

The client-side of the Lumen Mall e-commerce platform. Built with React 18 and Vite, featuring a smooth Single Page Application (SPA) experience, real-time location detection, and Stripe/PayPal payment integrations.
 Key Features

    Dynamic Product Catalog: Filtering, category sorting, and detailed product views.

    Global Context Management: Centralized AuthContext, CartContext, and LocationContext.

    Secure Checkout: Integrated with Stripe (Card) and PayPal (Redirect).

    Admin Dashboard: Manage inventory, track customer orders, and update order statuses.

    Responsive UI: Optimized for mobile, tablet, and desktop with CSS Modules.

🛠 Tech Stack

    Framework: React (Vite)

    Routing: React Router v6

    Styling: CSS Modules & React Icons

    State Management: React Context API

    Payments: @stripe/react-stripe-js, @stripe/stripe-js

⚙️ Installation

    Clone the repo:
    Bash

    git clone <your-repo-url>
    cd lumen-mall-client

    Install dependencies:
    Bash

    npm install

    Environment Variables: Create a .env file in the root:
    Code snippet

    VITE_API_BASE_URL=https://lumen-mall-server.onrender.com
    VITE_STRIPE_PUBLIC_KEY=your_stripe_key_here

    Run Development Server:
    Bash

    npm run dev
