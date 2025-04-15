import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const removeAllExams = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'exams'));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('All exams removed successfully!');
    return true;
  } catch (error) {
    console.error('Error removing exams:', error);
    return false;
  }
};

export const addSampleExams = async () => {
  // CSE S8 Exams
  const cseS8Exams = [
    {
      name: "Distributed Computing",
      subjectCode: "CST402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "CSE"
    },
    {
      name: "Program Elective III",
      subjectCode: "CSTXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "CSE"
    },
    {
      name: "Program Elective IV",
      subjectCode: "CSTXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "CSE"
    },
    {
      name: "Program Elective V",
      subjectCode: "CSTXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "CSE"
    }
  ];

  // CSE S6 Exams
  const cseS6Exams = [
    {
      name: "Compiler Design",
      subjectCode: "CST302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "CSE"
    },
    {
      name: "Computer Graphics and Image Processing",
      subjectCode: "CST304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "CSE"
    },
    {
      name: "Algorithm Analysis and Design",
      subjectCode: "CST306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "CSE"
    },
    {
      name: "Program Elective I",
      subjectCode: "CSTXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "CSE"
    },
    {
      name: "Industrial Economics and Foreign Trade",
      subjectCode: "HUT300",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "CSE"
    },
    {
      name: "Comprehensive Course Work",
      subjectCode: "CST308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "CSE"
    }
  ];

  // CSE S4 Exams
  const cseS4Exams = [
    {
      name: "Graph Theory",
      subjectCode: "MAT206",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "CSE"
    },
    {
      name: "Computer Organization and Architecture",
      subjectCode: "CST202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "CSE"
    },
    {
      name: "Database Management Systems",
      subjectCode: "CST204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "CSE"
    },
    {
      name: "Design Engineering/Professional Ethics",
      subjectCode: "EST200/HUT200",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "CSE"
    },
    {
      name: "Constitution of India",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "CSE"
    },
    {
      name: "Operating Systems",
      subjectCode: "CST206",
      date: "2025-05-23",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "CSE"
    }
  ];

  // EEE S4 Exams (Updated)
  const eeeS4Exams = [
    {
      name: "Mathematics",
      subjectCode: "MAT204",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "EEE"
    },
    {
      name: "DC Machines and Transformers",
      subjectCode: "EET202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "EEE"
    },
    {
      name: "Electromagnetic Theory",
      subjectCode: "EET204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "EEE"
    },
    {
      name: "Digital Electronics",
      subjectCode: "EET206",
      date: "2025-05-14",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "EEE"
    },
    {
      name: "Design Engineering/Professional Ethics",
      subjectCode: "HUT200/MCN202",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "EEE"
    },
    {
      name: "Constitution of India",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "EEE"
    }
  ];

  // EEE S6 Exams
  const eeeS6Exams = [
    {
      name: "Linear Control Systems",
      subjectCode: "EET302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "EEE"
    },
    {
      name: "Power System II",
      subjectCode: "EET304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "EEE"
    },
    {
      name: "Power Electronics",
      subjectCode: "EET306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "EEE"
    },
    {
      name: "Program Elective I",
      subjectCode: "EETXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "EEE"
    },
    {
      name: "Industrial Economics and Foreign Trade/Management for Engineers",
      subjectCode: "HUT300/HUT310",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "EEE"
    },
    {
      name: "Comprehensive Course Work",
      subjectCode: "EET308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "EEE"
    }
  ];

  // EEE S8 Exams
  const eeeS8Exams = [
    {
      name: "Embedded Systems",
      subjectCode: "EET402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "EEE"
    },
    {
      name: "Program Elective III",
      subjectCode: "EETXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "EEE"
    },
    {
      name: "Program Elective IV",
      subjectCode: "EETXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "EEE"
    },
    {
      name: "Program Elective V",
      subjectCode: "EETXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "EEE"
    }
  ];

  // MECH S4 Exams
  const mechS4Exams = [
    {
      name: "Mathematics",
      subjectCode: "MAT202",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "MECH"
    },
    {
      name: "Thermodynamics",
      subjectCode: "MET202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "MECH"
    },
    {
      name: "Manufacturing Processes",
      subjectCode: "MET204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "MECH"
    },
    {
      name: "Fluid Mechanics",
      subjectCode: "MET206",
      date: "2025-05-14",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "MECH"
    },
    {
      name: "Design Engineering/Professional Ethics",
      subjectCode: "EST200/HUT200",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "MECH"
    },
    {
      name: "Constitution of India",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "MECH"
    }
  ];

  // MECH S6 Exams
  const mechS6Exams = [
    {
      name: "Heat and Mass Transfer",
      subjectCode: "MET302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "MECH"
    },
    {
      name: "Dynamics of Machinery",
      subjectCode: "MET304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "MECH"
    },
    {
      name: "Advanced Manufacturing Engineering",
      subjectCode: "MET306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "MECH"
    },
    {
      name: "Program Elective I",
      subjectCode: "METXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "MECH"
    },
    {
      name: "Industrial Economics and Foreign Trade/Management for Engineers",
      subjectCode: "HUT300/HUT310",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "MECH"
    },
    {
      name: "Comprehensive Course Work",
      subjectCode: "MET308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "MECH"
    }
  ];

  // MECH S8 Exams
  const mechS8Exams = [
    {
      name: "Mechatronics",
      subjectCode: "MET402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "MECH"
    },
    {
      name: "Program Elective III",
      subjectCode: "METXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "MECH"
    },
    {
      name: "Program Elective IV",
      subjectCode: "METXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "MECH"
    },
    {
      name: "Program Elective V",
      subjectCode: "METXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "MECH"
    }
  ];

  const civilS4Exams = [
    {
      name: "MATHS",
      subjectCode: "MAT202",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "Civil"
    },
    {
      name: "GEOLOGY",
      subjectCode: "CET202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "Civil"
    },
    {
      name: "GT-1",
      subjectCode: "CET204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "Civil"
    },
    {
      name: "TE",
      subjectCode: "CET206",
      date: "2025-05-14",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "Civil"
    },
    {
      name: "DE/PE",
      subjectCode: "EST200/HUT200",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "Civil"
    },
    {
      name: "COI",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "Civil"
    }
  ];
  
  const civilS8Exams = [
    {
      name: "QSV",
      subjectCode: "CET402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "Civil"
    },
    {
      name: "PRGM ELECTIVE-II",
      subjectCode: "CETXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "Civil"
    },
    {
      name: "PRGM ELECTIVE-IV",
      subjectCode: "CETXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "Civil"
    },
    {
      name: "PRGM ELECTIVE-V",
      subjectCode: "CETXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "Civil"
    }
  ];
  

  const civilS6Exams = [
    {
      name: "SA-2",
      subjectCode: "CET302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "Civil"
    },
    {
      name: "ENVIRONMENTAL ENG.",
      subjectCode: "CET304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "Civil"
    },
    {
      name: "DHS",
      subjectCode: "CET306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "Civil"
    },
    {
      name: "PRGM ELECTIVE-I",
      subjectCode: "CETXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "Civil"
    },
    {
      name: "IEFT",
      subjectCode: "HUT300",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "Civil"
    },
    {
      name: "COMPREHENSIVE",
      subjectCode: "CET308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "Civil"
    }
  ];

  // AI&ML S4 Exams
  const aimlS4Exams = [
    {
      name: "Mathematics for Machine Learning",
      subjectCode: "MAT216",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "AI&ML"
    },
    {
      name: "Computer Organization and Architecture",
      subjectCode: "CST202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "AI&ML"
    },
    {
      name: "Database Management Systems",
      subjectCode: "CST204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "AI&ML"
    },
    {
      name: "Operating Systems",
      subjectCode: "CST206",
      date: "2025-05-23",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "AI&ML"
    },
    {
      name: "Design Engineering/Professional Ethics",
      subjectCode: "EST200/HUT200",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "AI&ML"
    },
    {
      name: "Constitution of India",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "AI&ML"
    }
  ];

  // AI&ML S6 Exams
  const aimlS6Exams = [
    {
      name: "Natural Language Processing",
      subjectCode: "AMT302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "AI&ML"
    },
    {
      name: "Reinforcement and Intelligent Systems",
      subjectCode: "AIT304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "AI&ML"
    },
    {
      name: "Algorithm Analysis and Design",
      subjectCode: "CST306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "AI&ML"
    },
    {
      name: "Program Elective I",
      subjectCode: "CMTXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "AI&ML"
    },
    {
      name: "Industrial Economics and Foreign Trade",
      subjectCode: "HUT300",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "AI&ML"
    },
    {
      name: "Comprehensive Course Work",
      subjectCode: "CMT308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "AI&ML"
    }
  ];

  // AI&ML S8 Exams
  const aimlS8Exams = [
    {
      name: "Internet of Things",
      subjectCode: "CMT402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "AI&ML"
    },
    {
      name: "Program Elective III",
      subjectCode: "CMTXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "AI&ML"
    },
    {
      name: "Program Elective IV",
      subjectCode: "CMTXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "AI&ML"
    },
    {
      name: "Program Elective V",
      subjectCode: "CMTXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "AI&ML"
    }
  ];

  // EC S4 Exams
  const ecS4Exams = [
    {
      name: "MATHS",
      subjectCode: "MAT204",
      date: "2025-04-29",
      time: "9:30 AM",
      semester: 4,
      slot: "A",
      course: "ECE"
    },
    {
      name: "AC",
      subjectCode: "ECT202",
      date: "2025-05-05",
      time: "9:30 AM",
      semester: 4,
      slot: "B",
      course: "ECE"
    },
    {
      name: "SS",
      subjectCode: "ECT204",
      date: "2025-05-09",
      time: "9:30 AM",
      semester: 4,
      slot: "C",
      course: "ECE"
    },
    {
      name: "CAM",
      subjectCode: "ECT206",
      date: "2025-05-14",
      time: "9:30 AM",
      semester: 4,
      slot: "D",
      course: "ECE"
    },
    {
      name: "DE/PE",
      subjectCode: "EST200/HUT200",
      date: "2025-05-17",
      time: "9:30 AM",
      semester: 4,
      slot: "E",
      course: "ECE"
    },
    {
      name: "COI",
      subjectCode: "MCN202",
      date: "2025-05-21",
      time: "9:30 AM",
      semester: 4,
      slot: "F",
      course: "ECE"
    }
  ];

  // EC S6 Exams
  const ecS6Exams = [
    {
      name: "EM",
      subjectCode: "ECT302",
      date: "2025-04-25",
      time: "9:30 AM",
      semester: 6,
      slot: "A",
      course: "ECE"
    },
    {
      name: "VLSI CIRCUIT DESIGN",
      subjectCode: "ECT304",
      date: "2025-05-02",
      time: "9:30 AM",
      semester: 6,
      slot: "B",
      course: "ECE"
    },
    {
      name: "ITC",
      subjectCode: "ECT306",
      date: "2025-05-08",
      time: "9:30 AM",
      semester: 6,
      slot: "C",
      course: "ECE"
    },
    {
      name: "PRGM ELECTIVE-I",
      subjectCode: "ECTXXX",
      date: "2025-05-13",
      time: "9:30 AM",
      semester: 6,
      slot: "D",
      course: "ECE"
    },
    {
      name: "IEFT/MFE",
      subjectCode: "HUT300/HUT310",
      date: "2025-05-16",
      time: "9:30 AM",
      semester: 6,
      slot: "E",
      course: "ECE"
    },
    {
      name: "COMPREHENSIVE",
      subjectCode: "ECT308",
      date: "2025-05-20",
      time: "9:30 AM",
      semester: 6,
      slot: "F",
      course: "ECE"
    }
  ];

  // EC S8 Exams
  const ecS8Exams = [
    {
      name: "WC",
      subjectCode: "ECT402",
      date: "2025-04-22",
      time: "9:30 AM",
      semester: 8,
      slot: "A",
      course: "ECE"
    },
    {
      name: "PRGM ELECTIVE-III",
      subjectCode: "ECTXXX",
      date: "2025-04-24",
      time: "9:30 AM",
      semester: 8,
      slot: "B",
      course: "ECE"
    },
    {
      name: "PRGM ELECTIVE-IV",
      subjectCode: "ECTXXX",
      date: "2025-04-28",
      time: "9:30 AM",
      semester: 8,
      slot: "C",
      course: "ECE"
    },
    {
      name: "PRGM ELECTIVE-V",
      subjectCode: "ECTXXX",
      date: "2025-04-30",
      time: "9:30 AM",
      semester: 8,
      slot: "D",
      course: "ECE"
    }
  ];
  
  
  const allExams = [
    ...cseS8Exams, 
    ...cseS6Exams, 
    ...cseS4Exams, 
    ...eeeS4Exams, 
    ...eeeS6Exams, 
    ...eeeS8Exams,
    ...mechS4Exams,
    ...mechS6Exams,
    ...mechS8Exams,
    ...aimlS4Exams,
    ...aimlS6Exams,
    ...aimlS8Exams,
    ...civilS4Exams,
    ...civilS6Exams,
    ...civilS8Exams,
    ...ecS4Exams,
    ...ecS6Exams,
    ...ecS8Exams
  ];

  try {
    for (const exam of allExams) {
      await addDoc(collection(db, 'exams'), exam);
    }
    console.log('Sample exams added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample exams:', error);
    return false;
  }
}; 