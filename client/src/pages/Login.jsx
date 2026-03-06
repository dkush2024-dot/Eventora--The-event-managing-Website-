import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { googleLoginUser, loginUser as loginUserAPI } from '../services/authService';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeToLive, setTimeToLive] = useState(0);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUserAPI({
        email: formData.email,
        password: formData.password,
      });
      dispatch(loginUser({ user: response.user.name, token: response.token, role: response.user.role, mail: response.user.email }));
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      if(err.status === 429) {
        setIsRateLimited(true);
        setTimeToLive(err.response.data.retryAfter);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      const response = await googleLoginUser({
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      });
      dispatch(loginUser({ user: response.user.name, token: response.token, role: response.user.role, mail: response.user.email }));
      navigate('/');
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [secondsLeft, setSecondsLeft] = useState(timeToLive);

  useEffect(() => {
    setSecondsLeft(timeToLive); // Sync countdown with rate limiter TTL
  }, [timeToLive]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timeout = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  useEffect(() => {
    if(secondsLeft <= 0) 
      setIsRateLimited(false);
  }, [secondsLeft]);

  useEffect(() => {
    if (user) navigate('/events');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full p-6 bg-slate-800 rounded-xl shadow-lg text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Login</h2>
      {error && <p className="bg-red-700 p-3 rounded mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-slate-700 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          autoComplete="email"
          aria-label="Email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-slate-700 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          autoComplete="current-password"
          aria-label="Password"
        />
        <button
          type="submit"
          disabled={loading || isRateLimited}
          className="w-full py-3 bg-cyan-500 text-white rounded font-semibold hover:bg-cyan-600 transition disabled:opacity-60"
          aria-busy={loading}
        >
          {isRateLimited?  `Please wait ${secondsLeft} seconds.` : loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          disabled={loading || isRateLimited}
          onClick={handleGoogleLogin}
          className="w-full py-3 mt-2 bg-red-600 rounded font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          aria-label="Login with Google"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21.805 10.023h-9.797v3.938h5.807c-.25 1.5-1.625 4.41-5.807 4.41-3.5 0-6.35-2.897-6.35-6.47s2.85-6.47 6.35-6.47c1.985 0 3.32.843 4.1 1.573l2.8-2.7C17.75 5.123 15.325 4.12 12.12 4.12 6.94 4.12 2.68 8.51 2.68 13.684c0 5.17 4.26 9.56 9.44 9.56 5.447 0 9.07-3.825 9.07-9.22 0-.62-.07-1.095-.385-1.98z"/>
          </svg>
          Login with Google
        </button>
      </form>

      <p className="text-center mt-6 text-cyan-300">
        Don't have an account?{' '}
        <Link to="/signup" className="underline hover:text-cyan-400 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  </div>
  );
};

export default LoginPage;
