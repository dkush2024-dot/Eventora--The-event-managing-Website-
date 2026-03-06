import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getEventRegistrations } from '../services/adminService';
import {notifyError, notifySuccess} from '../utils/toastUtils'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const EventRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  useEffect(() => {
    if(role === 'Participant') {
      notifyError('Forbidden');
      navigate('/events');
      return;
    }
    const fetchRegistrations = async () => {
      try {
        const res = await getEventRegistrations(id);
        setRegistrations(res);
        notifySuccess('Event data fetched successfully!')
      } catch (err) {
        console.error(err);
        notifyError('Failed to fetch event data!')
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [id]);

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
            Event Registrations
        </h2>

        {registrations.length === 0 ? (
          <p className="text-center text-gray-300">No registrations found.</p>       
        ) : ( 
          <div className="space-y-4">
            {registrations.map(reg => (
              <div
                key={reg._id}
                className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl transition hover:shadow-cyan-400/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={reg.user.avatar}
                    alt={reg.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"
                  />
                  <div>
                    <p className="font-semibold text-lg">{reg.user.name}</p>
                    <p className="text-sm text-gray-400">{reg.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Registered at:{' '}
                      {new Date(reg.registeredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    reg.cancelled
                      ? 'bg-red-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {reg.cancelled ? 'Cancelled' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
