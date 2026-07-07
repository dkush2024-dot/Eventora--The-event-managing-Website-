import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { deleteAnEvent, getOrganizersEvents } from '../services/organizerService';
import { notifySuccess, notifyError } from '../utils/toastUtils';
import { useSelector } from 'react-redux';

const OrganizerDashboard = () => {
  const prev_page = localStorage.getItem("page");
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(prev_page == null ? 1 : Number(prev_page));
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('desc');
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const fetchOrganizerEvents = async () => {
    try {
      const params = {
        page,
        limit: 100,
        search,
        eventType,
        location,
        sort,
      };
      const res = await getOrganizersEvents(params);
      setEvents(res.events);
    } catch (err) {
      console.error(err);
      notifyError('Event Fetching Failed!')
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(role === 'Participant') {
      notifyError('Forbidden');
      navigate('/events');
      return;
    }
    fetchOrganizerEvents();
    window.scrollTo(0, 0);
    localStorage.setItem("page", page);
  }, [page, sort]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteAnEvent(eventId);
      setEvents(events.filter(e => e._id !== eventId));
      notifySuccess('Event Deleted Successfully!');
    } catch (err) {
      console.error(err);
      notifyError('Event Deletion Failed!')
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setEventType(e.target.value);
    setPage(1);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setPage(1);
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-cyan-400">
        Welcome Organizer!
      </h1>
      <div className="text-center mb-6">
        <button
          onClick={() => navigate('/create_event')}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl shadow-md"
        >
          + Create New Event
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center mb-10">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={handleSearchChange}
          className="px-4 py-2 rounded-lg w-full md:w-60 bg-slate-800 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="text"
          placeholder="Event type (e.g. Music)"
          value={eventType}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-lg w-full md:w-60 bg-slate-800 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={handleLocationChange}
          className="px-4 py-2 rounded-lg w-full md:w-60 bg-slate-800 border border-cyan-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg w-full md:w-60 bg-slate-800 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="desc">Sort by Newest</option>
          <option value="asc">Sort by Oldest</option>
        </select>
        <button
          onClick={fetchOrganizerEvents}
          className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 font-semibold"
        >
          Search
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-gray-200">No events created yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div key={event._id} className="bg-slate-800 p-6 rounded-2xl shadow-xl transition hover:shadow-cyan-400/20 space-y-4">
              <h3 className="text-xl font-bold text-cyan-400">{event.title}</h3>
              <p className="text-sm text-gray-300">Date: {new Date(event.startDate).toLocaleDateString()}</p>
              <p className={`text-sm font-medium ${event.status === 'Upcoming' ? 'text-green-400' : 'text-gray-400'}`}>
                Status: {event.status}
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-xl"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/edit/${event._id}`)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 rounded-xl"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
