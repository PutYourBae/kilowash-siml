# 🧺 KiloWash — Laundry Management System

A web-based laundry management system built for small-to-medium laundry businesses in Indonesia.

![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%28Supabase%29-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 Order & Customer Management | Create, track, and manage laundry orders and customer data |
| 🔄 Laundry Queue | Kanban-style board to visualize order progress |
| 💳 Cashier & Payments | Process payments and generate receipts |
| 📲 WhatsApp Notifications | Automated WA messages via Fonnte API |
| 📊 Financial Reports | Daily/monthly revenue summaries |
| 🔍 Public Order Tracking | Customers can track their order status via a public link |
| ⭐ Customer Feedback | Collect ratings and reviews after pickup |
| 🏢 Multi-Branch Support | Manage multiple laundry outlets from one dashboard *(v2)* |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, Vanilla CSS, Vanilla JS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Supabase) |
| WA Notifications | Fonnte API |
| Deployment | Vercel (frontend + backend) |

---

## 📂 Project Structure

```
kilowash-siml/
├── kilowash-backend/    # Node.js API server
└── kilowash-frontend/   # HTML/CSS/JS frontend
```

---

## ⚙️ Local Setup

### Backend

```bash
cd kilowash-backend
npm install
cp .env.example .env   # Fill in your credentials
node app.js
```

### Frontend

Open `kilowash-frontend/src/pages/login.html` using **Live Server** (VS Code extension) or any local HTTP server.

---

## 🔐 Environment Variables

Create a `.env` file inside `kilowash-backend/`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://...       # From Supabase dashboard
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=8h
WA_API_URL=https://api.fonnte.com/send
WA_TOKEN=your_fonnte_token
WA_SENDER=628xxxxxxxxxx
```

---

## 🚀 Deployment

| Component | Platform |
|-----------|----------|
| Backend | Vercel (with `vercel.json`) |
| Frontend | Vercel (static site) |
| Database | Supabase (PostgreSQL cloud) |

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — free to use and modify.
