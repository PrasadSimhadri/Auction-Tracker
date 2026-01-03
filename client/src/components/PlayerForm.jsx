import { useState } from 'react';
import { playersApi } from '../api';
import './PlayerForm.css';

const ROLES = [
    { value: 'WK', label: 'Wicket Keeper' },
    { value: 'Batter', label: 'Batter' },
    { value: 'Bowler', label: 'Bowler' },
    { value: 'AR', label: 'All-Rounder' },
];

function PlayerForm({ teams, onPlayerAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        sold_amount: '',
        team_id: '',
        notes: '',
        points: '',
        is_unsold: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: formData.name,
                role: formData.role,
                notes: formData.notes,
                points: formData.points ? parseInt(formData.points) : 0,
                is_unsold: formData.is_unsold,
            };

            if (!formData.is_unsold) {
                payload.sold_amount = parseFloat(formData.sold_amount);
                payload.team_id = parseInt(formData.team_id);
            }

            await playersApi.create(payload);
            setSuccess(formData.is_unsold ? `${formData.name} marked as unsold` : `${formData.name} added successfully!`);
            setFormData({
                name: '',
                role: '',
                sold_amount: '',
                team_id: '',
                notes: '',
                points: '',
                is_unsold: false,
            });
            if (onPlayerAdded) onPlayerAdded();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add player');
        } finally {
            setLoading(false);
        }
    };

    const getRemainingPurse = (team) => {
        const remaining = parseFloat(team.remaining_purse) || parseFloat(team.max_purse) || 100;
        return remaining.toFixed(2);
    };

    return (
        <div className="player-form-container">
            <h2 className="form-title">Add Player to Auction</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="player-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Player Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter player name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Role</option>
                            {ROLES.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_unsold"
                                checked={formData.is_unsold}
                                onChange={handleChange}
                            />
                            <span>Unsold</span>
                        </label>
                    </div>
                </div>

                {!formData.is_unsold && (
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="sold_amount">Amount (Cr)</label>
                            <input
                                type="number"
                                id="sold_amount"
                                name="sold_amount"
                                value={formData.sold_amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.1"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="team_id">Team</label>
                            <select
                                id="team_id"
                                name="team_id"
                                value={formData.team_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Team</option>
                                {teams && teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name} ({getRemainingPurse(team)} Cr left)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="points">Points</label>
                        <input
                            type="number"
                            id="points"
                            name="points"
                            value={formData.points}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    <div className="form-group flex-2">
                        <label htmlFor="notes">Notes</label>
                        <input
                            type="text"
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional notes..."
                        />
                    </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Adding...' : formData.is_unsold ? 'Mark as Unsold' : 'Add Player'}
                </button>
            </form>
        </div>
    );
}

export default PlayerForm;
