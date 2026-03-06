import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FaBars, FaTimes} from 'react-icons/fa'

const Navbar = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const role = useSelector((state) => state.auth.role);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    }

    return (
        /* We replaced bg-[#1e1e1e] with our new custom animation class */
        <nav className="animate-bg text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Updated Brand color to a brighter cyan/blue accent */}
            <Link 
                to="/events" 
                onClick={() => setMenuOpen(false)} 
                className="text-2xl font-bold text-cyan-400 hover:text-white transition-colors"
            >
                Eventora
            </Link>

            <div className="hidden md:flex space-x-6 items-center">
                {user ? (
                <>
                    <Link to="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
                    <Link to="/profile" className="hover:text-cyan-400 transition">Profile</Link>
                    
                    {role === 'Admin' && (
                    <>
                        <Link to="/admin" className="hover:text-cyan-400 transition font-semibold">Admin</Link>
                        <Link to="/organizer" className="hover:text-cyan-400 transition">Organizer</Link>
                    </>
                    )}
                    
                    {role === 'Organizer' && role !== 'Admin' && (
                    <Link to="/organizer" className="hover:text-cyan-400 transition">Organizer</Link>
                    )}

                    <button
                    onClick={handleLogout}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-105"
                    >
                    Logout
                    </button>
                </>
                ) : (
                <>
                    <Link to="/login" className="hover:text-cyan-400 transition">Login</Link>
                    <Link 
                    to="/signup" 
                    className="bg-cyan-500 hover:bg-cyan-600 px-4 py-1.5 rounded-full text-sm font-medium transition"
                    >
                    Get Started
                    </Link>
                </>
                )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-cyan-400 text-2xl focus:outline-none">
                {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
            </div>

            {/* Mobile Menu - Added a slight blur effect */}
            {menuOpen && (
            <div className="md:hidden px-4 pb-4 space-y-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-700">
                {user ? (
                <>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-cyan-400">Dashboard</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-cyan-400">Profile</Link>
                    {/* ... Other links follow same pattern ... */}
                    <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg"
                    >
                    Logout
                    </button>
                </>
                ) : (
                <div className="pt-2 space-y-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-cyan-400">Login</Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)} className="block py-2 bg-cyan-600 text-center rounded-lg">Signup</Link>
                </div>
                )}
            </div>
            )}
        </nav>
    );
}

export default Navbar;
