import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsApi } from '../api';
import TeamCard from '../components/TeamCard';
import './Teams.css';

function Teams() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTeams = async () => {
        try {
            const response = await teamsApi.getAll();
            setTeams(response.data);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleTeamClick = (team) => {
        navigate(`/teams/${team.id}`);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading teams...</p>
            </div>
        );
    }

    return (
        <div className="teams-page">
            <div className="page-header">
                <h1>🏆 Teams Management</h1>
                <p className="page-subtitle">Click on a team to view squad details. Use the ✏️ button to edit name/purse.</p>
            </div>

            <div className="teams-grid">
                {teams.map((team) => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        onUpdate={fetchTeams}
                        onClick={handleTeamClick}
                    />
                ))}
            </div>
        </div>
    );
}

export default Teams;
