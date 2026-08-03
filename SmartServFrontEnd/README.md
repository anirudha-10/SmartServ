# 🚗 SmartServ Frontend — Automobile Service Center Management Application

A modern, responsive, role-based Web Application built with **React 19**, **Vite**, and **React Bootstrap** to manage vehicle service bookings, live tracking, job cards, inventory, and invoices.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Role-Based Workflows](#-role-based-workflows)
- [Environment Configuration](#-environment-configuration)
- [Scripts](#-scripts)

---

## 🌟 Overview

**SmartServ Frontend** provides a seamless digital experience for vehicle owners, service managers, mechanics, and system administrators. It integrates directly with the SmartServ Spring Boot REST API to handle the end-to-end lifecycle of automobile servicing.

---

## 🔑 Key Features

### 👤 Customer Features
- **Account Registration & Role Switcher**: Register as Customer, Service Manager, or Service Mechanic.
- **Multi-Vehicle Management**: Add, update, and manage multiple vehicles (License Plate, Brand/Make, Model, Color).
- **Service & RSA Booking**: Book regular service appointments or request emergency Roadside Assistance (RSA) with live GPS coordinate acquisition.
- **Live Multi-Vehicle Service Tracker**: Switch between owned vehicles via interactive dropdown to monitor live service lifecycle progress, job card breakdowns, before/after photo evidence, and launch Razorpay Checkout modal for instant invoice payment.
- **Razorpay Online Payments**: Pay vehicle service invoices directly via Razorpay Standard Checkout SDK (UPI, Cards, NetBanking) with dynamic order verification and currency formatting in INR (`₹`).

### 👔 Manager Features
- **Manager Control Center**: Real-time operational metrics for pending approvals, active job cards, low stock alerts, and workshop revenue.
- **Pending Appointment Approvals**: Review customer requests with formatted date/time, vehicle information, and service note badges; approve or reject with custom reasons.
- **Job Card Creation & Mechanic Assignment**: Create job cards specifying estimated completion dates and assign technicians specifically from mechanics reporting under the logged-in manager.

### 🔧 Mechanic Workspace
- **Assigned Job Cards**: Track assigned service jobs, start work (`CREATED` → `IN_PROGRESS`), mark tasks completed (`IN_PROGRESS` → `COMPLETED`), and upload photo evidence.

### 🛡️ Admin Features
- **System Overview Dashboard**: Monitor system metrics (users, vehicles, job cards, total revenue in `₹`) and review recent registered users.
- **User Management & Soft-Delete**: Full user administration across system roles (Admin, Manager, Mechanic, Customer), create new users, filter active users, and soft-delete user accounts.
- **Vehicle Registration & Assignment**: Register new vehicles with customer account selection for Admins/Managers and manage existing inventory.

---

## 🛠 Tech Stack

| Component | Technology | Version |
|---|---|---|
| **Core Framework** | React | 19.x |
| **Build Tool** | Vite | 6.x |
| **UI Components** | React Bootstrap & Bootstrap | 5.3.x |
| **Icons** | Bootstrap Icons | 1.11.x |
| **Routing** | React Router DOM | 6.x |
| **Form Validation** | React Hook Form + Yup | 7.x / 1.x |
| **HTTP Client** | Axios (with Interceptors) | 1.x |
| **Notifications** | React Toastify | 10.x |
| **JWT Decoding** | jwt-decode | 4.x |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **SmartServ Backend REST API** running on `http://localhost:8081`

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd SmartServ/SmartServFrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env` if missing):
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```
SmartServFrontEnd/
├── public/
├── src/
│   ├── api/
│   │   └── axiosConfig.js          # Axios base configuration & interceptors
│   ├── components/
│   │   ├── common/                 # Reusable skeletons & UI helpers
│   │   └── layout/                 # Sidebar, Header, and Navigation
│   ├── context/
│   │   └── AuthContext.jsx         # Global Authentication & Role state
│   ├── layouts/
│   │   ├── AuthLayout.jsx          # Centered card layout for Auth pages
│   │   └── DashboardLayout.jsx     # Main layout with Sidebar & Header
│   ├── pages/
│   │   ├── Admin/                  # Admin Dashboard & User Management
│   │   ├── Appointments/           # Booking forms & Appointment List
│   │   ├── Auth/                   # Login & Multi-role Register pages
│   │   ├── Customer/               # Dashboard, Multi-Vehicle Tracker, RSA
│   │   ├── Inventory/              # Inventory List & Form (`skuCode`, `stockQuantity`, `currentPrice`)
│   │   ├── Invoices/               # Invoice Billing & Receipts
│   │   ├── Manager/                # Manager Control Center, Approvals, Job Cards
│   │   ├── Mechanic/               # Manager Workspace & Task Execution
│   │   └── Vehicles/               # Vehicle Registry & Form
│   ├── services/
│   │   ├── appointmentService.js   # Normalizes response fields & DTOs
│   │   ├── inventoryService.js     # Handles skuCode, stockQuantity, currentPrice
│   │   ├── jobCardService.js       # Job card creation & status management
│   │   ├── userService.js          # User & manager-mechanic hierarchy APIs
│   │   └── vehicleService.js       # Customer vehicle CRUD APIs
│   ├── App.jsx                     # Role-based route guard & navigation
│   └── main.jsx                    # Application entry point
├── package.json
└── vite.config.js
```

---

## 📜 Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) |
| `npm run build` | Builds optimized production bundle |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint analysis |

---

## 📄 License
Licensed under the Apache License 2.0.
