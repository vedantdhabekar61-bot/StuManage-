# StuManage

> Modern Reading Room & Study Library Management SaaS for India

StuManage is a mobile-first SaaS platform built for reading room operators, tuition centers, and study library managers to manage students, seat allocations, fee tracking, and WhatsApp reminders from a single dashboard.

---

## ✨ Features

- 👨‍🎓 Student Registration & Management
- 💺 Visual Seat Layout Management
- 💰 Fee Tracking & Monthly Revenue Dashboard
- 📲 One-Tap WhatsApp Fee Reminders
- 📢 Bulk Reminder System
- ⚠️ Overdue Student Detection
- 🌙 Dark Mode Support
- 📱 Installable PWA (Progressive Web App)
- 🔒 Secure Authentication with Supabase
- 💳 Razorpay Subscription Billing

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Payments | Razorpay |
| Hosting | Netlify |
| Android App | Median.co (TWA Wrapper) |
| PWA | Custom Service Worker |

---

## 📱 Target Users

StuManage is built for:

- Reading Room Owners
- Study Library Managers
- Tuition & Coaching Centers
- Multi-Shift Study Spaces

Especially designed for small businesses in Tier 2 & Tier 3 Indian cities.

---

# 🚀 Features Overview

## 👨‍🎓 Student Management

- Add/Edit/Delete Students
- Shift & Seat Allocation
- Fee Amount Tracking
- Expiry Date Management
- Phone Validation
- Conflict Detection

---

## 💺 Seat Layout

- Visual Seat Grid
- Morning / Afternoon / Evening / Full Day Shift Support
- Seat Occupancy Tracking
- Real-Time Availability

---

## 💰 Dashboard

- Monthly Revenue Overview
- Active Student Count
- Available Seats
- Overdue Alerts
- Quick Actions

---

## 📲 WhatsApp Reminders

- One-Tap Individual Reminders
- Bulk Reminder System
- Custom Message Templates
- No Paid API Required

---

## 💳 Subscription Billing

- 30-Day Free Trial
- Razorpay Payment Gateway
- Secure Server-Side Verification
- Subscription Guard Protection

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/stumanage.git

# Open project
cd stumanage

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

---

## 📂 Project Structure

```bash
app/            # Next.js App Router pages
components/     # Reusable UI components
hooks/          # Custom React hooks
lib/            # Utility functions & helpers
public/         # Static assets & PWA files
```

---

## 🔒 Security

StuManage follows secure development practices:

- Supabase Row-Level Security (RLS)
- JWT Authentication
- Secure Razorpay Verification
- Server-only Secret Keys
- Protected API Routes

---

## 📈 Future Roadmap

- Automated WhatsApp API
- PDF Fee Receipts
- Hindi Language Support
- Multi-Branch Support
- Excel/CSV Export
- Student Self-Service Portal

---

## 💰 Pricing

| Plan | Price |
|---|---|
| Free Trial | 30 Days |
| Pro Plan | ₹50/month |

---

## 🇮🇳 Built for India

Made specifically for:
- Reading Rooms
- Study Libraries
- Tuition Classes
- Coaching Centers

Simple, affordable, and mobile-first.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Vedant  
Founder — StuManage

---

## ⭐ Support

If you like the project, give it a star on GitHub ⭐
