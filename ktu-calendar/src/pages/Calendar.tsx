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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  const [tableSortConfig, setTableSortConfig] = useState<{
    key: 'date' | 'subjectCode' | 'name';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'asc' });

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

    return examOnDate ? (
      <div
        className="exam-indicator"
        style={{
          backgroundColor: '#1976d2',
          padding: '8px',
          borderRadius: '4px',
          marginTop: '4px',
          width: '100%',
          cursor: 'pointer',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: '#fff',
            fontSize: { xs: '0.9rem', sm: '0.85rem' },
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

  const handleDateClick = (date: Date) => {
    if (!showStudyLeave) return;

    const examOnDate = exams.find(
      (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (selectedDates.length === 0) {
      setSelectedDates([date]);
      setStudyLeave(null);

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

      setSelectedDates(sortedDates);
    } else {
      setSelectedDates([date]);
      setStudyLeave(null);

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

  const tileClassName = ({ date }: { date: Date }) => {
    if (!showStudyLeave || selectedDates.length === 0) return '';

    const [start, end] = selectedDates;
    if (start && end) {
      if (date.getTime() === start.getTime()) {
        return 'start-date';
      }
      if (date.getTime() === end.getTime()) {
        return 'end-date';
      }
      if (date > start && date < end) {
        return 'shaded-date';
      }
    }

    return '';
  };

  const toggleStudyLeave = () => {
    setShowStudyLeave(!showStudyLeave);
    if (!showStudyLeave) {
      setSelectedDates([]);
      setStudyLeave(null);
    }
  };

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

  const getUpcomingExams = () => {
    const today = new Date();
    return exams
      .filter(exam => new Date(exam.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const sortedExams = [...exams].sort((a, b) => {
    const aValue = tableSortConfig.key === 'date' ? new Date(a[tableSortConfig.key]).getTime() : a[tableSortConfig.key];
    const bValue = tableSortConfig.key === 'date' ? new Date(b[tableSortConfig.key]).getTime() : b[tableSortConfig.key];

    if (tableSortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (key: 'date' | 'subjectCode' | 'name') => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
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
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(auto, 800px) 300px' },
          gap: 3,
          alignItems: 'flex-start'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {showStudyLeave && (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d', mb: 2 }}>
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
            )}
            <Box sx={{
              '.react-calendar': {
                width: '100%',
                minHeight: '400px',
                '& button': {
                  minHeight: '50px',
                  padding: '8px',
                  fontSize: '1rem',
                  '&:enabled:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                },
                '& .react-calendar__month-view__days__day': {
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                '& .exam-indicator': {
                  marginTop: '4px'
                }
              }
            }}>
              <Calendar
                onChange={handleDateChange}
                value={date}
                tileContent={tileContent}
                className="dark-calendar"
                minDate={new Date(2025, 0, 1)}
                maxDate={new Date(2025, 11, 31)}
                minDetail="month"
                onClickDay={handleDateClick}
                tileClassName={tileClassName}
              />
            </Box>
            {selectedExam && (
              <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d' }}>
                <Typography variant="h6" gutterBottom>
                  Selected Exam Details
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>
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
                </Box>
              </Paper>
            )}
          </Box>
          <Box sx={{
            position: { md: 'sticky' },
            top: { md: '1rem' },
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}>
            <Paper elevation={3} sx={{
              p: 2,
              backgroundColor: '#2d2d2d',
              height: 'fit-content'
            }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Exams
              </Typography>
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <Box key={exam.id} sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:last-child': { mb: 0 }
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {format(new Date(exam.date), 'MMMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {exam.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exam.subjectCode}
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
      <Box sx={{ mt: 3, width: '100%' }}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#2d2d2d' }}>
          <Typography variant="h6" gutterBottom>
            Complete Exam Timetable
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{
              minWidth: { xs: '100%', sm: 650 },
              '& th, & td': {
                color: 'white',
                p: { xs: 1.5, sm: 2 },
                borderColor: 'rgba(255,255,255,0.1)'
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={() => handleSort('date')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Date {tableSortConfig.key === 'date' && (tableSortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('subjectCode')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Course Code {tableSortConfig.key === 'subjectCode' && (tableSortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('name')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Course Name {tableSortConfig.key === 'name' && (tableSortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{format(new Date(exam.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{exam.subjectCode}</TableCell>
                    <TableCell>{exam.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CalendarComponent;