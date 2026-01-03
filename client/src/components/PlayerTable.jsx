import { playersApi } from '../api';
import './PlayerTable.css';

const getRoleBadgeClass = (role) => {
    const classes = {
        WK: 'role-wk',
        Batter: 'role-batter',
        Bowler: 'role-bowler',
        AR: 'role-ar',
    };
    return classes[role] || '';
};

function PlayerTable({ players, onDelete, showTeam = true }) {
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
                            <td className="cell-name">{player.name}</td>
                            <td>
                                <span className={`role-badge ${getRoleBadgeClass(player.role)}`}>
                                    {player.role}
                                </span>
                            </td>
                            {showTeam && <td className="cell-team">{player.team_name}</td>}
                            <td className="cell-amount">{player.sold_amount} Cr</td>
                            <td className="cell-points">{player.points || '-'}</td>
                            <td className="cell-notes">{player.notes || '-'}</td>
                            <td className="cell-actions">
                                <button className="btn-delete" onClick={() => handleDelete(player)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlayerTable;
