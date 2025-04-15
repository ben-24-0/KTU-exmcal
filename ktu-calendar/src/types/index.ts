export interface Exam {
  id: string;
  name: string;
  subjectCode: string;
  date: string;
  time: string;
  venue?: string;
  semester: number;
}

export interface StudyLeave {
  startDate: string;
  endDate: string;
  days: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
} 