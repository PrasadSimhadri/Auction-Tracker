# IPL Auction Tracker

A web application to track IPL-style auctions for university fest events. Built with React (Vite) frontend and Node.js/Express backend with MySQL database.

## Features

- 🏏 **Team Management**: 10 teams with editable names and purse (default 100 Cr)
- 👤 **Player Auction**: Track players with name, role, sold amount, and notes
- 📊 **Dashboard**: Real-time stats and team summaries
- 💰 **Budget Tracking**: Automatic remaining purse calculation

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL

## Setup Instructions

### 1. Database Setup

Make sure MySQL is running on your system, then run:

```bash
mysql -u root -p < init-db.sql
```

Or manually run the SQL commands in `init-db.sql` using MySQL Workbench.

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

The API will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | Get all teams |
| POST | `/api/teams` | Create team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |
| GET | `/api/players` | Get all players |
| POST | `/api/players` | Add player |
| PUT | `/api/players/:id` | Update player |
| DELETE | `/api/players/:id` | Delete player |
| GET | `/api/stats` | Get auction stats |

## Environment Variables

Create a `.env` file in the `server` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=auc_tracker
DB_PORT=3306
PORT=5000
```

## License

MIT
