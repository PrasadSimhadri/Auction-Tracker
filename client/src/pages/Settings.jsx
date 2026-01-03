import { useState, useEffect } from 'react';
import { settingsApi, teamsApi } from '../api';
import './Settings.css';

function Settings() {
    const [maxPurse, setMaxPurse] = useState('100');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsApi.get();
                if (response.data.max_purse) {
                    setMaxPurse(response.data.max_purse);
                }
            } catch (err) {
                // Settings might not exist yet
                console.log('No settings found, using defaults');
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await settingsApi.updateMaxPurse(parseFloat(maxPurse));
            setSuccess('Max purse updated for all teams!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p className="page-subtitle">Configure global auction settings</p>
            </div>

            <div className="settings-card">
                <h2>Max Purse for All Teams</h2>
                <p className="settings-description">
                    This will update the maximum purse for all teams at once.
                    Useful when you want to reset or adjust budgets.
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="setting-row">
                    <label>Max Purse (Cr):</label>
                    <input
                        type="number"
                        value={maxPurse}
                        onChange={(e) => setMaxPurse(e.target.value)}
                        min="0"
                        step="10"
                    />
                    <button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Update All Teams'}
                    </button>
                </div>
            </div>

            <div className="settings-card">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <button onClick={() => setMaxPurse('50')}>Set 50 Cr</button>
                    <button onClick={() => setMaxPurse('100')}>Set 100 Cr</button>
                    <button onClick={() => setMaxPurse('150')}>Set 150 Cr</button>
                    <button onClick={() => setMaxPurse('200')}>Set 200 Cr</button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
