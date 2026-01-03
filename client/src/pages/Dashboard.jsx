import { useState, useEffect } from 'react';
import { teamsApi, playersApi } from '../api';
import TeamCard from '../components/TeamCard';
import PlayerForm from '../components/PlayerForm';
import PlayerTable from '../components/PlayerTable';
import './Dashboard.css';

function Dashboard() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [teamsRes, playersRes] = await Promise.all([
                teamsApi.getAll(),
                playersApi.getAll({ is_unsold: 'false' }),
            ]);
            setTeams(teamsRes.data);
            setPlayers(playersRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalSpent = teams.reduce((sum, t) => sum + (parseFloat(t.spent) || 0), 0);
    const totalPoints = teams.reduce((sum, t) => sum + (parseInt(t.total_points) || 0), 0);
    const avgPlayerPrice = players.length > 0
        ? players.reduce((sum, p) => sum + parseFloat(p.sold_amount), 0) / players.length
        : 0;

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading auction data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{teams.length}</span>
                        <span className="stat-label">Teams</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{players.length}</span>
                        <span className="stat-label">Players Sold</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{totalSpent.toFixed(2)} Cr</span>
                        <span className="stat-label">Total Spent</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{avgPlayerPrice.toFixed(2)} Cr</span>
                        <span className="stat-label">Avg Price</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{totalPoints}</span>
                        <span className="stat-label">Total Points</span>
                    </div>
                </div>
            </div>

            {/* Add Player Form */}
            <PlayerForm teams={teams} onPlayerAdded={fetchData} />

            {/* Teams Grid */}
            <div className="section">
                <h2 className="section-title">Teams Overview</h2>
                <div className="teams-grid">
                    {teams.map((team) => (
                        <TeamCard key={team.id} team={team} onUpdate={fetchData} />
                    ))}
                </div>
            </div>

            {/* Recent Players */}
            <div className="section">
                <h2 className="section-title">Recent Players</h2>
                <PlayerTable
                    players={players.slice(0, 10)}
                    teams={teams}
                    onDelete={fetchData}
                    onUpdate={fetchData}
                />
            </div>
        </div>
    );
}

export default Dashboard;
