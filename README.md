# 📚 Library Management System

A lightweight library catalog and lending system built for my college English Literature
department, replacing a paper register with a searchable, mobile-friendly web app.

🔗 **Live demo:** [your-vercel-url-here]

## Why this exists

The department library (~300 books) was tracked entirely on paper. This project digitizes
the catalog and, eventually, the borrow/return workflow — built as a hands-on way to learn
real-world full-stack development, not just tutorials.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Hosting:** Vercel (CI/CD from GitHub)

## Features

- 📖 Add, edit, and delete books from the catalog
- 📱 Mobile-first responsive design
- 🔄 Real-time sync with a PostgreSQL database via Supabase
- (in progress) Borrow/return tracking, member roles, search & filter

## Running locally

\`\`\`bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
npm install
cp .env.example .env   # then fill in your own Supabase project keys
npm run dev
\`\`\`

## Roadmap

- [ ] Search and filter by title/author
- [ ] Borrow/return workflow with due dates
- [ ] Member authentication and admin roles
