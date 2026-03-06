import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { fetchUserProfile, updateUserProfile, requestOrganizer } from '../services/userService';
import { notifyError, notifySuccess } from '../utils/toastUtils';
import { uploadImageToCloudinary } from '../utils/uploadImageToCloudinary';
const Profile = () => {

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: null,
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [organizerRequest, setOraganizerRequest] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeToLive, setTimeToLive] = useState(0);

  const fetchProfileData = async () => {
    try {
      const user = await fetchUserProfile();
      setFormData({ name: user.name, email: user.email, password: '', avatar: null });
      setAvatarUrl(user.avatar);
      setRole(user.role);
      setOraganizerRequest(user.organizerApprovalStatus);
    } catch (err){
      if(err.status === 429) {
        setIsRateLimited(true);
        setTimeToLive(err.response.data.retryAfter);
      }
      setError('Failed to fetch profile');
      notifyError('Failed to fetch profile')
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'avatar') {
      const file = files[0];
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let updatedAvatar = avatarUrl;
      if (formData.avatar) {
        updatedAvatar = await uploadImageToCloudinary(formData.avatar);
      }

      await updateUserProfile({
        ...formData,
        avatar: updatedAvatar,
      });
      notifySuccess('Profile Updated!')
      
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
      notifyError('Update failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrganizerRequest  = async () => {
    try {
      await requestOrganizer();
      setOraganizerRequest('pending');
      notifySuccess('Organizer Request Sent!')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
      notifyError('Update failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  } 

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
      fetchProfileData();
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
  if (error) return <div className="min-h-screen bg-slate-900 py-10 px-2 text-3xl font-bold text-center">{error}</div>;
  return (
    <div className="min-h-screen bg-slate-900 py-10 px-2">
      <div className="max-w-3xl mx-auto bg-slate-800 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">Your Profile</h1>

        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || avatarUrl || '/default-avatar.png'}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-cyan-500 shadow-md"
          />
          <p className="text-lg mt-2">{formData.name}</p>
          <p className="text-sm text-gray-400">{formData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-slate-700 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-slate-700 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="relative w-full">
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <label
              htmlFor="avatar"
              className="block text-center p-3 border border-slate-600 rounded bg-slate-700 cursor-pointer hover:bg-cyan-500 hover:text-white transition"
            >
              {formData.avatar ? formData.avatar.name : 'Change Avatar'}
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded transition"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Role: <span className="text-white font-semibold">{role}</span>
          </p>
          {role === 'Participant' && organizerRequest == 'not applied' && (
            <button onClick = {handleOrganizerRequest } className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition">
              Request Organizer Role
            </button>
          )}
          {role === 'Participant' && organizerRequest == 'rejected' && (
            <button onClick = {handleOrganizerRequest } className="mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition">
              Rejected, Re-Apply
            </button>
          )}
          {role === 'Participant' && organizerRequest == 'pending' && (
            <button className="mt-3 bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded text-white transition">
              Organizer Request Pending
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
