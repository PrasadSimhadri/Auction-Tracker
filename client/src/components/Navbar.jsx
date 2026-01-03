import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { playersApi } from '../api';
import './Navbar.css';

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchPlayers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                const response = await playersApi.search(searchQuery);
                setSearchResults(response.data);
                setShowResults(true);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };

        const debounce = setTimeout(searchPlayers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleResultClick = (player) => {
        setSearchQuery('');
        setShowResults(false);
        navigate(`/teams/${player.team_id}`);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>IPL Auction Tracker</h1>
            </div>

            <div className="search-container" ref={searchRef}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                />
                {showResults && searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((player) => (
                            <div
                                key={player.id}
                                className="search-result-item"
                                onClick={() => handleResultClick(player)}
                            >
                                <span className="result-name">{player.name}</span>
                                <span className="result-info">
                                    {player.role} | {player.team_name || 'Unsold'} | {player.sold_amount} Cr
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="search-results">
                        <div className="search-result-item no-results">No players found</div>
                    </div>
                )}
            </div>

            <div className="navbar-links">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Dashboard
                </NavLink>
                <NavLink to="/teams" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Teams
                </NavLink>
                <NavLink to="/players" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Players
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Settings
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
