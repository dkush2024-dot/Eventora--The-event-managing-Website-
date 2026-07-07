import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Spinner from "../components/Spinner";
import { getEventById } from "../services/eventService";
import {
  cancelRegistration,
  registerForEvent,
  checkUserRegistration,
} from "../services/registrationService";
import { deleteAnEvent } from "../services/organizerService";
import { notifyError, notifySuccess } from "../utils/toastUtils";

const EventView = () => {
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const mail = useSelector((state) => state.auth.mail);
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        if (user) {
          const isRegistered = await checkUserRegistration(id);
          if (isRegistered.message === "Yes") setRegistered(true);
        }
        setEvent(res);
        // console.log(res);
      } catch (error) {
        console.error(error);
        setError("Failed to load event");
        notifyError("failed to fetch event data!");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) return navigate("/login");
    setRegistering(true);
    try {
      await registerForEvent(id);
      setRegistered(true);
      notifySuccess("Event Registration Successful!");
    } catch (err) {
      console.error(err);
      notifyError("Event Registration Failed!");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setRegistering(true);
    try {
      await cancelRegistration(id);
      setRegistered(false);
      notifySuccess("Registration Cancellation Successful!");
    } catch (err) {
      console.error(err);
      notifyError("Registration Cancellation Failed!");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteAnEvent(eventId);
      navigate("/events");
      notifySuccess("Event Deletion Successful!");
    } catch (err) {
      console.error(err);
      notifyError("Event Deletion Failed!");
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return <div className="text-center text-red-500 mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-2">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <img
          src={event.image || "/default-banner.jpg"}
          alt="Event"
          className="w-full h-64 object-cover"
        />
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
          <div className="text-cyan-400 text-lg mb-1">
            Status: {event.status}
          </div>
          <div className="text-gray-300 mb-1">
            Date: {new Date(event.startDate).toLocaleDateString()}
          </div>
          <div className="text-gray-300 mb-1">Time: {event.startTime}</div>
          <div className="text-gray-400 mb-4">Location: {event.location}</div>
          <p className="text-gray-200 text-base mb-6">{event.description}</p>

          <div className="flex gap-4 w-full max-w-xs">
            {event.status !== "Completed" &&
              (!registered ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className={`flex-1 px-6 py-3 rounded-xl transition ${
                    registering
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {registering ? "Registering..." : "Register"}
                </button>
              ) : (
                <button
                  onClick={handleCancelRegistration}
                  disabled={registering}
                  className={`flex-1 px-6 py-3 rounded-xl transition ${
                    registering
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {registering ? "Cancelling..." : "Cancel Registration"}
                </button>
              ))}

            {(role === "Admin" || mail === event.organizer.email) && (
              <button
                onClick={() => handleDelete(event._id)}
                className="flex-1 px-6 py-3 rounded-xl transition bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Event
              </button>
            )}
          </div>

          <div className="w-full max-w-xs my-2">
            {(role === "Admin" || mail === event.organizer.email) && (
              <Link to={`/admin/events/${id}`}>
                <button className="w-full px-6 py-3 rounded-xl transition bg-blue-600 hover:bg-blue-700 text-white">
                  See Registrations
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventView;
