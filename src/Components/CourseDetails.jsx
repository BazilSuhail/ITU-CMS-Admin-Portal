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
          const classDoc = await fs.collection('classes').doc(assignmentData.classId).get();
          
          const classData = classDoc.data();
          const studentsList = classData.studentsOfClass || [];

          // Fetch student names
          const studentsData = await Promise.all(studentsList.map(async studentId => {
            const studentDoc = await fs.collection('students').doc(studentId).get();
            return {
              id: studentDoc.id,
              name: studentDoc.data().name,
            };
          }));

          setStudents(studentsData);

          setCourseData({
            courseName: courseDoc.data().name,
            className: classDoc.data().name,
            courseId: assignmentData.courseId,
            classId: assignmentData.classId,
          });

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
          <p><strong>Class Name:</strong> {courseData.className}</p>
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
      <button onClick={handleSaveAttendance}>Save Attendance</button>

      <EditAttendance 
        assignCourseId={assignCourseId} 
        students={students} 
        attendanceDates={attendanceDates} 
      />
    </div>
  );
};

export default CourseDetails;
