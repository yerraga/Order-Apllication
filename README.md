# Order Management Dashboard

This is a **React** application built with **Vite** and **Tailwind CSS** that manages customer orders through different lifecycle stages:  
`Pending → Processing → Shipped → Delivered`.

Users can **view**, **advance** the order status, and **delete** orders.

---

## Features

- View all orders or filter by status (Pending, Processing, Shipped, Delivered).
- View order details in a modal.
- Move order to the next status.
- Delete orders in "Processing" stage.
- Responsive UI styled with Tailwind CSS.
- Code structure ready for backend API integration.

---

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [UUID](https://www.npmjs.com/package/uuid) (for unique order IDs)

---


## Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/order-management-dashboard.git
cd order-management-dashboard

2. install dependencies
npm install

3. To run the application
npm run dev
```
Folder Structure
├── public/
├── src/
│   ├── components/
│   │   └── OrderManagement.jsx
│   ├── App.jsx
│   ├── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md




