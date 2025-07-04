# 💼 Financial Analytics Dashboard

An advanced full-stack financial analytics dashboard designed for tracking, visualizing, and exporting transaction data. Built for financial analysts to streamline insights with secure access, interactive charts, filtering, and configurable CSV report generation.

## 🚀 Features

- 🔐 JWT Authentication – Secure login/logout system
- 📊 Interactive Dashboard – Visualizations for revenue, expenses, and category breakdowns
- 📋 Transaction Table – Paginated, searchable, sortable, and filterable
- 🔍 Advanced Filtering – Filter by date, amount, category, status, and user
- 📤 CSV Export – Select custom columns and download reports instantly

## 🧪 Tech Stack

### Frontend
- React.js + TypeScript
- Charts: Recharts or Chart.js
- UI Library: Material UI / Ant Design / Chakra UI

### Backend
- Node.js + TypeScript
- Database: MongoDB
- Authentication: JWT-based
- CSV Generation: Using libraries like `json2csv` or similar

## 🧭 User Flow

1. Login using JWT
2. Access Dashboard with charts and tables
3. Search/Sort/Filter transactions in real-time
4. Configure CSV Export via modal
5. Download File directly after generation

## 📂 Sample Data

Sample transaction data structure is provided and can be preloaded into MongoDB.

## 📄 Setup Instructions

### Backend

```bash
cd backend
npm install
npm run dev
