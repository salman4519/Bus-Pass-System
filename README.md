# SmartPass Campus Sync

SmartPass Campus Sync is a production-ready web application for managing college bus passes, seats, and daily trip logging with a Google Sheets + Google Apps Script backend.

## Features

- QR-powered student check-in with seat validation
- Animated student and admin portals with route separation (`/` and `/admin`)
- Real-time seat, pass, and trip dashboards backed by Google Sheets
- CSV export, QR code generation, and responsive UI built with shadcn/ui + Tailwind CSS

## Tech Stack

- React 18 + TypeScript (Vite)
- Tailwind CSS / shadcn-ui component library
- TanStack Query for data fetching & caching
- html5-qrcode for scanning and qrcode for generation
- Google Apps Script Web App as the API layer (Google Sheets datastore)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Create an `.env.local` file in the project root:
     ```env
     VITE_SMARTPASS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
     ```
   - Replace the URL with your deployed Apps Script Web App.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. **Build for production**
   ```bash
   npm run build
   ```

## Backend Setup

The project includes `public/google-apps-script.gs` with seats, passes, and trips endpoints. Deploy it as a Web App (execute as “Me”, accessible to “Anyone”) and keep the Spreadsheet ID in sync with your Google Sheet.

## Deployment

Deploy the built assets to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.). Ensure `VITE_SMARTPASS_API_URL` is set in the hosting environment to point at your Apps Script deployment.

## License

This project is provided for institutional/educational use. Adapt as needed for your organization.
