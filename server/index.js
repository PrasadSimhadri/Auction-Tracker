const express = require('express');
const cors = require('cors');
require('dotenv').config();

const teamsRouter = require('./routes/teams');
const playersRouter = require('./routes/players');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'IPL Auction Tracker API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - GET    /api/teams`);
    console.log(`   - POST   /api/teams`);
    console.log(`   - PUT    /api/teams/:id`);
    console.log(`   - DELETE /api/teams/:id`);
    console.log(`   - GET    /api/players`);
    console.log(`   - POST   /api/players`);
    console.log(`   - PUT    /api/players/:id`);
    console.log(`   - DELETE /api/players/:id`);
    console.log(`   - GET    /api/stats`);
});
