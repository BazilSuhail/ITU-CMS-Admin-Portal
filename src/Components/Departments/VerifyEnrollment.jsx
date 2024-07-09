import React, { useState, useEffect } from 'react';
import { fs, FieldValue } from '../../Config/Config';
import { useParams } from 'react-router-dom';

const VerifyEnrollment = () => {
    const { studentId } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseDetails, setCourseDetails] = useState({});

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            setError(null);
            try {
                const studentDoc = await fs.collection('students').doc(studentId).get();
                if (studentDoc.exists) {
                    const studentData = studentDoc.data();
                    setStudent(studentData);
                    await fetchCourseDetails(studentData.enrolledCourses);
                } else {
                    setError('Student data not found.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCourseDetails = async (enrolledCourses) => {
            const courseData = {};
            for (let courseId of enrolledCourses) {
                try {
                    const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                    if (assignCourseDoc.exists) {
                        const assignCourse = assignCourseDoc.data();
                        const courseDoc = await fs.collection('courses').doc(assignCourse.courseId).get();
                        const classDoc = await fs.collection('classes').doc(assignCourse.classId).get();
                        const instructorDoc = await fs.collection('instructors').doc(assignCourse.instructorId).get();

                        if (courseDoc.exists && classDoc.exists && instructorDoc.exists) {
                            const course = courseDoc.data();
                            const classData = classDoc.data();
                            const instructor = instructorDoc.data();

                            courseData[courseId] = {
                                ...assignCourse,
                                name: course.name,
                                preRequisites: course.preRequisites || [],
                                className: classData.name,
                                instructorName: instructor.name
                            };
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching course ${courseId}:`, err);
                }
            }
            setCourseDetails(courseData);
        };

        fetchStudentData();
    }, [studentId]);

    const handleApprove = async (courseId) => {
        try {
            await fs.collection('students').doc(studentId).update({
                enrolledCourses: FieldValue.arrayRemove(courseId),
                currentCourses: FieldValue.arrayUnion(courseId),
            });
            setStudent((prev) => ({
                ...prev,
                enrolledCourses: prev.enrolledCourses.filter((id) => id !== courseId),
                currentCourses: [...prev.currentCourses, courseId],
            }));
        } catch (error) {
            console.error('Error approving course:', error);
            setError('Error approving course.');
        }
    };

    const handleDisapprove = async (courseId) => {
        try {
            await fs.collection('students').doc(studentId).update({
                enrolledCourses: FieldValue.arrayRemove(courseId),
            });
            setStudent((prev) => ({
                ...prev,
                enrolledCourses: prev.enrolledCourses.filter((id) => id !== courseId),
            }));
        } catch (error) {
            console.error('Error disapproving course:', error);
            setError('Error disapproving course.');
        }
    };

    const checkPrerequisites = (preRequisites) => {
        if (!preRequisites || preRequisites.length === 0) return true;
        return preRequisites.every((preReqId) =>
            student?.completedCourses?.includes(preReqId)
        );
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] text-2xl text-center font-bold p-[8px] uppercase rounded-2xl'>
                {student ? `${student.name}'s Information` : 'Loading...'}
            </h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <div>
                    {student ? (
                        <div>
                            <div className='grid grid-cols-1 xsx:grid-cols-3 gap-x-[6px] gap-y-[15px] p-[8px]'>
                                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                                    <div className='ml-[5px] text-md'>Student's Email:</div>
                                    <div className='text-3xl xsx:text-2xl '>{student.email}</div>
                                </div>
                                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                                    <div className='ml-[5px] text-md'>Student's Roll-Number:</div>
                                    <div className='text-3xl xsx:text-2xl '>{student.rollNumber}</div>
                                </div>
                                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                                    <div className='ml-[5px] text-md'>Student's Current Semester:</div>
                                    <div className='text-3xl xsx:text-2xl '>{student.semester}</div>
                                </div>
                            </div>

                            {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                                <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                                    <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                        <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                                <tr className='text-center'>
                                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Course Name</th>
                                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor</th>
                                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Class ID</th>
                                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Approve</th>
                                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Disapprove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.enrolledCourses.map((courseId) => (
                                                    <tr key={courseId} className='text-center odd:bg-white even:bg-gray-300 text-custom-blue  border-b  font-semibold text-lg'>
                                                        <th scope='row' className="px-6 py-4 font-bold ">{courseDetails[courseId]?.name || 'Not Found'}</th>
                                                        <td className="px-6 py-4 font-bold ">{courseDetails[courseId]?.instructorName || 'Loading...'}</td>
                                                        <td className="px-6 py-4 font-bold ">{courseDetails[courseId]?.className || 'Loading...'}</td>
                                                        <td className="px-6 py-4 font-bold ">
                                                            <button onClick={() => handleApprove(courseId)}
                                                                className={`whitespace-nowrap text-md py-[8px] px-[12px] font-semibold rounded-xl 
                                                                    ${!checkPrerequisites(courseDetails[courseId]?.preRequisites)
                                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                        : 'bg-custom-blue text-white hover:bg-white  border-2 hover:text-custom-blue'
                                                                    }`}
                                                                disabled={!checkPrerequisites(courseDetails[courseId]?.preRequisites)}  >
                                                                Approve
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold ">
                                                            <button onClick={() => handleDisapprove(courseId)} disabled={checkPrerequisites(courseDetails[courseId]?.preRequisites)}
                                                                className={`whitespace-nowrap text-md py-[8px] px-[12px] font-semibold rounded-xl 
                                                                ${checkPrerequisites(courseDetails[courseId]?.preRequisites)
                                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                        : 'bg-custom-blue text-white hover:bg-white hover:shadow-custom-light hover:text-custom-blue'
                                                                    }`}
                                                            >
                                                                Disapprove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p>No applied courses found.</p>
                            )}
                        </div>
                    ) : (
                        <p>No student data available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VerifyEnrollment;
