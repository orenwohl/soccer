# Neighborhood Football App

A full-stack application for organizing football matches with friends, generating balanced teams based on player ratings, and tracking match results in a league table.

## Features

-   **Player Management:** Register players with skill ratings and availability
-   **Team Generation:** Create balanced teams based on player ratings
-   **Match Management:** Schedule matches and record results
-   **League Table:** View current standings and statistics

## Technologies Used

-   **Frontend:** Next.js, TypeScript, Tailwind CSS
-   **Backend:** Express.js, TypeScript, Node.js
-   **Database:** MongoDB

## Project Structure

```
soccer/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/ # API controllers
│   │   ├── models/   # Mongoose models
│   │   ├── routes/   # API routes
│   │   ├── utils/    # Utility functions
│   │   └── server.ts # Main server file
│   ├── package.json
│   └── tsconfig.json
└── frontend/         # Next.js frontend
    ├── app/          # App router
    │   ├── matches/  # Match pages
    │   ├── players/  # Player pages
    │   ├── table/    # League table
    │   ├── services/ # API services
    │   └── types/    # TypeScript interfaces
    ├── public/       # Static assets
    ├── package.json
    └── tsconfig.json
```

## Getting Started

### Prerequisites

-   Node.js (v16 or later)
-   MongoDB (local or Atlas)

### Installation

1. Clone the repository:

    ```
    git clone https://github.com/yourusername/soccer.git
    cd soccer
    ```

2. Set up the backend:

    ```
    cd backend
    npm install
    ```

3. Create a `.env` file in the backend directory with the following content:

    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/neighborhood-football
    NODE_ENV=development
    ```

4. Set up the frontend:

    ```
    cd ../frontend
    npm install
    ```

5. Create a `.env.local` file in the frontend directory:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

### Running the Application

1. Start the backend server:

    ```
    cd backend
    npm run dev
    ```

2. In a new terminal, start the frontend development server:

    ```
    cd frontend
    npm run dev
    ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## Deployment

### Backend Deployment

1. Build the TypeScript code:

    ```
    cd backend
    npm run build
    ```

2. Deploy the `dist` folder and configure environment variables on your hosting platform.

### Frontend Deployment

1. Build the Next.js application:

    ```
    cd frontend
    npm run build
    ```

2. Deploy the `.next` folder using a platform like Vercel or Netlify.

## Future Enhancements

-   Player statistics (goals, assists)
-   Account-based authentication
-   Email/SMS notifications
-   Mobile applications
-   Social features (comments, photos, videos)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
