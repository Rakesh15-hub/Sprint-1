# 🍽️ Persian Darbar Restaurant Web Application

A full-stack restaurant management web application featuring a customer-facing responsive website and an administrative control panel.

---

## ✨ Features

- **Frontend**:
  - Responsive, modern UI for browsing restaurant specials, menu, and dishes
  - Customer review submissions & contact inquiry forms
  - User Authentication (Login / Signup)
- **Backend & Admin Dashboard**:
  - Express.js & MongoDB (Mongoose) architecture
  - Admin authentication & JWT session management
  - Menu CRUD operations (Add, Edit, Delete, Disable/Enable menu items)
  - Live Order tracking & status updates
  - Customer review moderation & inquiries inbox
  - Automated seeding for starter menu items

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory (you can copy `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/persian_darbar
JWT_SECRET=your_secret_key
PORT=3000
ADMIN_EMAIL=admin@persiandarbar.com
ADMIN_PASSWORD=admin123
```

### 4. Seed Initial Data (Optional)
```bash
npm run seed
```

### 5. Run the Server
```bash
# Development mode
npm run dev

# Standard mode
npm start
```

- **Website**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **API**: `http://localhost:3000/api/menu`
