import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
  API.post('/events/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const registerForEvent = (eventId) =>
  API.post(`/events/event-register/${eventId}`);

export const registerTeamForEvent = (eventId, teamData) =>
  API.post(`/events/team-event-register/${eventId}`, teamData);

export const getMyClubEvents = () =>
  API.get('/events/my-club-events');

// Public: all events grouped by club
export const getAllEvents = () =>
  API.get('/events/all');

export const getEventAttendees = (eventId) =>
  API.get(`/events/${eventId}/attendees`);

export default API;
