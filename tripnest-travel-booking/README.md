# TripNest — Travel Booking Platform

A React + Vite student project demonstrating a travel booking platform with User and Admin modules.

## Features
- User signup, login and logout using browser Local Storage
- Admin login and dashboard
- Flight, hotel and cab search using sample data
- Booking confirmation and My Bookings / itinerary page
- User booking cancellation
- Admin user list and booking status management
- Responsive layout for desktop and mobile

## Requirements
Install Node.js (LTS) and VS Code.

## Run locally
1. Extract this ZIP file.
2. Open the `tripnest-travel-booking` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## Demo admin credentials
- Email: `admin@tripnest.com`
- Password: `Admin123`

Create a normal user account through the Sign up page.

## Build for production
```bash
npm run build
```
The production output is created in the `dist` folder.

## Deploy to Vercel
1. Create a GitHub repository and push this project.
2. Sign in to Vercel using GitHub and choose **Add New → Project**.
3. Import your repository.
4. Framework preset: **Vite**.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**.

No environment variables are required for this demo.

## Important project notes
- Flight, hotel and cab listings are sample data in `src/App.jsx`. They are not live supplier API results.
- Checkout is a simulated confirmation only. It does not process real payments.
- Authentication and bookings are stored in Local Storage for academic demonstration. This is not production-grade secure authentication.
- Local Storage is browser-specific. Clearing browser data removes demo accounts and bookings.
