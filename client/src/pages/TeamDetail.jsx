import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsApi } from '../api';
import PlayerTable from '../components/PlayerTable';
import './TeamDetail.css';

const getRoleCount = (players, role) => players.filter(p => p.role === role).length;

function TeamDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [teamRes, playersRes] = await Promise.all([
                teamsApi.getById(id),
                teamsApi.getPlayers(id),
            ]);
            setTeam(teamRes.data);
            setPlayers(playersRes.data);
        } catch (error) {
            console.error('Failed to fetch team data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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

    const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
    const spentPercentage = ((team.spent || 0) / team.max_purse) * 100;

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
                <div className="budget-card">
                    <span className="budget-label">Max Purse</span>
                    <span className="budget-value">{team.max_purse} Cr</span>
                </div>
                <div className="budget-card spent">
                    <span className="budget-label">Spent</span>
                    <span className="budget-value">{(team.spent || 0).toFixed(2)} Cr</span>
                </div>
                <div className="budget-card remaining">
                    <span className="budget-label">Remaining</span>
                    <span className="budget-value">{(team.remaining_purse || team.max_purse).toFixed(2)} Cr</span>
                </div>
                <div className="budget-card">
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
                <div className="role-item">
                    <span className="role-count">{getRoleCount(players, 'WK')}</span>
                    <span className="role-name">WK</span>
                </div>
                <div className="role-item">
                    <span className="role-count">{getRoleCount(players, 'Batter')}</span>
                    <span className="role-name">Batters</span>
                </div>
                <div className="role-item">
                    <span className="role-count">{getRoleCount(players, 'Bowler')}</span>
                    <span className="role-name">Bowlers</span>
                </div>
                <div className="role-item">
                    <span className="role-count">{getRoleCount(players, 'AR')}</span>
                    <span className="role-name">All-Rounders</span>
                </div>
            </div>

            {/* Squad List */}
            <div className="squad-section">
                <h2>Squad ({players.length} players)</h2>
                <PlayerTable players={players} onDelete={fetchData} showTeam={false} />
            </div>
        </div>
    );
}

export default TeamDetail;
