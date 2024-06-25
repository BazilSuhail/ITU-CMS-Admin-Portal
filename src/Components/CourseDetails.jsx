import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import EditAttendance from './EditAttendance';

const CourseDetails = () => {
  const { assignCourseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceDates, setAttendanceDates] = useState([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const assignmentDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
        if (assignmentDoc.exists) {
          const assignmentData = assignmentDoc.data();

          const courseDoc = await fs.collection('courses').doc(assignmentData.courseId).get();
          
          setCourseData({
            courseName: courseDoc.data().name,
            courseId: assignmentData.courseId,
          });

          // Fetch students enrolled in this course
          const studentsSnapshot = await fs.collection('students').get();
          const studentsList = studentsSnapshot.docs
            .filter(doc => doc.data().currentCourses.includes(assignCourseId))
            .map(doc => ({
              id: doc.id,
              name: doc.data().name,
            }));

          setStudents(studentsList);

          // Fetch attendance dates
          const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
          const attendanceDoc = await attendanceDocRef.get();

          if (attendanceDoc.exists) {
            const attendanceData = attendanceDoc.data().attendances;
            setAttendanceDates(attendanceData.map(record => record.date));
          }
        } else {
          setError('No assignment data found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [assignCourseId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        await attendanceDocRef.update({
          attendances: [...attendanceDoc.data().attendances, {
            date: selectedDate,
            records: attendance,
          }],
        });
      } else {
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: selectedDate,
              records: attendance,
            },
          ],
        });
      }

      // Reset form
      setSelectedDate('');
      setAttendance({});
    } catch (error) {
      setError(error.message);
    }
  };

  const isSaveEnabled = () => {
    if (!selectedDate) return false;
    if (students.length === 0) return false;
    for (const student of students) {
      if (!attendance.hasOwnProperty(student.id)) return false;
    }
    return true;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Course Details</h2>
      {courseData && (
        <div>
          <p><strong>Course Name:</strong> {courseData.courseName}</p>
        </div>
      )}
      <h3>Mark Attendance</h3>
      <label>
        Select Date:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentAttendance
              key={student.id}
              student={student}
              attendance={attendance}
              onAttendanceChange={handleAttendanceChange}
            />
          ))}
        </tbody>
      </table>
      <button onClick={handleSaveAttendance} disabled={!isSaveEnabled()}>
        Save Attendance
      </button>

      <EditAttendance 
        assignCourseId={assignCourseId} 
        students={students} 
        attendanceDates={attendanceDates} 
      />
    </div>
  );
};

export default CourseDetails;
