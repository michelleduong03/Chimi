# ☕ Cafe Order Speaker System (Chimi)

A lightweight, local-friendly system for managing and announcing customer orders in small cafes. Designed to reduce confusion, long lines, and missed orders by displaying live queues and announcing pickups using text-to-speech.

## 💡 Why "Chimi"?

**Chimi** is short for "chime me!" – a friendly name that reflects the gentle sound when your order is ready. It’s simple, memorable, and fits the cozy cafe vibe.

---

## 🎯 Purpose

Many local cafes struggle with busy counters, unclear pickup processes, and shouting names. This project helps staff manage orders efficiently with a clear, visual 3-bucket system:

- **Making** – Orders in progress  
- **Ready for Pickup** – Orders that are done (with spoken alert)  
- **Complete** – Orders that have been picked up

This system can run locally on a browser, monitor, or tablet in-store.

---

## 🛠 Tech Stack

- **Frontend:** React (JavaScript)
- **Backend:** Node.js + Express
- **Data Storage:** In-memory JSON (optionally persistent)
- **Text-to-Speech:** Web Speech API (browser-based)

---

## 🚀 Features

- Add new orders with name or order number
- Move orders through "Making → Pickup → Complete"
- Automatic voice announcements for ready orders
- Real-time display of all active orders
- Simple and customizable UI
- Runs locally, no internet required once set up

---

## ⚙️ Getting Started

### Backend

cd server
npm install
node index.js

### Frontend

cd client
npm install
npm start

---

## 🧠 Author

Made with ☕ and code by Michelle Duong
[GitHub](https://github.com/michelleduong03)

---
