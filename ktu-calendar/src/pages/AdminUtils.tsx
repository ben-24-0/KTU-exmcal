import React, { useEffect } from 'react';
import { Button, Box, Typography, Alert, CircularProgress, Stack } from '@mui/material';
import { addSampleExams, removeAllExams } from '../utils/sampleData';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminUtils: React.FC = () => {
  const [status, setStatus] = React.useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const [dbStatus, setDbStatus] = React.useState<{
    checking: boolean;
    connected: boolean;
    error?: string;
  }>({
    checking: true,
    connected: false
  });

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      // Try to fetch a document from Firestore
      const querySnapshot = await getDocs(collection(db, 'exams'));
      setDbStatus({
        checking: false,
        connected: true
      });
      console.log('Total exams in database:', querySnapshot.size);
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStatus({
        checking: false,
        connected: false,
        error: (error as Error).message
      });
    }
  };

  const handleAddSampleExams = async () => {
    try {
      const result = await addSampleExams();
      if (result) {
        setStatus({
          message: 'Sample exams added successfully!',
          type: 'success'
        });
        // Recheck database connection and count
        checkDatabaseConnection();
      } else {
        setStatus({
          message: 'Failed to add sample exams.',
          type: 'error'
        });
      }
    } catch (error) {
      setStatus({
        message: 'Error adding sample exams: ' + (error as Error).message,
        type: 'error'
      });
    }
  };

  const handleRemoveAllExams = async () => {
    if (window.confirm('Are you sure you want to remove all exams? This cannot be undone.')) {
      try {
        const result = await removeAllExams();
        if (result) {
          setStatus({
            message: 'All exams removed successfully!',
            type: 'success'
          });
        } else {
          setStatus({
            message: 'Failed to remove exams.',
            type: 'error'
          });
        }
      } catch (error) {
        setStatus({
          message: 'Error removing exams: ' + (error as Error).message,
          type: 'error'
        });
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Admin Utilities
      </Typography>

      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          Database Status
        </Typography>
        {dbStatus.checking ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Checking database connection...</Typography>
          </Box>
        ) : (
          <Alert severity={dbStatus.connected ? "success" : "error"}>
            {dbStatus.connected 
              ? "Connected to Firebase database"
              : `Database connection failed: ${dbStatus.error || 'Unknown error'}`}
          </Alert>
        )}
      </Box>
      
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sample Data Management
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleAddSampleExams}
            color="primary"
            disabled={!dbStatus.connected}
          >
            Add Sample Exams
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRemoveAllExams}
            color="error"
            disabled={!dbStatus.connected}
          >
            Remove All Exams
          </Button>
        </Stack>
        
        {status.type && (
          <Alert severity={status.type} sx={{ mt: 2 }}>
            {status.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AdminUtils; 