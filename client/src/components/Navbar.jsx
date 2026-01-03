import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="logo">🏏</span>
                <h1>IPL Auction Tracker</h1>
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
            </div>
        </nav>
    );
}

export default Navbar;
