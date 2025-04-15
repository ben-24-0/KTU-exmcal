import React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import { format, parseISO, differenceInDays } from 'date-fns';
import { collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Exam } from '../types';
import 'react-calendar/dist/Calendar.css';

type CalendarTileProps = {
  date: Date;
  view: string;
};

const CalendarComponent: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [semester, setSemester] = useState<number>(1);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const q = query(
          collection(db, 'exams'),
          where('semester', '==', semester)
        );
        const querySnapshot = await getDocs(q);
        const examData: Exam[] = [];
        
        if (querySnapshot.empty) {
          console.log('No exams found for semester:', semester);
          setExams([]);
          return;
        }

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
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
        
        if (examData.length === 0) {
          setError('No valid exams found for this semester. Please check the exam data format.');
          return;
        }

        // Sort exams by date
        setExams(examData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      } catch (err) {
        console.error('Error fetching exams:', err);
        if (err instanceof Error) {
          setError(`Failed to load exams: ${err.message}`);
        } else {
          setError('Failed to load exams. Please check your internet connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [semester]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'calendar' | 'list' | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const tileContent = ({ date, view }: CalendarTileProps) => {
    if (view !== 'month') return null;

    const examOnDate = exams.find(
      (exam) => format(new Date(exam.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return examOnDate ? (
      <div className="exam-indicator">
        <Typography variant="caption" component="div" noWrap>
          {examOnDate.name}
        </Typography>
        <Typography variant="caption" component="div" color="textSecondary" noWrap>
          {examOnDate.time}
        </Typography>
      </div>
    ) : null;
  };

  const calculateStudyLeave = (currentExam: Exam, nextExam: Exam): number => {
    const currentDate = new Date(currentExam.date);
    const nextDate = new Date(nextExam.date);
    const diffTime = nextDate.getTime() - currentDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setDate(value);
                  }
                }}
                value={date}
                tileContent={tileContent}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <Card key={exam.id}>
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
                      {exam.venue && (
                        <Typography>Venue: {exam.venue}</Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Alert severity="info">No exams scheduled</Alert>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CalendarComponent; 