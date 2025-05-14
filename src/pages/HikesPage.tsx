import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { hikeApi } from '../services/api';
import { HikeGetDTO } from '../types/api';

type ViewMode = 'all' | 'admin';

const HikesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [hikes, setHikes] = useState<HikeGetDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  useEffect(() => {
    const fetchHikes = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await (viewMode === 'all' 
          ? hikeApi.getMemberHikes()
          : hikeApi.getAdminHikes());
        setHikes(response.data);
      } catch (error) {
        console.error('Failed to fetch hikes:', error);
        setError('Failed to load hikes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHikes();
  }, [viewMode]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {viewMode === 'all' ? 'Available Hikes' : 'My Administered Hikes'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="all">
              All Hikes
            </ToggleButton>
            <ToggleButton value="admin">
              My Hikes
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/hikes/create')}
          >
            Create New Hike
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {hikes.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          {viewMode === 'all' 
            ? 'No hikes available. Create one to get started!'
            : 'You haven\'t created any hikes yet.'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {hikes.map((hike) => (
            <Grid item xs={12} sm={6} md={4} key={hike.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {hike.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Distance: {hike.maxDistanceKm} km
                  </Typography>
                  <Typography variant="body2">
                    Start: ({hike.startPoint.lat.toFixed(4)}, {hike.startPoint.lon.toFixed(4)})
                  </Typography>
                  <Typography variant="body2">
                    End: ({hike.endPoint.lat.toFixed(4)}, {hike.endPoint.lon.toFixed(4)})
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/hikes/${hike.id}`)}
                  >
                    View Details
                  </Button>
                  {hike.adminId === userId && (
                    <Button
                      size="small"
                      color="error"
                      onClick={async () => {
                        try {
                          await hikeApi.deleteHike(hike.id);
                          setHikes(hikes.filter((h) => h.id !== hike.id));
                        } catch (error) {
                          console.error('Failed to delete hike:', error);
                          setError('Failed to delete hike. Please try again.');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HikesPage; 