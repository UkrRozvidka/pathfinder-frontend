import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { hikeApi } from '../services/api';
import { GeoPoint } from '../types/api';

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

const CreateHikePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('');
  const [startPoint, setStartPoint] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPoint] = useState<GeoPoint | null>(null);
  const [selectedPointType, setSelectedPointType] = useState<PointType>('start');

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
      const response = await hikeApi.createHike({
        name,
        maxDistanceKm: parseInt(maxDistanceKm),
        startPoint,
        endPoint,
      });
      navigate(`/hikes/${response.data}`);
    } catch (error) {
      console.error('Failed to create hike:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Hike
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
                  center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lon]}
                  zoom={DEFAULT_ZOOM}
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
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={!name || !maxDistanceKm || !startPoint || !endPoint}
                >
                  Create Hike
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateHikePage; 