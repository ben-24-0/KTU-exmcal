import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Exam } from '../types';
import { format } from 'date-fns';
import { addSampleExams } from '../utils/sampleData';

export default function Admin() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: '',
    date: '',
    time: '',
    venue: '',
    semester: 1,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const examData: Exam[] = [];
      querySnapshot.forEach((doc) => {
        examData.push({ id: doc.id, ...doc.data() } as Exam);
      });
      setExams(examData);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to fetch exams');
    }
  };

  const handleAddSampleExams = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addSampleExams();
      await fetchExams();
      setSuccess('Sample exams added successfully!');
    } catch (err) {
      setError('Failed to add sample exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (exam?: Exam) => {
    if (exam) {
      setSelectedExam(exam);
      setFormData({
        name: exam.name,
        subjectCode: exam.subjectCode,
        date: exam.date,
        time: exam.time,
        venue: exam.venue || '',
        semester: exam.semester,
      });
    } else {
      setSelectedExam(null);
      setFormData({
        name: '',
        subjectCode: '',
        date: '',
        time: '',
        venue: '',
        semester: 1,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedExam(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedExam) {
        await updateDoc(doc(db, 'exams', selectedExam.id), formData);
      } else {
        await addDoc(collection(db, 'exams'), formData);
      }
      fetchExams();
      handleClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      setError('Failed to save exam');
    }
  };

  const handleDelete = async (examId: string) => {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError('Failed to delete exam');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manage Exams</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleAddSampleExams}
            disabled={loading}
          >
            Add Sample Exams
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Exam
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        {exams.map((exam) => (
          <Grid item xs={12} sm={6} md={4} key={exam.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {exam.name}
                </Typography>
                <Typography color="textSecondary">
                  Subject Code: {exam.subjectCode}
                </Typography>
                <Typography>
                  Date: {format(new Date(exam.date), 'MMMM dd, yyyy')}
                </Typography>
                <Typography>Time: {exam.time}</Typography>
                {exam.venue && <Typography>Venue: {exam.venue}</Typography>}
                <Typography>Semester: {exam.semester}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(exam)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(exam.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedExam ? 'Edit Exam' : 'Add New Exam'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Exam Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Subject Code"
              value={formData.subjectCode}
              onChange={(e) =>
                setFormData({ ...formData, subjectCode: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Venue (Optional)"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={formData.semester}
                label="Semester"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semester: e.target.value as number,
                  })
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedExam ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 