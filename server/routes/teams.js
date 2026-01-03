const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all teams with remaining purse and total points
router.get('/', async (req, res) => {
    try {
        const [teams] = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.max_purse,
        t.created_at,
        t.updated_at,
        COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.sold_amount ELSE 0 END), 0) as spent,
        (t.max_purse - COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.sold_amount ELSE 0 END), 0)) as remaining_purse,
        COUNT(CASE WHEN p.is_unsold = FALSE THEN p.id END) as player_count,
        COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.points ELSE 0 END), 0) as total_points
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      GROUP BY t.id
      ORDER BY t.id
    `);
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get single team by ID with stats
router.get('/:id', async (req, res) => {
    try {
        const [teams] = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.max_purse,
        t.created_at,
        t.updated_at,
        COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.sold_amount ELSE 0 END), 0) as spent,
        (t.max_purse - COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.sold_amount ELSE 0 END), 0)) as remaining_purse,
        COUNT(CASE WHEN p.is_unsold = FALSE THEN p.id END) as player_count,
        COALESCE(SUM(CASE WHEN p.is_unsold = FALSE THEN p.points ELSE 0 END), 0) as total_points
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [req.params.id]);

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(teams[0]);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Create new team
router.post('/', async (req, res) => {
    try {
        const { name, max_purse = 100 } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Team name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO teams (name, max_purse) VALUES (?, ?)',
            [name, max_purse]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            max_purse,
            message: 'Team created successfully'
        });
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// Update team
router.put('/:id', async (req, res) => {
    try {
        const { name, max_purse } = req.body;
        const { id } = req.params;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (max_purse !== undefined) {
            updates.push('max_purse = ?');
            values.push(max_purse);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// Delete team
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// Get players for a specific team with optional role filter
router.get('/:id/players', async (req, res) => {
    try {
        const { role } = req.query;
        let query = 'SELECT * FROM players WHERE team_id = ? AND is_unsold = FALSE';
        const values = [req.params.id];

        if (role) {
            query += ' AND role = ?';
            values.push(role);
        }

        query += ' ORDER BY created_at DESC';

        const [players] = await pool.query(query, values);
        res.json(players);
    } catch (error) {
        console.error('Error fetching team players:', error);
        res.status(500).json({ error: 'Failed to fetch team players' });
    }
});

// Get role distribution for a team
router.get('/:id/stats', async (req, res) => {
    try {
        const [roleStats] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count,
        COALESCE(SUM(sold_amount), 0) as total_spent,
        COALESCE(SUM(points), 0) as total_points
      FROM players 
      WHERE team_id = ? AND is_unsold = FALSE
      GROUP BY role
    `, [req.params.id]);

        res.json(roleStats);
    } catch (error) {
        console.error('Error fetching team stats:', error);
        res.status(500).json({ error: 'Failed to fetch team stats' });
    }
});

module.exports = router;
