import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { editAnEvent } from '../services/organizerService';
import { uploadImageToCloudinary } from '../utils/uploadImageToCloudinary';
import {getEventById} from '../services/eventService'
import { useParams } from 'react-router-dom';
import {notifyError, notifySuccess} from '../utils/toastUtils'
import { useSelector } from 'react-redux';

const EditEvent = () => {
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    eventType: '',
    category: '',
    avatar: null,
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if(role === 'Participant') {
      notifyError('Forbidden');
      navigate('/events');
      return;
    }
    const fetchEvent = async () => {
        try {
          const res = await getEventById(id);
          const formatDate = (isoDate) => isoDate.split('T')[0];
          setFormData({
            title: res.title,
            description: res.description,
            startDate: formatDate(res.startDate),
            startTime: res.startTime,
            endDate: formatDate(res.endDate),
            endTime: res.endTime,
            location: res.location,
            eventType: res.eventType,
            category: res.category,
            avatar: null,
          });
          setImage(res.image);
          setPreview(res.image);
          notifySuccess('Event data fetched successfully!')
        } catch (error) {
          console.error(error);
          setError("Failed to load event");
          notifyError('Failed to fetch event data!')
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
  }, []);

  const handleChange = (e) => {
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
    setError('');

    setLoading(true);
    try {
      let imageUrl = image;
      if(formData.avatar) imageUrl = await uploadImageToCloudinary(formData.avatar);
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        location: formData.location,
        eventType: formData.eventType,
        category: formData.category,
        status: 'Upcoming',
        image: imageUrl,
      };

      await editAnEvent(id, payload);
      notifySuccess('Event Edited successfully!');
      navigate('/organizer');
    } catch (err) {
      console.error(err);
      setError('Failed to edit event.');
      notifyError('Failed to edit event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full p-6 bg-slate-800 rounded-xl shadow-lg text-white my-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Edit Event</h2>
        {error && <p className="bg-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 border border-cyan-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 border border-cyan-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="flex gap-2">
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-1/2 p-3 rounded bg-slate-700 border border-cyan-500 text-white" />
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-1/2 p-3 rounded bg-slate-700 border border-cyan-500 text-white" />
          </div>
          <div className="flex gap-2">
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-1/2 p-3 rounded bg-slate-700 border border-cyan-500 text-white" />
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-1/2 p-3 rounded bg-slate-700 border border-cyan-500 text-white" />
          </div>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 border border-cyan-500 text-white placeholder-gray-400"
          />
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 border border-cyan-500 text-white"
          >
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 border border-cyan-500 text-white placeholder-gray-400"
          />
          <div className="relative w-full">
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <label
              htmlFor="avatar"
              className="block w-full text-center p-3 border border-slate-600 rounded bg-slate-700 text-white cursor-pointer hover:bg-cyan-500 hover:text-white transition"
            >
              {formData.avatar ? formData.avatar.name : 'Choose Event Image'}
            </label>
          </div>
          {preview && (
            <img
              src={preview}
              alt="Event Preview"
              className="w-24 h-24 object-cover rounded-full mx-auto mt-3 border-2 border-cyan-500"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-white p-3 rounded font-semibold hover:bg-cyan-600 transition"
          >
            {loading ? 'Updating Event...' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
