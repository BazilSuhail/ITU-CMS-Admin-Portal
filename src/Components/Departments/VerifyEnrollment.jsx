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
        }
    };

    const checkPrerequisites = (preRequisites) => {
        if (!preRequisites || preRequisites.length === 0) return true;
        return preRequisites.every((preReqId) =>
            student.completedCourses.includes(preReqId)
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Verify Enrollment</h2>
            {student ? (
                <div>
                    <h3>Student: {student.name}</h3>
                    <h3>Student: {student.email}</h3>
                    <h3>Student: {student.rollNumber}</h3>
                    <h4>Applied Courses</h4>
                    {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Course ID</th>
                                    <th>Course Name</th>
                                    <th>Instructor</th>
                                    <th>Class Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {student.enrolledCourses.map((courseId) => (
                                    <tr key={courseId}>
                                        <td>{courseId}</td>
                                        <td>{courseDetails[courseId]?.name || 'Loading...'}</td>
                                        <td>{courseDetails[courseId]?.instructorName || 'Loading...'}</td>
                                        <td>{courseDetails[courseId]?.className || 'Loading...'}</td>
                                        <td>
                                            <button
                                                onClick={() => handleApprove(courseId)}
                                                disabled={!checkPrerequisites(courseDetails[courseId]?.preRequisites)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDisapprove(courseId)}
                                                disabled={checkPrerequisites(courseDetails[courseId]?.preRequisites)}
                                            >
                                                Disapprove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No applied courses found.</p>
                    )}
                </div>
            ) : (
                <p>No student data available.</p>
            )}
        </div>
    );
};

export default VerifyEnrollment;
