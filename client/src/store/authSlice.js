import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const storedEmail = localStorage.getItem('email');
const storedToken = localStorage.getItem('token');
const storedRole = localStorage.getItem('role');
const initialState = {
  user: storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null,
  token: storedToken && storedToken !== "undefined" ? storedToken : null,
  role: storedRole && storedRole !== "undefined" ? storedRole : null,
  mail: storedEmail && storedEmail !== "undefined" ? storedEmail : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role; 
      state.mail = action.payload.mail;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('mail', action.payload.mail);
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.mail = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('mail');
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
