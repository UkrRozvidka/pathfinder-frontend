import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { hikeApi } from '../services/api';
import { GeoPoint } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_CENTER: GeoPoint = {
  lat: 48.5,
  lon: 24.4
};

const DEFAULT_ZOOM = 9;

type PointType = 'start' | 'end';

interface MapClickHandlerProps {
  onLocationSelect: (location: GeoPoint) => void;
  isActive: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect, isActive }) => {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });
  return null;
};

const EditHikePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('');
  const [startPoint, setStartPoint] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPoint] = useState<GeoPoint | null>(null);
  const [selectedPointType, setSelectedPointType] = useState<PointType>('start');

  useEffect(() => {
    const fetchHike = async () => {
      try {
        const response = await hikeApi.getHike(Number(id));
        const hike = response.data;

        // Check if user is admin
        if (hike.adminId !== userId) {
          setError('You do not have permission to edit this hike');
          return;
        }

        setName(hike.name);
        setMaxDistanceKm(hike.maxDistanceKm.toString());
        setStartPoint(hike.startPoint);
        setEndPoint(hike.endPoint);
      } catch (error) {
        console.error('Failed to fetch hike:', error);
        setError('Failed to load hike data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHike();
    }
  }, [id, userId]);

  const handlePointSelect = (point: GeoPoint) => {
    if (selectedPointType === 'start') {
      setStartPoint(point);
    } else {
      setEndPoint(point);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !maxDistanceKm || !startPoint || !endPoint) return;

    try {
      await hikeApi.updateHike(Number(id), {
        name,
        maxDistanceKm: parseInt(maxDistanceKm),
        startPoint,
        endPoint,
      });
      navigate(`/hikes/${id}`);
    } catch (error) {
      console.error('Failed to update hike:', error);
      setError('Failed to update hike');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(`/hikes/${id}`)}>
          Back to Hike Details
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Hike
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  value={selectedPointType}
                  exclusive
                  onChange={(_, value) => value && setSelectedPointType(value)}
                >
                  <ToggleButton value="start" color="primary">
                    Set Start Point
                  </ToggleButton>
                  <ToggleButton value="end" color="primary">
                    Set End Point
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ height: 400, width: '100%' }}>
                <MapContainer
                  center={startPoint ? [startPoint.lat, startPoint.lon] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lon]}
                  zoom={startPoint ? 13 : DEFAULT_ZOOM}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onLocationSelect={handlePointSelect} isActive={true} />
                  
                  {startPoint && (
                    <Marker position={[startPoint.lat, startPoint.lon]}>
                    </Marker>
                  )}
                  {endPoint && (
                    <Marker position={[endPoint.lat, endPoint.lon]}>
                    </Marker>
                  )}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Hike Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Maximum Distance (km)"
                  type="number"
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(e.target.value)}
                  margin="normal"
                  required
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/hikes/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!name || !maxDistanceKm || !startPoint || !endPoint}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditHikePage; 