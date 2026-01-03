import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsApi } from '../api';
import PlayerTable from '../components/PlayerTable';
import './TeamDetail.css';

const ROLES = ['All', 'WK', 'Batter', 'Bowler', 'AR'];

function TeamDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [roleStats, setRoleStats] = useState([]);
    const [selectedRole, setSelectedRole] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [teamRes, playersRes, statsRes] = await Promise.all([
                teamsApi.getById(id),
                teamsApi.getPlayers(id, selectedRole === 'All' ? null : selectedRole),
                teamsApi.getStats(id),
            ]);
            setTeam(teamRes.data);
            setPlayers(playersRes.data);
            setRoleStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch team data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, selectedRole]);

    const getRoleCount = (role) => {
        const stat = roleStats.find(s => s.role === role);
        return stat ? stat.count : 0;
    };

    const getRolePoints = (role) => {
        const stat = roleStats.find(s => s.role === role);
        return stat ? stat.total_points : 0;
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading team data...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="error-state">
                <h2>Team not found</h2>
                <button onClick={() => navigate('/teams')}>Back to Teams</button>
            </div>
        );
    }

    const totalPoints = roleStats.reduce((sum, s) => sum + (parseInt(s.total_points) || 0), 0);
    const spent = parseFloat(team.spent) || 0;
    const maxPurse = parseFloat(team.max_purse) || 100;
    const remainingPurse = parseFloat(team.remaining_purse) || (maxPurse - spent);
    const spentPercentage = (spent / maxPurse) * 100;

    return (
        <div className="team-detail">
            <button className="back-btn" onClick={() => navigate('/teams')}>
                Back to Teams
            </button>

            <div className="team-header">
                <div className="team-header-info">
                    <span className="team-id-badge">#{team.id}</span>
                    <h1>{team.name}</h1>
                </div>
            </div>

            {/* Budget Summary */}
            <div className="budget-summary">
                <div className="budget-card spent">
                    <span className="budget-label">Spent</span>
                    <span className="budget-value">{spent.toFixed(2)} Cr</span>
                </div>
                <div className="budget-card remaining">
                    <span className="budget-label">Remaining</span>
                    <span className="budget-value">{remainingPurse.toFixed(2)} Cr</span>
                </div>
                <div className="budget-card">
                    <span className="budget-label">Players</span>
                    <span className="budget-value">{team.player_count || 0}</span>
                </div>
                <div className="budget-card points">
                    <span className="budget-label">Total Points</span>
                    <span className="budget-value">{totalPoints}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="budget-progress">
                <div className="progress-bar-large">
                    <div
                        className="progress-fill-large"
                        style={{
                            width: `${Math.min(spentPercentage, 100)}%`,
                            background: spentPercentage > 80 ? '#ef4444' : spentPercentage > 50 ? '#f59e0b' : '#22c55e',
                        }}
                    />
                </div>
                <span className="progress-label">{spentPercentage.toFixed(1)}% spent</span>
            </div>

            {/* Role Distribution */}
            <div className="role-distribution">
                <div className="role-item" onClick={() => setSelectedRole('WK')}>
                    <span className="role-count">{getRoleCount('WK')}</span>
                    <span className="role-name">WK</span>
                    <span className="role-points">{getRolePoints('WK')} pts</span>
                </div>
                <div className="role-item" onClick={() => setSelectedRole('Batter')}>
                    <span className="role-count">{getRoleCount('Batter')}</span>
                    <span className="role-name">Batters</span>
                    <span className="role-points">{getRolePoints('Batter')} pts</span>
                </div>
                <div className="role-item" onClick={() => setSelectedRole('Bowler')}>
                    <span className="role-count">{getRoleCount('Bowler')}</span>
                    <span className="role-name">Bowlers</span>
                    <span className="role-points">{getRolePoints('Bowler')} pts</span>
                </div>
                <div className="role-item" onClick={() => setSelectedRole('AR')}>
                    <span className="role-count">{getRoleCount('AR')}</span>
                    <span className="role-name">All-Rounders</span>
                    <span className="role-points">{getRolePoints('AR')} pts</span>
                </div>
            </div>

            {/* Squad List */}
            <div className="squad-section">
                <div className="squad-header">
                    <h2>Squad ({players.length} players)</h2>
                    <div className="role-filter">
                        <label>Filter by Role:</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {ROLES.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <PlayerTable players={players} onDelete={fetchData} onUpdate={fetchData} showTeam={false} />
            </div>
        </div>
    );
}

export default TeamDetail;
