import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getUsersRegistration } from '../services/registrationService';
import { useSelector } from 'react-redux';
import {notifyError} from '../utils/toastUtils'

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeToLive, setTimeToLive] = useState(0);

  const fetchDashboard = async () => {
      try {
        const res = await getUsersRegistration();
        setEvents(res);
      } catch (err) {
        if(err.status === 429) {
          setIsRateLimited(true);
          setTimeToLive(err.response.data.retryAfter);
        }
        setError('Failed to load dashboard');
        notifyError('Failed to load dashboard!');
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchDashboard();
  }, []);

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
    if (secondsLeft === 0 && isRateLimited) {
      fetchDashboard();
      setIsRateLimited(false);
    }
  }, [secondsLeft, isRateLimited]);

  if (loading) return <Spinner />;
  if(isRateLimited) return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-10 flex justify-center items-center">
      <div className="text-center">
        <h4 className="text-4xl font-bold text-cyan-400 mb-4">
          ⚠️ Request Limit Exceeded
        </h4>
        <p className="text-lg text-gray-300">
          Trying again after <span className="text-cyan-300">{secondsLeft} seconds.</span>
        </p>
      </div>
    </div>
  )
  if (error) return <div className="text-red-400 text-center mt-4">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 text-center mb-10">
          Welcome, {user || 'User'} 👋
        </h1>

        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Your Registered Events
        </h2>

        {events.length === 0 ? (
          <p className="text-center text-gray-300">
            No events registered yet.{' '}
            <Link to="/events" className="text-cyan-400 hover:underline">
              Browse Events
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((reg) => {
              const evt = reg.event;
              return (
                <div
                  key={reg._id}
                  className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-cyan-400/20 transition duration-300"
                >
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="text-xl font-bold text-cyan-400">{evt.title}</h3>
                    <p className="text-sm text-gray-300">
                      📅 {new Date(evt.startDate).toLocaleDateString()} • 🕓 {evt.startTime}
                    </p>
                    <p className="text-sm text-white">📍 {evt.location}</p>
                    <p className="text-sm text-white">
                      👤 Organizer:{' '}
                      <span className="text-cyan-300">
                        {evt.organizer?.name || 'Unknown'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">Status : {evt.status}</p>
                    <p className="text-sm text-gray-400">{evt.eventType}</p>

                    <div className="mt-3">
                      <Link
                        to={`/events/${evt._id}`}
                        className="inline-block bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 font-semibold transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
