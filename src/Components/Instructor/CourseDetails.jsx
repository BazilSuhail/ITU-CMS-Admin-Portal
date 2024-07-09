import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs } from '../../Config/Config';
import StudentAttendance from './StudentAttendance';
import EditAttendance from './EditAttendance';
import { Circles } from 'react-loader-spinner';


const CourseDetails = () => {
  const { assignCourseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [latestAttendance, setLatestAttendance] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editForm, seteditForm] = useState(false);
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

          // Fetch attendance dates and the latest attendance
          const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
          const attendanceDoc = await attendanceDocRef.get();

          if (attendanceDoc.exists) {
            const attendanceData = attendanceDoc.data().attendances;
            setAttendanceDates(attendanceData.map(record => record.date));

            if (attendanceData.length > 0) {
              const latest = attendanceData.reduce((latestRecord, currentRecord) => {
                return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
              });
              setLatestAttendance(latest);
            }
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
    setFormLoading(true);
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

      // Reset form and refresh latest attendance
      setSelectedDate('');
      setAttendance({});

      const updatedAttendanceDoc = await attendanceDocRef.get();
      if (updatedAttendanceDoc.exists) {
        const updatedAttendanceData = updatedAttendanceDoc.data().attendances;
        const latest = updatedAttendanceData.reduce((latestRecord, currentRecord) => {
          return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
        });
        setLatestAttendance(latest);
        setAttendanceDates(updatedAttendanceData.map(record => record.date));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
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

  return (
    <div>
      {loading ? (
        <div className='w-screen h-[calc(98vh-195px)] flex flex-col justify-center items-center'>
          <Circles
            height="60"
            width="60"
            color="rgb(0, 63, 146)"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className='h-full w-full flex flex-col'>
          {courseData && (
            <>
              <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>"{courseData.courseName}" Attendance</h2>
              <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

            </>
          )}

          {formLoading ? (
            <p>Loading...</p>
          ) : (
            <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-200 rounded-xl overflow-x-auto'>
              <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Mark Attendance</h2>

              <label className="block text-lg  font-medium text-gray-700">
                Select Date:
              </label>
              <input
                type="date"
                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
              <div className="relative mt-[15px] overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-md text-gray-200 uppercase bg-gray-700">
                    <tr className='text-center'>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">Student's Name</th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">Attendance Status</th>
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
              </div>
              <button onClick={handleSaveAttendance}
                className='my-[15px] py-[8px] w-[180px]  mr-auto justify-center rounded-md bg-blue-950 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'
                disabled={!isSaveEnabled()}>
                Save Attendance
              </button>
            </div>
          )}

          <button onClick={() => seteditForm(!editForm)}
            className='shadow-custom my-[55px]-light py-[8px] w-[385px] lg:w-[55vw] mx-auto rounded-xl bg-green-900 text-2xl font-bold hover:text-green-900 hover:bg-white hover:shadow-custom-light text-white'
          >
            {editForm ? 'Close Review' : 'Show Attendance Records'}
          </button>
          {
            editForm && (
              <EditAttendance
                assignCourseId={assignCourseId}
                students={students}
                attendanceDates={attendanceDates}
                latestAttendance={latestAttendance}
              />
            )
          }
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
