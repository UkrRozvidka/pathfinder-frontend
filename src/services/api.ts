import axios from 'axios';
import { 
  AuthDTO, 
  HikeCreateDTO, 
  HikeGetDTO, 
  HikeGetFullDTO,
  HikeMemberCreateDTO,
  PointCreateDTO,
  PointGetDTO,
  TrackCreateDTO,
  PointUpdateDTO,
  TrackGetDTO
} from '../types/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5081',
  withCredentials: true
});

export const authApi = {
  login: (data: AuthDTO) => api.post('/api/auth/login', data),
  register: (data: AuthDTO) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me')
};

export const hikeApi = {
  getHike: (id: number) => api.get<HikeGetFullDTO>(`/api/hike/${id}`),
  getAdminHikes: () => api.get<HikeGetDTO[]>('/api/hike/admin'),
  getMemberHikes: () => api.get<HikeGetDTO[]>('/api/hike/member'),
  createHike: (data: HikeCreateDTO) => api.post<number>('/api/hike', data),
  updateHike: (id: number, data: HikeCreateDTO) => api.put(`/api/hike?id=${id}`, data),
  deleteHike: (id: number) => api.delete(`/api/hike/${id}`)
};

export const hikeMemberApi = {
  create: (data: HikeMemberCreateDTO) => api.post('/api/hikeMember', data),
  delete: (id: number) => api.delete(`/api/hikeMember/${id}`)
};

export const pointApi = {
  getPoint: (id: number) => api.get<PointGetDTO>(`/api/point/${id}`),
  createPoint: (data: PointCreateDTO) => api.post('/api/point', data),
  updatePoint: (id: number, data: PointUpdateDTO) => api.put(`/api/point?id=${id}`, data),
  deletePoint: (id: number) => api.delete(`/api/point/${id}`)
};

export const trackApi = {
  getTrack: (id: number) => api.get<TrackGetDTO>(`/api/track/${id}`),
  createTrack: (data: FormData) => api.post<number>('/api/track', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  createTrackWithName: (data: TrackCreateDTO) => api.post<number>('/api/track', data),
  deleteTrack: (id: number) => api.delete(`/api/track/${id}`),
  downloadTrack: (id: number) => api.get(`/api/track/${id}/download`, { 
    responseType: 'blob',
    headers: {
      'Accept': 'application/gpx+xml'
    }
  })
};

export const userApi = {
  getUser: (id: number) => api.get(`/api/user/${id}`)
}; 