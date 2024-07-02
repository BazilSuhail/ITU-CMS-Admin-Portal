import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs, FieldValue } from '../../Config/Config';

const ApplicationsForWithdraw = () => {
    const { studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [processing, setProcessing] = useState({});

    const [studentdata, setStudentData] = useState({});

    useEffect(() => {
        const fetchWithdrawRequests = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentDoc = await fs.collection('students').doc(studentId).get();
                if (studentDoc.exists) {
                    const studentData = studentDoc.data();
                    setStudentData(studentData);
                    const withdrawCourseIds = studentData.withdrawCourses || [];

                    const courseDataPromises = withdrawCourseIds.map(async (courseId) => {
                        const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                        if (assignCourseDoc.exists) {
                            const assignCourseData = assignCourseDoc.data();
                            const { instructorId, courseId: actualCourseId, classId } = assignCourseData;

                            const [courseDoc, instructorDoc, classDoc] = await Promise.all([
                                fs.collection('courses').doc(actualCourseId).get(),
                                fs.collection('instructors').doc(instructorId).get(),
                                fs.collection('classes').doc(classId).get()
                            ]);

                            return {
                                assignCourseId: courseId,
                                courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                                instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                                className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                            };
                        }
                        return null;
                    });

                    const courses = await Promise.all(courseDataPromises);
                    setWithdrawRequests(courses.filter(course => course !== null));
                } else {
                    setError('Student data not found');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawRequests();
    }, [studentId]);

    const handleRemoveApplication = async (assignCourseId) => {
        try {
            const studentDocRef = fs.collection('students').doc(studentId);
            await studentDocRef.update({
                withdrawCourses: FieldValue.arrayRemove(assignCourseId),
            });

            setWithdrawRequests((prev) => prev.filter(course => course.assignCourseId !== assignCourseId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleWithdraw = async (assignCourseId) => {
        try {
            setProcessing((prev) => ({ ...prev, [assignCourseId]: true }));

            const studentDocRef = fs.collection('students').doc(studentId);
            await studentDocRef.update({
                currentCourses: FieldValue.arrayRemove(assignCourseId),
                withdrawCourses: FieldValue.arrayRemove(assignCourseId),
            });

            // Delete attendance records for the withdrawn course
            const attendancesDocRef = fs.collection('attendances').doc(assignCourseId);
            const attendancesDoc = await attendancesDocRef.get();
            if (attendancesDoc.exists) {
                const attendancesData = attendancesDoc.data();
                const updatedAttendances = attendancesData.attendances.map((attendance) => {
                    const updatedRecords = {};
                    for (const studentKey in attendance.records) {
                        if (studentKey !== studentId) {
                            updatedRecords[studentKey] = attendance.records[studentKey];
                        }
                    }
                    return { ...attendance, records: updatedRecords };
                });
                await attendancesDocRef.update({ attendances: updatedAttendances });
            }

            // Delete marks for the withdrawn course
            const studentsMarksDocRef = fs.collection('studentsMarks').doc(assignCourseId);
            const studentsMarksDoc = await studentsMarksDocRef.get();
            if (studentsMarksDoc.exists) {
                const marksOfStudents = studentsMarksDoc.data().marksOfStudents || [];

                // Filter out the marks entry for the current student
                const updatedMarksOfStudents = marksOfStudents.filter(studentMarks => {
                    if (studentMarks.studentId === studentId) {
                        return false; // Exclude this student's marks entry
                    }
                    return true;
                });

                await studentsMarksDocRef.update({ marksOfStudents: updatedMarksOfStudents });
            }

            setWithdrawRequests((prev) => prev.filter(course => course.assignCourseId !== assignCourseId));
            setProcessing((prev) => ({ ...prev, [assignCourseId]: false }));
        } catch (error) {
            setError(error.message);
        }
    };



    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] uppercase rounded-2xl'>{studentdata.name}'s Information</h2>
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
                    </div>
                    {withdrawRequests.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead class="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Course Name</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Instructor</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Class ID</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">WithDraw</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Remove Application</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawRequests.map((course) => (
                                            <tr key={course.assignCourseId} className='text-center odd:bg-white even:bg-gray-300 text-custom-blue  border-b  font-semibold text-lg'>
                                                <th scope='row' class="px-6 py-4 font-bold ">{course.courseName}</th>
                                                <td class="px-6 py-4  ">{course.instructorName}</td>
                                                <td class="px-6 py-4  ">{course.className}</td>

                                                <td>
                                                    {processing[course.assignCourseId] ? (
                                                        <div>Deleting all records...</div>
                                                    ) : (
                                                        <button onClick={() => handleWithdraw(course.assignCourseId)} className="whitespace-nowrap bg-red-600 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                            Withdraw
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => handleRemoveApplication(course.assignCourseId)} className="whitespace-nowrap bg-green-800 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">
                                                        Remove Application
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    ) : (
                        <p>No withdraw applications found.</p>
                    )}
                </div>

            )}
        </div>
    );
};

export default ApplicationsForWithdraw;
