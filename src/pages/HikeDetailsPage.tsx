import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import EditIcon from '@mui/icons-material/Edit';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { hikeApi, hikeMemberApi, pointApi, trackApi } from '../services/api';
import { HikeGetFullDTO, PointCreateDTO, PointUpdateDTO, GeoPoint } from '../types/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

const DEFAULT_CENTER: GeoPoint = {
  lat: 48.5,
  lon: 24.4
};

const DEFAULT_ZOOM = 9;

interface MapClickHandlerProps {
  onLocationSelect: (location: GeoPoint) => void;
  isActive: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect, isActive }) => {
  const map = useMapEvents({
    click: (e) => {
      if (isActive) {
        onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });
  return null;
};

const Input = styled('input')({
  display: 'none',
});

const HikeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [hike, setHike] = useState<HikeGetFullDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [error, setError] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{ id: number; geoPoint: GeoPoint; priority: number } | null>(null);
  const [pointPriority, setPointPriority] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [newTrackDialogOpen, setNewTrackDialogOpen] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');

  useEffect(() => {
    const fetchHike = async () => {
      try {
        const response = await hikeApi.getHike(Number(id));
        setHike(response.data);
        console.log('Debug - Hike Data:', {
          adminId: response.data.adminId,
          userId: userId,
          isAdmin: response.data.adminId === userId,
          adminIdType: typeof response.data.adminId,
          userIdType: typeof userId
        });
      } catch (error) {
        console.error('Failed to fetch hike:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHike();
    }
  }, [id, navigate, userId]);

  const handleAddMemberClick = () => {
    setNewMemberName('');
    setError('');
    setAddMemberDialogOpen(true);
  };

  const handleAddMember = async () => {
    if (!hike || !newMemberName.trim()) return;
    setError('');
    setAddingMember(true);

    try {
      await hikeMemberApi.create({
        userName: newMemberName.trim(),
        hikeId: hike.id,
      });
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
      setNewMemberName('');
      setAddMemberDialogOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member. Please check if the username exists.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!hike || !memberToDelete) return;

    try {
      await hikeMemberApi.delete(memberToDelete.id);
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError('Failed to remove member. Please try again.');
    }
  };

  const handleLocationSelect = async (location: GeoPoint) => {
    if (!hike || !userId) return;

    try {
      if (selectedPoint) {
        // Update existing point
        await pointApi.updatePoint(selectedPoint.id, {
          geoPoint: location,
          priority: pointPriority
        });
      } else {
        // Create new point
        await pointApi.createPoint({
          geoPoint: location,
          priority: pointPriority,
          hikeId: hike.id
        });
      }
      
      // Refresh hike data
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
      
      // Reset state
      setIsAddingPoint(false);
      setSelectedPoint(null);
      setPointPriority(1);
    } catch (error) {
      console.error('Failed to handle point:', error);
      setError('Failed to save point. Please try again.');
    }
  };

  const handleDeletePoint = async (pointId: number) => {
    if (!hike) return;

    try {
      await pointApi.deletePoint(pointId);
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
    } catch (error) {
      console.error('Failed to delete point:', error);
      setError('Failed to delete point. Please try again.');
    }
  };

  const getCurrentUserHikeMember = () => {
    return hike?.hikeMembers?.find(member => member.userId === userId);
  };

  const canManagePoints = () => {
    const currentMember = getCurrentUserHikeMember();
    return currentMember !== undefined;
  };

  const handleTrackUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !hike) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hikeId', hike.id.toString());
    formData.append('fileName', file.name);

    try {
      await trackApi.createTrack(formData);
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
    } catch (error) {
      console.error('Failed to upload track:', error);
      setError('Failed to upload track. Please try again.');
    }
  };

  const handleTrackDownload = async (trackId: number) => {
    try {
      const response = await trackApi.downloadTrack(trackId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `track-${trackId}.gpx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download track:', error);
      setError('Failed to download track. Please try again.');
    }
  };

  const handleTrackDelete = async (trackId: number) => {
    if (!hike) return;

    try {
      await trackApi.deleteTrack(trackId);
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
    } catch (error) {
      console.error('Failed to delete track:', error);
      setError('Failed to delete track. Please try again.');
    }
  };

  const handleTrackSelect = async (trackId: number) => {
    try {
      if (selectedTrack === trackId) {
        setSelectedTrack(null);
        return;
      }

      const response = await trackApi.getTrack(trackId);
      setSelectedTrack(trackId);
      // Here you would need to parse the GPX data and display it on the map
      // This would require additional library for parsing GPX and displaying on the map
    } catch (error) {
      console.error('Failed to load track:', error);
      setError('Failed to load track. Please try again.');
    }
  };

  const handleCreateTrack = async () => {
    if (!hike || !newTrackName.trim()) return;

    try {
      await trackApi.createTrackWithName({
        hikeId: hike.id,
        fileName: newTrackName.trim()
      });
      const response = await hikeApi.getHike(hike.id);
      setHike(response.data);
      setNewTrackDialogOpen(false);
      setNewTrackName('');
    } catch (error) {
      console.error('Failed to create track:', error);
      setError('Failed to create track. Please try again.');
    }
  };

  if (loading || !hike) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {hike.name}
        </Typography>
        {hike.adminId === userId && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/hikes/${hike.id}/edit`)}
          >
            Edit Hike
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                {canManagePoints() && (
                  <>
                    <Button
                      variant={isAddingPoint ? "contained" : "outlined"}
                      startIcon={<AddLocationIcon />}
                      onClick={() => {
                        setIsAddingPoint(!isAddingPoint);
                        setSelectedPoint(null);
                      }}
                    >
                      {isAddingPoint ? "Cancel Adding Point" : "Add Point"}
                    </Button>
                    {isAddingPoint && (
                      <TextField
                        type="number"
                        label="Priority"
                        size="small"
                        value={pointPriority}
                        onChange={(e) => setPointPriority(Number(e.target.value))}
                        sx={{ width: 100 }}
                      />
                    )}
                  </>
                )}
              </Box>
              
              <Box sx={{ height: 400, width: '100%' }}>
                <MapContainer
                  center={hike ? [hike.startPoint.lat, hike.startPoint.lon] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lon]}
                  zoom={hike ? 13 : DEFAULT_ZOOM}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler 
                    onLocationSelect={handleLocationSelect} 
                    isActive={isAddingPoint || selectedPoint !== null} 
                  />
                  
                  <Marker position={[hike.startPoint.lat, hike.startPoint.lon]}>
                    <Popup>Start Point</Popup>
                  </Marker>
                  <Marker position={[hike.endPoint.lat, hike.endPoint.lon]}>
                    <Popup>End Point</Popup>
                  </Marker>
                  
                  {hike.hikeMembers?.map((member) =>
                    member.points?.map((point) => (
                      <Marker
                        key={point.id}
                        position={[point.geoPoint.lat, point.geoPoint.lon]}
                      >
                        <Popup>
                          <Typography variant="body2">
                            {member.userName}'s Point (Priority: {point.priority})
                          </Typography>
                          {member.userId === userId && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                startIcon={<EditLocationIcon />}
                                onClick={() => {
                                  setSelectedPoint({
                                    id: point.id,
                                    geoPoint: point.geoPoint,
                                    priority: point.priority
                                  });
                                  setPointPriority(point.priority);
                                  setIsAddingPoint(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeletePoint(point.id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                        </Popup>
                      </Marker>
                    ))
                  )}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hike Details
              </Typography>
              <Typography>Distance: {hike.maxDistanceKm} km</Typography>
              <Typography>Admin: {hike.adminName}</Typography>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAddIcon /> Members Management
                  </Typography>
                  {hike?.adminId === userId && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddMemberClick}
                    >
                      Add Member
                    </Button>
                  )}
                </Box>

                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Members ({hike.hikeMembers?.length || 0})
                  </Typography>
                  <List>
                    {hike.hikeMembers?.map((member) => (
                      <ListItem
                        key={member.id}
                        divider
                        sx={{
                          backgroundColor: member.userId === userId ? 'action.selected' : 'inherit',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {member.userName}
                              {member.userId === hike.adminId && (
                                <Typography variant="caption" sx={{ backgroundColor: 'primary.main', color: 'white', px: 1, borderRadius: 1 }}>
                                  Admin
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={`${member.points?.length || 0} points added`}
                        />
                        {hike.adminId === userId && member.userId !== userId && (
                          <ListItemSecondaryAction>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<PersonRemoveIcon />}
                              onClick={() => setMemberToDelete({ id: member.id, name: member.userName })}
                            >
                              Remove
                            </Button>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Tracks
                  {hike.adminId === userId && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setNewTrackDialogOpen(true)}
                      >
                        New Track
                      </Button>
                    </Box>
                  )}
                </Typography>

                <List>
                  {hike.tracks?.map((track) => (
                    <ListItem
                      key={track.id}
                      divider
                      sx={{
                        backgroundColor: selectedTrack === track.id ? 'action.selected' : 'inherit',
                      }}
                    >
                      <ListItemText
                        primary={track.fileName}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleTrackSelect(track.id)}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            edge="end"
                            onClick={() => handleTrackDownload(track.id)}
                            size="small"
                          >
                            <CloudDownloadIcon />
                          </IconButton>
                          {hike.adminId === userId && (
                            <IconButton
                              edge="end"
                              onClick={() => handleTrackDelete(track.id)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {(!hike.tracks || hike.tracks.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No tracks available
                    </Typography>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={addMemberDialogOpen}
        onClose={() => !addingMember && setAddMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon /> Add New Member
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            disabled={addingMember}
            error={!!error}
            placeholder="Enter username to add"
            helperText="Enter the username of the person you want to add to the hike"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddMemberDialogOpen(false)} 
            disabled={addingMember}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={addingMember || !newMemberName.trim()}
            startIcon={addingMember ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {addingMember ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRemoveIcon color="error" /> Remove Member
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{memberToDelete?.name}</strong> from this hike?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberToDelete(null)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRemoveMember} 
            color="error" 
            variant="contained"
            startIcon={<PersonRemoveIcon />}
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newTrackDialogOpen} onClose={() => setNewTrackDialogOpen(false)}>
        <DialogTitle>Create New Track</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Track Name"
            type="text"
            fullWidth
            value={newTrackName}
            onChange={(e) => setNewTrackName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTrackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTrack} variant="contained" disabled={!newTrackName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HikeDetailsPage; 