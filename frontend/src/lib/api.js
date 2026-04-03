import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// Add a request interceptor to handle JSON content-type
API.interceptors.request.use((config) => {
  // Only set JSON content-type if we're not sending FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Auth APIs
export const registerCollege = (googleToken) =>
  API.post('/users/register/college', { googleToken });

export const loginGoogle = (googleToken) =>
  API.post('/users/login/google', { googleToken });

export const logoutUser = () =>
  API.post('/users/logout');

// Event APIs
export const createEvent = (formData) =>
  API.post('/events/create', formData);

export const updateEvent = (eventId, formData) =>
  API.put(`/events/${eventId}/update`, formData);

export const deleteEvent = (eventId) =>
  API.delete(`/events/${eventId}/delete`);

export const registerForEvent = (eventId) =>
  API.post(`/events/event-register/${eventId}`);

export const registerTeamForEvent = (eventId, teamData) =>
  API.post(`/events/team-event-register/${eventId}`, teamData);

export const getMyClubEvents = () =>
  API.get('/events/my-club-events');

export const getAllEvents = () =>
  API.get('/events/all');

export const getEventAttendees = (eventId) =>
  API.get(`/events/${eventId}/attendees`);

export default API;
