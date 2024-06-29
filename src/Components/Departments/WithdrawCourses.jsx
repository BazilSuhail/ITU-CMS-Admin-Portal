import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs, FieldValue } from '../../Config/Config';

const ApplicationsForWithdraw = () => {
    const { studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        const fetchWithdrawRequests = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentDoc = await fs.collection('students').doc(studentId).get();
                if (studentDoc.exists) {
                    const studentData = studentDoc.data();
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
    


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Applications for Withdraw</h2>
            {withdrawRequests.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Instructor Name</th>
                            <th>Class Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawRequests.map((course) => (
                            <tr key={course.assignCourseId}>
                                <td>{course.courseName}</td>
                                <td>{course.instructorName}</td>
                                <td>{course.className}</td>
                                <td>
                                    {processing[course.assignCourseId] ? (
                                        <div>Deleting all records...</div>
                                    ) : (
                                        <>
                                            <button onClick={() => handleWithdraw(course.assignCourseId)}>Withdraw</button>
                                            <button onClick={() => handleRemoveApplication(course.assignCourseId)}>Remove Application</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No withdraw applications found.</p>
            )}
        </div>
    );
};

export default ApplicationsForWithdraw;
