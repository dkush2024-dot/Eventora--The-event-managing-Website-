import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/registration';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const checkUserRegistration = async (id) => {
  const response = await axios.get(`${API_URL}/is-registered/${id}`, getAuthConfig());
  return response.data;
};

export const registerForEvent = async (id) => {
  const response = await axios.post(`${API_URL}/${id}`, {}, getAuthConfig());
  return response.data;
};

export const cancelRegistration = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

export const getUsersRegistration = async () => {
  const response = await axios.get(`${API_URL}/my-events`, getAuthConfig());
  return response.data;
};
