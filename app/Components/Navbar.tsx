import { Link } from "react-router";
import { useState } from "react";
import { usePuterStore } from "../../lib/puter";

const Navbar = () => {
    const { auth, isLoading } = usePuterStore();
    const [menuOpen, setMenuOpen] = useState(false);

    const isAuthenticated = auth.isAuthenticated;

    const handleAuthClick = async () => {
        if (isLoading) return;
        if (isAuthenticated) {
            await auth.signOut();
        } else {
            await auth.signIn();
        }
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    const authLabel = isAuthenticated ? "Sign out" : "Sign in";

    const NavLinks = () => (
        <>
            <Link to="/" className="ghost-button nav-link" onClick={closeMenu}>
                Dashboard
            </Link>
            <Link to="/upload" className="ghost-button nav-link" onClick={closeMenu}>
                Uploads
            </Link>
            <Link to="/wipe" className="ghost-button nav-link" onClick={closeMenu}>
                Manage
            </Link>
        </>
    );

    return (
        <nav className="navbar glass-panel">
            <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
                <div className="logo-dot">ATS</div>
                <div>
                    <p className="text-lg font-semibold text-slate-900">ResumeTracker</p>
                    <p className="text-sm text-slate-500">AI-powered ATS scoring</p>
                </div>
            </Link>

            <div className="nav-links">
                <NavLinks />
            </div>

            <div className="nav-actions">
                <Link to="/upload" className="primary-button w-fit px-6" onClick={closeMenu}>
                    New Scan
                </Link>
                <button className="ghost-button nav-auth" onClick={handleAuthClick} disabled={isLoading}>
                    {isLoading ? "..." : authLabel}
                </button>
            </div>

            <button
                className="mobile-nav-toggle"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
            >
                <span />
                <span />
                <span />
            </button>

            {menuOpen && (
                <div className="mobile-nav-panel">
                    <NavLinks />
                    <Link to="/upload" className="primary-button w-full text-center" onClick={closeMenu}>
                        New Scan
                    </Link>
                    <button className="ghost-button w-full" onClick={handleAuthClick} disabled={isLoading}>
                        {isLoading ? "..." : authLabel}
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
