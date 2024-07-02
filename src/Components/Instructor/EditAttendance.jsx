import React, { useState, useEffect } from 'react';
import { fs } from '../../Config/Config';
import StudentAttendance from './StudentAttendance';

const EditAttendance = ({ assignCourseId, students, attendanceDates, latestAttendance }) => {
  const [viewDate, setViewDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latestAttendance) {
      setViewDate(latestAttendance.date);
      setAttendance(latestAttendance.records);
    }
  }, [latestAttendance]);

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
    <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-200 rounded-xl overflow-x-auto'>
      <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Update Attendance</h2>

      <label className="block text-lg  font-medium text-gray-700">
        Select Date:
      </label>
      <select value={viewDate} onChange={handleViewDateChange}
        className='my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md'
      >
        <option value="">Select a date</option>
        {attendanceDates.map(date => (
          <option key={date} value={date}>{date}</option>
        ))}
      </select>
      {viewDate && (
        <div class="relative mt-[15px] overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-md text-gray-200 uppercase bg-gray-700">
              <tr className='text-center'>
                <th scope="col" class="px-6 py-3 whitespace-nowrap">Student's Name</th>
                <th scope="col" class="px-6 py-3 whitespace-nowrap">Attendance Status</th>
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
          <button onClick={handleSaveAttendance}
            className='my-[15px] py-[8px] w-[180px] ml-[10px] justify-center rounded-md bg-blue-950 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'
          >Update Attendance
          </button>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default EditAttendance;
