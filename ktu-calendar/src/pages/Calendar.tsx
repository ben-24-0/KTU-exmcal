import React, { MouseEvent } from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import { format, parseISO } from 'date-fns';
import { collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Exam } from '../types';
import 'react-calendar/dist/Calendar.css';

type CalendarTileProps = {
  date: Date;
  view: string;
};

type Value = Date | [Date, Date] | null;

type Course = {
  id: string;
  name: string;
};

const COURSES: Course[] = [
  { id: 'CSE', name: 'Computer Science Engineering' },
  { id: 'ECE', name: 'Electronics & Communication' },
  { id: 'EEE', name: 'Electrical & Electronics' },
  { id: 'Civil', name: 'Civil Engineering' },
  { id: 'MECH', name: 'Mechanical Engineering' },
  { id: 'AI&ML', name: 'Artificial Intelligence & Machine Learning' },
  
];

const CalendarComponent: React.FC = () => {
  const [date, setDate] = useState<Value>(new Date());
  const [semester, setSemester] = useState<number>(4);
  const [course, setCourse] = useState<string>('CSE'); // Default to CSE
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const q = query(
          collection(db, 'exams'),
          where('semester', '==', semester),
          where('course', '==', course)
        );
        const querySnapshot = await getDocs(q);
        const examData: Exam[] = [];
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          console.log('Fetched exam data:', data); // Debug log
          try {
            const date = parseISO(data.date);
            if (isNaN(date.getTime())) {
              console.error(`Invalid date format for exam ${doc.id}:`, data.date);
              return;
            }
            examData.push({
              id: doc.id,
              name: data.name || '',
              subjectCode: data.subjectCode || '',
              date: data.date,
              time: data.time || '',
              venue: data.venue,
              semester: data.semester || 1,
            } as Exam);
          } catch (err) {
            console.error(`Error processing exam ${doc.id}:`, err);
          }
        });

        console.log('Total exams loaded:', examData.length); // Debug log
        
        // Sort exams by date
        setExams(examData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [semester, course]);

  const tileContent = ({ date, view }: CalendarTileProps) => {
    if (view !== 'month') return null;

    const examOnDate = exams.find(
      (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    console.log('Date:', format(date, 'yyyy-MM-dd'), 'Exam:', examOnDate); // Debug log

    return examOnDate ? (
      <div 
        className="exam-indicator" 
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedExam(examOnDate);
        }}
        style={{ // Add inline styles to ensure visibility
          backgroundColor: '#1976d2',
          padding: '4px',
          borderRadius: '4px',
          marginTop: '4px',
          width: '100%'
        }}
      >
        <Typography 
          variant="caption" 
          component="div" 
          sx={{ 
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '100%',
            display: 'block'
          }}
        >
          {examOnDate.subjectCode}
        </Typography>
      </div>
    ) : null;
  };

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setDate(value);
      const examOnDate = exams.find(
        (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(value, 'yyyy-MM-dd')
      );
      setSelectedExam(examOnDate || null);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom>
          Exam Calendar
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={course}
              label="Course"
              onChange={(e) => setCourse(e.target.value)}
            >
              {COURSES.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semester}
              label="Semester"
              onChange={(e) => setSemester(e.target.value as number)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem}>
                  Semester {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileContent={tileContent}
              className="dark-calendar"
              minDate={new Date(2025, 0, 1)}  // January 1, 2025
              maxDate={new Date(2025, 11, 31)} // December 31, 2025
              minDetail="month" // This will hide the year view
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '300px' } }}>
            {selectedExam ? (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d' }}>
                <Typography variant="h6" gutterBottom>
                  {selectedExam.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Subject Code: {selectedExam.subjectCode}
                </Typography>
                <Typography gutterBottom>
                  Date: {format(new Date(selectedExam.date), 'MMMM dd, yyyy')}
                </Typography>
                <Typography gutterBottom>
                  Time: {selectedExam.time}
                </Typography>
                {selectedExam.venue && (
                  <Typography gutterBottom>
                    Venue: {selectedExam.venue}
                  </Typography>
                )}
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d' }}>
                <Typography>
                  {exams.length > 0 
                    ? 'Select a date with an exam to view details'
                    : 'No exams scheduled for this semester'}
                </Typography>
              </Paper>
            )}
            
            {exams.length > 0 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2, backgroundColor: '#2d2d2d' }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Exams
                </Typography>
                {exams.map((exam) => (
                  <Box 
                    key={exam.id} 
                    sx={{ 
                      mb: 1, 
                      p: 1, 
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#383838' },
                      backgroundColor: selectedExam?.id === exam.id ? '#404040' : 'transparent'
                    }}
                    onClick={() => setSelectedExam(exam)}
                  >
                    <Typography variant="subtitle2">
                      {exam.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(exam.date), 'MMM dd')} - {exam.time}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CalendarComponent; 