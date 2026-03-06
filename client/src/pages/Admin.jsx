import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import {
  approveOrganizerRequest,
  getPendingOrganizerRequests,
  rejectOrganizerRequest,
} from '../services/adminService';
import { notifySuccess, notifyError } from '../utils/toastUtils';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(role !== 'Admin') {
      notifyError('Forbidden');
      navigate('/events');
      return;
    }
    const fetchAdminData = async () => {
      try {
        const response = await getPendingOrganizerRequests();
        setRequests(response);
      } catch (err) {
        console.error(err);
        notifyError('Failed to fecth data!')
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleApprove = async (reqId) => {
    try {
      await approveOrganizerRequest(reqId);
      setRequests(requests.filter((req) => req._id !== reqId));
      notifySuccess('Request Approved!')
    } catch (err) {
      console.error(err);
      notifyError('Fail to approve request!')
    }
  };

  const handleReject = async (reqId) => {
    try {
      await rejectOrganizerRequest(reqId);
      setRequests(requests.filter((req) => req._id !== reqId));
      notifySuccess('Request rejected!')
    } catch (err) {
      console.error(err);
      notifyError('Fail to reject request!')
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4">
      <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">
        Organizer Requests
      </h2>

      {requests.length === 0 ? (
        <p className="text-center text-gray-300">No pending requests.</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-slate-800 backdrop-blur-md rounded-2xl p-5 shadow-xl transition hover:shadow-cyan-400/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-14 h-14 rounded-full border-2 border-cyan-500"
                  />
                  <div>
                    <p className="text-lg font-semibold">{req.name}</p>
                    <p className="text-sm text-gray-400">{req.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
