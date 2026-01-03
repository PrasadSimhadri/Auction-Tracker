const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all players with optional filters
router.get('/', async (req, res) => {
    try {
        const { team_id, role, search, is_unsold } = req.query;
        let query = `
      SELECT 
        p.*,
        t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE 1=1
    `;
        const values = [];

        if (team_id) {
            query += ' AND p.team_id = ?';
            values.push(team_id);
        }

        if (role) {
            query += ' AND p.role = ?';
            values.push(role);
        }

        if (search) {
            query += ' AND p.name LIKE ?';
            values.push(`%${search}%`);
        }

        if (is_unsold === 'true') {
            query += ' AND p.is_unsold = TRUE';
        } else if (is_unsold === 'false') {
            query += ' AND p.is_unsold = FALSE';
        }

        query += ' ORDER BY p.created_at DESC';

        const [players] = await pool.query(query, values);
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Search players by name
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const [players] = await pool.query(`
      SELECT 
        p.*,
        t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.name LIKE ?
      ORDER BY p.name
      LIMIT 10
    `, [`%${q}%`]);

        res.json(players);
    } catch (error) {
        console.error('Error searching players:', error);
        res.status(500).json({ error: 'Failed to search players' });
    }
});

// Get single player by ID
router.get('/:id', async (req, res) => {
    try {
        const [players] = await pool.query(`
      SELECT 
        p.*,
        t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ?
    `, [req.params.id]);

        if (players.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(players[0]);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// Add new player (sold in auction or unsold)
router.post('/', async (req, res) => {
    try {
        const { name, role, sold_amount, team_id, notes, points, is_unsold } = req.body;

        // Validation
        if (!name || !role) {
            return res.status(400).json({
                error: 'Name and role are required'
            });
        }

        // If not unsold, team_id and sold_amount are required
        if (!is_unsold && (!sold_amount || !team_id)) {
            return res.status(400).json({
                error: 'Sold amount and team are required for sold players'
            });
        }

        const validRoles = ['WK', 'Batter', 'Bowler', 'AR'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Role must be one of: WK, Batter, Bowler, AR'
            });
        }

        // If not unsold, check team budget
        if (!is_unsold && team_id) {
            const [teamData] = await pool.query(`
        SELECT 
          t.max_purse,
          COALESCE(SUM(p.sold_amount), 0) as spent
        FROM teams t
        LEFT JOIN players p ON t.id = p.team_id AND p.is_unsold = FALSE
        WHERE t.id = ?
        GROUP BY t.id
      `, [team_id]);

            if (teamData.length === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }

            const remainingPurse = teamData[0].max_purse - teamData[0].spent;
            if (sold_amount > remainingPurse) {
                return res.status(400).json({
                    error: `Insufficient budget. Team has only ${remainingPurse} Cr remaining`
                });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO players (name, role, sold_amount, team_id, notes, points, is_unsold) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, role, is_unsold ? 0 : sold_amount, is_unsold ? null : team_id, notes || null, points || 0, is_unsold || false]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            role,
            sold_amount: is_unsold ? 0 : sold_amount,
            team_id: is_unsold ? null : team_id,
            notes,
            points,
            is_unsold: is_unsold || false,
            message: is_unsold ? 'Player marked as unsold' : 'Player added successfully'
        });
    } catch (error) {
        console.error('Error adding player:', error);
        res.status(500).json({ error: 'Failed to add player' });
    }
});

// Update player
router.put('/:id', async (req, res) => {
    try {
        const { name, role, sold_amount, team_id, notes, points, is_unsold } = req.body;
        const { id } = req.params;

        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (role !== undefined) {
            const validRoles = ['WK', 'Batter', 'Bowler', 'AR'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    error: 'Role must be one of: WK, Batter, Bowler, AR'
                });
            }
            updates.push('role = ?');
            values.push(role);
        }
        if (sold_amount !== undefined) {
            updates.push('sold_amount = ?');
            values.push(sold_amount);
        }
        if (team_id !== undefined) {
            updates.push('team_id = ?');
            values.push(team_id || null);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }
        if (points !== undefined) {
            updates.push('points = ?');
            values.push(points);
        }
        if (is_unsold !== undefined) {
            updates.push('is_unsold = ?');
            values.push(is_unsold);
            if (is_unsold) {
                updates.push('team_id = NULL');
                updates.push('sold_amount = 0');
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE players SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// Delete player
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM players WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

module.exports = router;
