import React, { useState } from 'react';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';

const EditAttendance = ({ assignCourseId, students, attendanceDates }) => {
  const [viewDate, setViewDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  const handleViewDateChange = async (e) => {
    const date = e.target.value;
    setViewDate(date);

    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        const attendanceData = attendanceDoc.data().attendances;
        const record = attendanceData.find(record => record.date === date);
        setAttendance(record ? record.records : {});
      }
    } catch (error) {
      setError(error.message);
    }
  };

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
        const updatedAttendances = attendanceDoc.data().attendances.map(record => 
          record.date === viewDate ? { date: viewDate, records: attendance } : record
        );
        await attendanceDocRef.update({ attendances: updatedAttendances });
      } else {
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: viewDate,
              records: attendance,
            },
          ],
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h3>View/Edit Attendance</h3>
      <label>
        Select Date:
        <select value={viewDate} onChange={handleViewDateChange}>
          <option value="">Select a date</option>
          {attendanceDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </label>
      {viewDate && (
        <div>
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
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default EditAttendance;
