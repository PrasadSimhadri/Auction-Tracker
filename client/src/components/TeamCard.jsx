import { useState } from 'react';
import { teamsApi } from '../api';
import './TeamCard.css';

const getRoleEmoji = (role) => {
    const emojis = {
        WK: '🧤',
        Batter: '🏏',
        Bowler: '⚾',
        AR: '⭐',
    };
    return emojis[role] || '👤';
};

function TeamCard({ team, onUpdate, onClick }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(team.name);
    const [editPurse, setEditPurse] = useState(team.max_purse);
    const [loading, setLoading] = useState(false);

    const spentPercentage = ((team.spent || 0) / team.max_purse) * 100;
    const remainingPurse = team.remaining_purse ?? (team.max_purse - (team.spent || 0));

    const handleSave = async () => {
        setLoading(true);
        try {
            await teamsApi.update(team.id, { name: editName, max_purse: parseFloat(editPurse) });
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
        setEditPurse(team.max_purse);
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
                    {loading ? '...' : isEditing ? '✓' : '✏️'}
                </button>
                {isEditing && (
                    <button
                        className="cancel-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="purse-info">
                <div className="purse-row">
                    <span className="purse-label">Max Purse:</span>
                    {isEditing ? (
                        <input
                            type="number"
                            className="edit-purse-input"
                            value={editPurse}
                            onChange={(e) => setEditPurse(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            step="0.1"
                        />
                    ) : (
                        <span className="purse-value">{team.max_purse} Cr</span>
                    )}
                </div>
                <div className="purse-row">
                    <span className="purse-label">Spent:</span>
                    <span className="purse-value spent">{(team.spent || 0).toFixed(2)} Cr</span>
                </div>
                <div className="purse-row">
                    <span className="purse-label">Remaining:</span>
                    <span className="purse-value remaining">{remainingPurse.toFixed(2)} Cr</span>
                </div>
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

            <div className="team-stats">
                <div className="stat">
                    <span className="stat-value">{team.player_count || 0}</span>
                    <span className="stat-label">Players</span>
                </div>
            </div>
        </div>
    );
}

export default TeamCard;
