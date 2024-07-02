import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs, FieldValue } from '../../Config/Config';

const gradePoints = {
  'A+': 4.00,
  'A': 4.00,
  'A-': 3.67,
  'B+': 3.33,
  'B': 3.00,
  'B-': 2.67,
  'C+': 2.33,
  'C': 2.00,
  'C-': 1.67,
  'D+': 1.33,
  'D': 1.00,
  'F': 0.00,
  'I': 0.00 // Incomplete
};

const AssignSemesterResult = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [semester, setSemester] = useState('');
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [studentdata, setStudentData] = useState({});

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);

      try {
        const studentDoc = await fs.collection('students').doc(studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          setStudentData(studentData);
          const courseIds = studentData.currentCourses || [];

          const courseDataPromises = courseIds.map(async (courseId) => {
            const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
            if (assignCourseDoc.exists) {
              const assignCourseData = assignCourseDoc.data();
              const actualCourseId = assignCourseData.courseId;

              const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
              if (courseDoc.exists) {
                const courseData = courseDoc.data();
                const marksDoc = await fs.collection('studentsMarks').doc(courseId).get();
                let grade = 'No grade assigned';
                if (marksDoc.exists) {
                  const marksData = marksDoc.data();
                  const studentMarks = marksData.marksOfStudents.find(student => student.studentId === studentId);
                  if (studentMarks) {
                    grade = studentMarks.grade;
                  }
                }
                return {
                  courseId: actualCourseId,
                  courseName: courseData.name || 'Unknown Course',
                  creditHours: courseData.creditHours || 0,
                  grade: grade,
                };
              }
            }
            return null;
          });

          const courses = await Promise.all(courseDataPromises);
          setCurrentCourses(courses.filter(course => course !== null));
        } else {
          setError('Student data not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCreditHours = 0;

    currentCourses.forEach(course => {
      if (gradePoints[course.grade] !== undefined) {
        totalPoints += gradePoints[course.grade] * course.creditHours;
        totalCreditHours += parseInt(course.creditHours);
      }
    });

    const calculatedGpa = totalCreditHours > 0 ? (totalPoints / totalCreditHours).toFixed(2) : 'N/A';
    setGpa(calculatedGpa);
  };

  const allGradesAssigned = currentCourses.every(course => course.grade !== 'No grade assigned');

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setIsCodeValid(e.target.value === '112233');
  };

  const handleSaveResults = async () => {
    if (semester === '' || !isCodeValid) return;

    setLoading(true);
    setError(null);

    try {
      const studentDocRef = fs.collection('students').doc(studentId);

      await studentDocRef.update({
        completedCourses: [...currentCourses.map(course => course.courseId)],
        results: FieldValue.arrayUnion({ semester, gpa }),
        currentCourses: []
      });

      await Promise.all(
        currentCourses.map(course =>
          fs.collection('assignCourses').doc(course.courseId).delete()
        )
      );

      setCurrentCourses([]);
      setGpa(null);
      setSemester('');
      setCode('');
      setIsCodeValid(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='h-full w-full'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] uppercase rounded-2xl'>{studentdata.name}'s Information  </h2>
      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div>

          <div className='grid grid-cols-1 xsx:grid-cols-3 gap-x-[6px] gap-y-[15px] p-[8px]'>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Email:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.email}</div>
            </p>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Roll-Number:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.rollNumber}</div>
            </p>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Current Semster:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.semester}</div>
            </p>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Completed Courses:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.completedCourses.length}</div>
            </p>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Current Enrolled Courses:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.currentCourses.length}</div>
            </p>
            <p className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Student's Status:</div>
              <div className='text-3xl xsx:text-2xl '>{studentdata.status}</div>
            </p>
          </div>

          {currentCourses.length > 0 ? (
            <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
              <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Enrolled Courses:</h2>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-md text-gray-200 uppercase bg-gray-700">
                    <tr className='text-center'>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">Course Name</th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">Credit Hours</th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">Assigned Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCourses.map((course) => (
                      <tr key={course.courseId} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b  font-semibold text-lg'>
                        {/*<td>{course.courseId}</td>*/}
                        <th scope='row' className="px-6 py-4 font-bold whitespace-nowrap">{course.courseName}</th>
                        <td className="px-6 py-4 whitespace-nowrap">{course.creditHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><p className='p-[4px] text-lg bg-custom-blue text-white mx-auto font-bold rounded-lg my-[5px] w-[50%]'>{course.grade}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p></p>
          )}


          {currentCourses.length > 0 ? (
            <>
              {allGradesAssigned ? (
                <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                  <button onClick={calculateGPA} className="whitespace-nowrap lg:w-[30%]  w-[75%] mx-auto bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-lg py-[8px] font-semibold text-white rounded-xl">Calculate GPA</button>
                  {gpa !== null && (
                    <div className='mt-[15px] flex flex-col w-[90%] mx-auto overflow-x-auto'>

                      <div className='mx-auto flex w-[50%] lg:w-[30%] justify-center bg-custom-blue rounded-lg'>
                        <p className=' text-2xl text-white px-[10px] py-[5px]'>GPA:</p>
                        <p className='bg-white text-custom-blue m-[5px] rounded-2xl p-[5px]'>{gpa}</p>
                      </div>

                      <div className='mx-auto flex flex-col w-[90%] lg:w-[70%]'>
                        <label htmlFor="className" className="block text-lg font-medium text-gray-700">Semester Number:</label>
                        <select id="course" value={semester} onChange={(e) => setSemester(e.target.value)}
                          className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                          required >
                          <option value="">Select Semester Number</option>
                          {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                            <option className='bg-custom-blue text-white text-lg ' key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='mx-auto flex flex-col w-[90%] lg:w-[70%]'>
                        <label htmlFor="className" className="block text-lg font-medium text-gray-700">Enter Code To Confirm {studentdata.name}'s Result:</label>

                        <input type="text" value={code} onChange={handleCodeChange} placeholder='Enter Code to Submit the Compiled Result'
                          className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                        />

                      </div>
                      <button disabled={!isCodeValid} onClick={handleSaveResults}
                        className="whitespace-nowrap mt-[15px] lg:w-[30%] w-[75%] mx-auto bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-lg py-[8px] font-semibold text-white rounded-xl">
                        Save Results
                      </button>
                    </div>
                  )}
                </div>
              ) :
                (
                  <p className='text-xl text-white rounded-lg bg-red-800 my-[8px] whitespace-nowrap mx-[15px] lg:mx-[80px] overflow-x-auto uppercase p-[5px] text-center font-bold '>All courses Have to be Assigned a GRADE to enable GPA calculation</p>
                )
              }
            </> )   :
            (
              <p className='text-xl text-white rounded-lg bg-red-800 my-[8px] whitespace-nowrap mx-[15px] lg:mx-[80px] overflow-x-auto uppercase p-[5px] text-center font-bold '>No Enrolled Courses Were found</p>
            )}

        </div>
      )}
    </div>
  );
};

export default AssignSemesterResult;
