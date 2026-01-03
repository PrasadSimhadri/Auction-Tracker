const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all settings
router.get('/', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM settings');
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.setting_key] = s.setting_value;
        });
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update max purse for all teams
router.put('/max-purse', async (req, res) => {
    try {
        const { max_purse } = req.body;
        if (!max_purse || max_purse <= 0) {
            return res.status(400).json({ error: 'Invalid max purse value' });
        }

        // Update settings table
        await pool.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['max_purse', max_purse.toString(), max_purse.toString()]
        );

        // Update all teams
        await pool.query('UPDATE teams SET max_purse = ?', [max_purse]);

        res.json({ message: 'Max purse updated for all teams', max_purse });
    } catch (error) {
        console.error('Error updating max purse:', error);
        res.status(500).json({ error: 'Failed to update max purse' });
    }
});

module.exports = router;
