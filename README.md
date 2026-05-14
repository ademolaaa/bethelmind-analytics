# Bethelmind Analytics - Modernized Platform

A premium digital solutions platform built for the Nigerian market, featuring high-end luxury UI/UX, integrated CRM, and WhatsApp automation.

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js (Express) on Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Design**: Luxury Obsidian & Gold theme with Bento Grids and Liquid Animations

## Key Features
- **Luxury UI**: Premium aesthetics using custom glassmorphism and motion tokens.
- **WhatsApp Bot**: Lead generation and qualification bot for Nigerian SMEs.
- **Market Intelligence**: Scraper for local platforms (e.g., Jiji) to analyze market trends.
- **CRM Integration**: Lead tracking and conversion management via Supabase.

## Setup
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/ademolaaa/bethelmind-analytics
    cd bethelmind-analytics
    npm install
    ```
2.  **Environment Variables**: Create a `.env` file based on `.env.example`.
3.  **Supabase Setup**: Run the `server/db/schema.sql` in your Supabase SQL editor.
4.  **Local Development**:
    ```bash
    npm run dev
    ```

## Deployment
This project is optimized for deployment on **Vercel**. Simply connect the GitHub repository to your Vercel account.

## License
MIT
