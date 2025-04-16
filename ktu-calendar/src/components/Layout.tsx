import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { differenceInDays, parseISO, format } from 'date-fns';

interface LayoutProps {
  isAdmin: boolean;
}

export default function Layout({ isAdmin }: LayoutProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [daysBetween, setDaysBetween] = useState<number | null>(null);
  const [nextExam, setNextExam] = useState<any>(null);
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number}>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const handleCalculate = () => {
    if (date1 && date2) {
      const days = differenceInDays(parseISO(date2), parseISO(date1));
      setDaysBetween(days);
    }
  };

  // Improved next exam fetching with semester and course filtering
  useEffect(() => {
    const fetchNextExam = async () => {
      try {
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        
        console.log("Fetching exams after:", formattedToday);
        
        // Get current semester preference from localStorage if available
        const currentSemester = localStorage.getItem('currentSemester') || 4; // Default to semester 4
        const currentCourse = localStorage.getItem('currentCourse') || 'CSE'; // Default to CSE
        
        console.log(`Filtering for semester ${currentSemester} and course ${currentCourse}`);
        
        // Query with semester and course filters
        const q = query(
          collection(db, 'exams'),
          where('date', '>=', formattedToday),
          where('semester', '==', Number(currentSemester)),
          where('course', '==', currentCourse),
          orderBy('date', 'asc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const examData = querySnapshot.docs[0].data();
          console.log("Found next exam:", examData);
          setNextExam({
            id: querySnapshot.docs[0].id,
            ...examData
          });
        } else {
          console.log("No upcoming exams found");
          // Try without semester/course filter as fallback
          const fallbackQuery = query(
            collection(db, 'exams'),
            where('date', '>=', formattedToday),
            orderBy('date', 'asc'),
            limit(1)
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          if (!fallbackSnapshot.empty) {
            const fallbackData = fallbackSnapshot.docs[0].data();
            console.log("Found fallback exam:", fallbackData);
            setNextExam({
              id: fallbackSnapshot.docs[0].id,
              ...fallbackData
            });
          }
        }
      } catch (error) {
        console.error('Error fetching next exam:', error);
      }
    };
    
    fetchNextExam();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', fetchNextExam);
    
    return () => {
      window.removeEventListener('storage', fetchNextExam);
    };
  }, []);

  // Simplified countdown calculation
  useEffect(() => {
    // Skip if there's no next exam
    if (!nextExam || !nextExam.date) return;
    
    // Function to get days between today and exam date
    const getDaysUntilExam = () => {
      try {
        // Get today's date (reset to midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Parse exam date (YYYY-MM-DD format)
        const parts = nextExam.date.split('-');
        const examDate = new Date(
          parseInt(parts[0]), // year
          parseInt(parts[1]) - 1, // month (0-indexed)
          parseInt(parts[2]) // day
        );
        examDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log("Today:", today.toISOString());
        console.log("Exam date:", examDate.toISOString());
        console.log("Days until exam:", diffDays);
        
        return {
          days: diffDays,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      } catch (error) {
        console.error("Error calculating countdown:", error);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };
    
    // Set initial countdown
    setCountdown(getDaysUntilExam());
    
    // Update countdown daily at midnight
    const timer = setInterval(() => {
      setCountdown(getDaysUntilExam());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [nextExam]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            KTU Exam Calendar
          </Typography>
          
          {nextExam && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 2,
              flexDirection: { xs: 'column', sm: 'row' }, 
              textAlign: { xs: 'right', sm: 'left' }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: { xs: 0, sm: 1 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}
              >
                Next Exam:
              </Typography>
              <Typography 
                variant="body2" 
                color="warning.main"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                }}
              >
                {countdown.days}d
              </Typography>
            </Box>
          )}
          
          {isAdmin && (
            <Typography
              variant="button"
              sx={{ cursor: 'pointer', ml: 2 }}
              onClick={() => navigate('/admin')}
            >
              Admin
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8 }} // Adjusted for AppBar height
      >
        <Outlet />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Study Leave Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Exam Date"
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Second Exam Date"
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {daysBetween !== null && (
              <Typography>
                Days between exams: {daysBetween} day(s)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={handleCalculate} variant="contained">
            Calculate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}