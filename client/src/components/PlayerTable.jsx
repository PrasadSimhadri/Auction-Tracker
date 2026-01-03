import { useState } from 'react';
import { playersApi } from '../api';
import './PlayerTable.css';

const ROLES = ['WK', 'Batter', 'Bowler', 'AR'];

const getRoleBadgeClass = (role) => {
    const classes = {
        WK: 'role-wk',
        Batter: 'role-batter',
        Bowler: 'role-bowler',
        AR: 'role-ar',
    };
    return classes[role] || '';
};

function PlayerTable({ players, teams, onDelete, onUpdate, showTeam = true }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleEdit = (player) => {
        setEditingId(player.id);
        setEditData({
            name: player.name,
            role: player.role,
            sold_amount: player.sold_amount,
            team_id: player.team_id,
            points: player.points || 0,
            notes: player.notes || '',
        });
    };

    const handleSave = async (playerId) => {
        try {
            await playersApi.update(playerId, {
                ...editData,
                sold_amount: parseFloat(editData.sold_amount),
                team_id: parseInt(editData.team_id),
                points: parseInt(editData.points) || 0,
            });
            setEditingId(null);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to update player:', error);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDelete = async (player) => {
        if (window.confirm(`Are you sure you want to remove ${player.name}?`)) {
            try {
                await playersApi.delete(player.id);
                if (onDelete) onDelete();
            } catch (error) {
                console.error('Failed to delete player:', error);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    if (!players || players.length === 0) {
        return (
            <div className="empty-state">
                <p>No players yet</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="player-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Role</th>
                        {showTeam && <th>Team</th>}
                        <th>Amount</th>
                        <th>Points</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) => (
                        <tr key={player.id}>
                            <td className="cell-num">{index + 1}</td>
                            <td className="cell-name">
                                {editingId === player.id ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editData.name}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    player.name
                                )}
                            </td>
                            <td>
                                {editingId === player.id ? (
                                    <select
                                        name="role"
                                        value={editData.role}
                                        onChange={handleChange}
                                        className="edit-select"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`role-badge ${getRoleBadgeClass(player.role)}`}>
                                        {player.role}
                                    </span>
                                )}
                            </td>
                            {showTeam && (
                                <td className="cell-team">
                                    {editingId === player.id && teams ? (
                                        <select
                                            name="team_id"
                                            value={editData.team_id}
                                            onChange={handleChange}
                                            className="edit-select"
                                        >
                                            {teams.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        player.team_name || 'Unsold'
                                    )}
                                </td>
                            )}
                            <td className="cell-amount">
                                {editingId === player.id ? (
                                    <input
                                        type="number"
                                        name="sold_amount"
                                        value={editData.sold_amount}
                                        onChange={handleChange}
                                        className="edit-input small"
                                        step="0.1"
                                    />
                                ) : (
                                    `${player.sold_amount} Cr`
                                )}
                            </td>
                            <td className="cell-points">
                                {editingId === player.id ? (
                                    <input
                                        type="number"
                                        name="points"
                                        value={editData.points}
                                        onChange={handleChange}
                                        className="edit-input small"
                                    />
                                ) : (
                                    player.points || '-'
                                )}
                            </td>
                            <td className="cell-notes">
                                {editingId === player.id ? (
                                    <input
                                        type="text"
                                        name="notes"
                                        value={editData.notes}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    player.notes || '-'
                                )}
                            </td>
                            <td className="cell-actions">
                                {editingId === player.id ? (
                                    <>
                                        <button className="btn-save" onClick={() => handleSave(player.id)}>
                                            Save
                                        </button>
                                        <button className="btn-cancel" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-edit" onClick={() => handleEdit(player)}>
                                            Edit
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(player)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlayerTable;
