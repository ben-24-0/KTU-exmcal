import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const addSampleExams = async () => {
  try {
    const examsCollection = collection(db, 'exams');
    
    const sampleExams = [
      {
        name: 'Computer Networks',
        subjectCode: 'CST301',
        date: '2024-04-15',
        time: '09:30',
        venue: 'Main Block Room 201',
        semester: 5
      },
      {
        name: 'Database Management',
        subjectCode: 'CST303',
        date: '2024-04-17',
        time: '09:30',
        venue: 'Main Block Room 202',
        semester: 5
      },
      {
        name: 'Operating Systems',
        subjectCode: 'CST305',
        date: '2024-04-19',
        time: '09:30',
        venue: 'Main Block Room 203',
        semester: 5
      }
    ];

    for (const exam of sampleExams) {
      await addDoc(examsCollection, exam);
    }

    console.log('Sample exams added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample exams:', error);
    throw error;
  }
}; 