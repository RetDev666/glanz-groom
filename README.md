<div align="center">
  <img src="https://glanzgroom.de/logo.svg" alt="Glanz & Groom Logo" width="200"/>

  # 🐾 Glanz & Groom
  **Modern Pet Grooming Salon Platform**

  <p>
    <a href="https://glanzgroom.de">Live Website</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>

  ![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
</div>

<br/>

## 📖 About The Project

**Glanz & Groom** is a comprehensive software solution designed for a premium dog grooming salon based in Germany. It provides a seamless digital experience for both the salon's clients and the administrators.

### ✨ Key Features

**For Clients:**
- 📅 **Smart Booking System:** Interactive multi-step booking flow.
- 🐕 **Dynamic Breed Recognition:** Automatically suggests services and prices based on the dog's coat type (Short, Wire, Undercoat, Long).
- 📱 **Responsive Design:** A beautiful, premium UI tailored for mobile and desktop using Material Design 3 principles.
- 🌍 **Multi-language:** Supports both German (DE) and Ukrainian (UK).

**For Administrators:**
- 🔐 **Secure Admin Dashboard:** Complete control over the salon operations.
- 📆 **Interactive Calendar:** Manage appointments, view daily schedules, and block off break times.
- ✂️ **Service & Groomer Management:** Dynamically update prices, durations, and staff availability.
- 📊 **Client CRM:** Keep track of client history, pets, and notes.

---

## 🛠 Tech Stack

The project is structured as a **Monorepo** containing three main applications:

### 1. Client Frontend (`/frontend`)
- Framework: **Next.js 14** (App/Pages Router)
- Styling: **Tailwind CSS**
- State Management: **React Hooks**
- Language: **TypeScript**

### 2. Admin Dashboard (`/admin`)
- Framework: **Next.js**
- Styling: **Tailwind CSS**
- Authentication: **JWT**

### 3. Backend API (`/backend`)
- Server: **Node.js** with **Express**
- Database ORM: **Prisma**
- Database: **SQLite** (Development) / **PostgreSQL** (Production)
- Language: **TypeScript**

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/RetDev666/glanz-groom.git
cd glanz-groom
```

### 2. Install Dependencies & Start Backend
```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Start the development server
npm start
```

### 3. Install Dependencies & Start Frontend
```bash
cd ../frontend
npm install

# Start the development server
npm run dev
```

### 4. Install Dependencies & Start Admin Panel
```bash
cd ../admin
npm install

# Start the development server
npm run dev
```

---

## 📂 Project Structure

```text
glanz-groom/
├── admin/          # Next.js Admin Dashboard
├── backend/        # Node.js + Express API
├── frontend/       # Next.js Client Website
└── README.md       # Project Documentation
```

---

<div align="center">
  <i>Developed with ❤️ for Glanz & Groom.</i>
</div>
