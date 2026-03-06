import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchUserProfile = async () => {
  const response = await axios.put(`${API_URL}/api/users/profile`, {}, getAuthConfig());
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axios.put(`${API_URL}/api/users/profile`, data, getAuthConfig());
  return response.data;
};

export const requestOrganizer = async () => {
  const response = await axios.put(`${API_URL}/api/users/request-organizer`, {}, getAuthConfig());
  return response.data;
}
