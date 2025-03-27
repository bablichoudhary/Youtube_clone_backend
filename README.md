YouTube Clone Backend

This is the backend of a YouTube Clone project built using Node.js, Express, and MongoDB.

## Features

- User Authentication (Register, Login)
- Create, Like, Dislike, and View Videos
- JWT-based Authentication
- RESTful API design

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT, bcrypt.js

## Installation & Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/bablichoudhary/Youtube_clone_backend.git
   cd youtube_clone_backend
   Install dependencies:
   ```

bash
Copy code
npm install
Create a .env file in the root directory and add your environment variables:

ini
Copy code
MONGO_URI= "copy mpngodb localhost"/youtube_clone
JWT_SECRET=your_jwt_secret_key
Start the server:

bash
Copy code
npm run dev
The server will run on http://localhost:5000.

API Endpoints
POST /api/users/register – Register a new user

POST /api/users/login – Log in a user

GET /api/videos – Fetch all videos (when implemented)

Youtube Clone Video Link
https://drive.google.com/drive/u/0/folders/1xWED52LyuwUhMpXwHT4E3tzKqBm2bp8R
