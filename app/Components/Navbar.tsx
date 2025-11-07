import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar glass-panel">
            <Link to="/" className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    ATS
                </div>
                <div>
                    <p className="text-lg font-semibold text-slate-900">ResumeTracker</p>
                    <p className="text-sm text-slate-500">AI-powered ATS scoring</p>
                </div>
            </Link>
            <div className="flex items-center gap-3">
                <Link to="/" className="ghost-button hidden sm:inline-flex">
                    Dashboard
                </Link>
                <Link to="/upload" className="primary-button w-fit px-6">
                    New Scan
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
