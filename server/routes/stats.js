const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get auction statistics
router.get('/', async (req, res) => {
    try {
        // Total stats
        const [totalStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_players,
        COALESCE(SUM(sold_amount), 0) as total_spent,
        COALESCE(AVG(sold_amount), 0) as avg_price,
        COALESCE(MAX(sold_amount), 0) as highest_bid,
        COALESCE(MIN(sold_amount), 0) as lowest_bid
      FROM players
    `);

        // Stats by role
        const [roleStats] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count,
        COALESCE(SUM(sold_amount), 0) as total_spent,
        COALESCE(AVG(sold_amount), 0) as avg_price
      FROM players
      GROUP BY role
    `);

        // Top 5 expensive players
        const [topPlayers] = await pool.query(`
      SELECT 
        p.name,
        p.role,
        p.sold_amount,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      ORDER BY p.sold_amount DESC
      LIMIT 5
    `);

        // Team spending summary
        const [teamSpending] = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.max_purse,
        COALESCE(SUM(p.sold_amount), 0) as spent,
        (t.max_purse - COALESCE(SUM(p.sold_amount), 0)) as remaining,
        COUNT(p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      GROUP BY t.id
      ORDER BY spent DESC
    `);

        res.json({
            overview: totalStats[0],
            byRole: roleStats,
            topPlayers,
            teamSpending
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
