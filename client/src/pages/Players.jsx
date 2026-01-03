import { useState, useEffect } from 'react';
import { playersApi, teamsApi } from '../api';
import PlayerTable from '../components/PlayerTable';
import './Players.css';

const ROLES = ['All', 'WK', 'Batter', 'Bowler', 'AR'];

function Players() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        team_id: '',
        role: '',
    });

    const fetchData = async () => {
        try {
            const [playersRes, teamsRes] = await Promise.all([
                playersApi.getAll(filters.team_id || filters.role ? filters : {}),
                teamsApi.getAll(),
            ]);
            setPlayers(playersRes.data);
            setTeams(teamsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value === 'All' ? '' : value
        }));
    };

    const totalValue = players.reduce((sum, p) => sum + parseFloat(p.sold_amount), 0);
    const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading players...</p>
            </div>
        );
    }

    return (
        <div className="players-page">
            <div className="page-header">
                <h1>🏏 All Players</h1>
                <p className="page-subtitle">View and manage all auctioned players</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>Team:</label>
                    <select name="team_id" value={filters.team_id} onChange={handleFilterChange}>
                        <option value="">All Teams</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Role:</label>
                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                        {ROLES.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-stats">
                    <span className="filter-stat">
                        <strong>{players.length}</strong> players
                    </span>
                    <span className="filter-stat">
                        <strong>{totalValue.toFixed(2)} Cr</strong> total
                    </span>
                    <span className="filter-stat">
                        <strong>{totalPoints}</strong> points
                    </span>
                </div>
            </div>

            {/* Players Table */}
            <PlayerTable players={players} onDelete={fetchData} />
        </div>
    );
}

export default Players;
