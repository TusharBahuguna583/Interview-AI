import React from 'react'
import { useAuth } from '../hooks/useAuth'
import './navbar.scss'

const Navbar = () => {
    const { user, handleLogout } = useAuth()

    if (!user) return null

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <h1 className="navbar__brand">
                    Interview AI
                </h1>
                <div className="navbar__user">
                    <span className="navbar__username">Welcome, {user.username}</span>
                    <button 
                        onClick={handleLogout}
                        className="navbar__logout-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
