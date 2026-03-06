import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getOrganizerConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getOrganizersEvents = async (eventData) => {
    const config = getOrganizerConfig();
    config.params = eventData; 
    const response = await axios.get(`${API_URL}/api/events/organizer/get`, config);
    return response.data;
}

export const deleteAnEvent = async (id) => {
    const response = await axios.delete(`${API_URL}/api/events/${id}`, getOrganizerConfig());
    return response.data;
}

export const createAnEvent = async (data) => {
    const response = await axios.post(`${API_URL}/api/events/`, data, getOrganizerConfig());
    return response.data;
}

export const editAnEvent = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/events/${id}`, data, getOrganizerConfig());
  return response.data;
}
