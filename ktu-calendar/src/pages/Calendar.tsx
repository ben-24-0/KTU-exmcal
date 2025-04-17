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
  Button,
} from '@mui/material';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
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
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [studyLeave, setStudyLeave] = useState<{
    days: number;
    hours: number;
    minutes: number;
    currentExam: string;
    nextExam: string;
  } | null>(null);
  const [showStudyLeave, setShowStudyLeave] = useState(false);
  const [examInfo, setExamInfo] = useState<{
    firstExam: { name: string; code: string } | null;
    secondExam: { name: string; code: string } | null;
  }>({ firstExam: null, secondExam: null });
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);

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

  // Store semester and course selections in localStorage
  useEffect(() => {
    localStorage.setItem('currentSemester', semester.toString());
    localStorage.setItem('currentCourse', course);
  }, [semester, course]);

  // Update upcomingExams whenever exams change
  useEffect(() => {
    setUpcomingExams(getUpcomingExams());
  }, [exams]);

  const tileContent = ({ date, view }: CalendarTileProps) => {
    if (view !== 'month') return null;

    const examOnDate = exams.find(
      (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    console.log('Date:', format(date, 'yyyy-MM-dd'), 'Exam:', examOnDate); // Debug log

    return examOnDate ? (
      <div 
        className="exam-indicator" 
        style={{ // Add inline styles to ensure visibility
          backgroundColor: '#1976d2',
          padding: '4px',
          borderRadius: '4px',
          marginTop: '4px',
          width: '100%',
          cursor: 'default' // Make it clear this is not clickable
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

  // Handle date click with exam details
  const handleDateClick = (date: Date) => {
    if (!showStudyLeave) return; // Only allow selection when study leave is enabled
  
    // Find if there's an exam on the clicked date
    const examOnDate = exams.find(
      (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  
    if (selectedDates.length === 0) {
      setSelectedDates([date]);
      setStudyLeave(null); // Clear previous study leave details
      
      // Store exam info if available
      if (examOnDate) {
        setExamInfo(prevState => ({
          ...prevState,
          firstExam: {
            name: examOnDate.name,
            code: examOnDate.subjectCode
          }
        }));
      }
    } else if (selectedDates.length === 1) {
      const [firstDate] = selectedDates;
      const sortedDates = [firstDate, date].sort((a, b) => a.getTime() - b.getTime());
      const [currentExam, nextExam] = sortedDates;
  
      const days = differenceInDays(nextExam, currentExam);
      const hours = differenceInHours(nextExam, currentExam) % 24;
      const minutes = differenceInMinutes(nextExam, currentExam) % 60;
  
      // Store second exam info if available
      if (examOnDate) {
        setExamInfo(prevState => ({
          ...prevState,
          secondExam: {
            name: examOnDate.name,
            code: examOnDate.subjectCode
          }
        }));
      }
  
      setStudyLeave({
        days,
        hours,
        minutes,
        currentExam: format(currentExam, 'MMMM dd, yyyy HH:mm'),
        nextExam: format(nextExam, 'MMMM dd, yyyy HH:mm'),
      });
  
      setSelectedDates(sortedDates); // Keep the selected dates
    } else {
      setSelectedDates([date]); // Reset selection if more than two dates are clicked
      setStudyLeave(null); // Clear previous study leave details
      
      // Reset exam info and store first exam info if available
      if (examOnDate) {
        setExamInfo({
          firstExam: {
            name: examOnDate.name,
            code: examOnDate.subjectCode
          },
          secondExam: null
        });
      } else {
        setExamInfo({
          firstExam: null,
          secondExam: null
        });
      }
    }
  };
  
  // Updated the tileClassName function to differentiate the start and end dates with green and red shades.
  const tileClassName = ({ date }: { date: Date }) => {
    if (!showStudyLeave || selectedDates.length === 0) return '';
  
    const [start, end] = selectedDates;
    if (start && end) {
      if (date.getTime() === start.getTime()) {
        return 'start-date'; // Green shade for the start date
      }
      if (date.getTime() === end.getTime()) {
        return 'end-date'; // Red shade for the end date
      }
      if (date > start && date < end) {
        return 'shaded-date'; // Shade dates in between
      }
    }
  
    return '';
  };

  // Improved the toggle system for better user experience.
  const toggleStudyLeave = () => {
    setShowStudyLeave(!showStudyLeave);
    if (!showStudyLeave) {
      setSelectedDates([]); // Reset dates when hiding study leave
      setStudyLeave(null); // Clear study leave details
    }
  };

  // Removed the Countdown component and implemented a custom countdown logic.
  const calculateCountdown = (targetDate: Date) => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
  
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
  
    return { days, hours, minutes, seconds };
  };
  
  // Filter exams to get only upcoming ones (after current date)
  const getUpcomingExams = () => {
    const today = new Date();
    return exams
      .filter(exam => new Date(exam.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  // Ensure countdown is accurate from current date to the end date
  const CountdownDisplay: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const [countdown, setCountdown] = useState(calculateCountdown(targetDate));
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCountdown(calculateCountdown(targetDate));
      }, 1000);
  
      return () => clearInterval(interval);
    }, [targetDate]);
  
    return (
      <Typography variant="h6" color="primary" gutterBottom>
        Countdown: {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
      </Typography>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}> {/* Increased padding for mobile */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" gutterBottom>
          Exam Calendar
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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
          <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }}>
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
          {/* Updated study leave toggle button */}
          <Button
            variant="contained"
            color={showStudyLeave ? "error" : "primary"}
            onClick={() => {
              setShowStudyLeave(!showStudyLeave);
              if (!showStudyLeave) {
                setSelectedDates([]);
                setStudyLeave(null);
                alert("Select first exam date on the calendar");
              } else {
                setSelectedDates([]);
                setStudyLeave(null);
              }
            }}
            sx={{ 
              fontWeight: 'bold', 
              minWidth: { xs: '100%', sm: '200px' },
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              '&:hover': {
                cursor: 'pointer', 
                transform: 'scale(1.03)',
                transition: 'transform 0.2s ease'
              }
            }}
          >
            {showStudyLeave ? 'Exit Study Leave Mode' : 'Calculate Study Leave'}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Study leave details sidebar - using conditional render but preserving space */}
          <Box sx={{ 
            width: { xs: '100%', md: '300px' }, 
            mb: { xs: 2, md: 0 }, 
            display: 'flex',
            flexDirection: 'column'
          }}>
            {showStudyLeave && selectedDates.length > 0 ? (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Study Leave Details
                </Typography>
                
                {selectedDates.length === 1 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                      First Exam Selected:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(selectedDates[0], 'MMMM dd, yyyy')}
                    </Typography>
                    {examInfo.firstExam && (
                      <Typography variant="body2" gutterBottom>
                        {examInfo.firstExam.name} ({examInfo.firstExam.code})
                      </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, color: 'warning.main' }}>
                      Please select second exam date
                    </Typography>
                  </>
                )}
                
                {selectedDates.length === 2 && studyLeave && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                      First Exam:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(selectedDates[0], 'MMMM dd, yyyy')}
                    </Typography>
                    {examInfo.firstExam && (
                      <Typography variant="body2" gutterBottom>
                        {examInfo.firstExam.name} ({examInfo.firstExam.code})
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Second Exam:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {format(selectedDates[1], 'MMMM dd, yyyy')}
                    </Typography>
                    {examInfo.secondExam && (
                      <Typography variant="body2" gutterBottom>
                        {examInfo.secondExam.name} ({examInfo.secondExam.code})
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Study Leave:
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }} gutterBottom>
                      {studyLeave.days} days
                    </Typography>
                  </>
                )}
              </Paper>
            ) : showStudyLeave ? (
              // Empty placeholder to maintain layout
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Select an exam date to calculate study leave
                </Typography>
              </Paper>
            ) : null}
          </Box>

          {/* Calendar component with fixed width */}
          <Box sx={{ 
            flex: 1,
            minWidth: { xs: '100%', md: '450px' }, 
            '.react-calendar': {
              width: '100%',
              minHeight: '350px'
            }
          }}>
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileContent={tileContent}
              className="dark-calendar"
              minDate={new Date(2025, 0, 1)}  // January 1, 2025
              maxDate={new Date(2025, 11, 31)} // December 31, 2025
              minDetail="month" // This will hide the year view
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
            />
          </Box>

          {/* Right sidebar - always shows exam details or upcoming exams */}
          <Box sx={{ width: { xs: '100%', md: '300px' }, mt: { xs: 2, md: 0 } }}>
            {selectedExam && (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d', mb: 2 }}>
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
            )}
            {/* Always show upcoming exams section */}
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d' }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Exams
              </Typography>
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <Box key={exam.id} sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      {format(new Date(exam.date), 'MMMM dd, yyyy')} - {exam.name}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No upcoming exams found.</Typography>
              )}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CalendarComponent;