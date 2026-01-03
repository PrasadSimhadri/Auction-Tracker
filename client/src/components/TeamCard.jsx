import { useState } from 'react';
import { teamsApi } from '../api';
import './TeamCard.css';

function TeamCard({ team, onUpdate, onClick }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(team.name);
    const [loading, setLoading] = useState(false);

    const spent = parseFloat(team.spent) || 0;
    const maxPurse = parseFloat(team.max_purse) || 100;
    const spentPercentage = (spent / maxPurse) * 100;
    const remainingPurse = parseFloat(team.remaining_purse) || (maxPurse - spent);
    const totalPoints = parseInt(team.total_points) || 0;
    const playerCount = parseInt(team.player_count) || 0;

    const handleSave = async () => {
        setLoading(true);
        try {
            await teamsApi.update(team.id, { name: editName });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to update team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditName(team.name);
        setIsEditing(false);
    };

    return (
        <div className="team-card" onClick={() => !isEditing && onClick && onClick(team)}>
            <div className="team-card-header">
                <div className="team-id">#{team.id}</div>
                {isEditing ? (
                    <input
                        type="text"
                        className="edit-name-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <h3 className="team-name">{team.name}</h3>
                )}
                <button
                    className="edit-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        isEditing ? handleSave() : setIsEditing(true);
                    }}
                    disabled={loading}
                >
                    {loading ? '...' : isEditing ? 'Save' : 'Edit'}
                </button>
                {isEditing && (
                    <button
                        className="cancel-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                        }}
                    >
                        X
                    </button>
                )}
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${Math.min(spentPercentage, 100)}%`,
                        background: spentPercentage > 80 ? '#ef4444' : spentPercentage > 50 ? '#f59e0b' : '#22c55e',
                    }}
                />
            </div>

            <div className="team-stats-grid">
                <div className="stat-item">
                    <span className="stat-value spent-value">{spent.toFixed(1)}</span>
                    <span className="stat-label">Spent</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value remaining-value">{remainingPurse.toFixed(1)}</span>
                    <span className="stat-label">Left</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{playerCount}</span>
                    <span className="stat-label">Players</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value points-value">{totalPoints}</span>
                    <span className="stat-label">Points</span>
                </div>
            </div>
        </div>
    );
}

export default TeamCard;
