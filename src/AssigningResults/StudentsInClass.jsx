import React, { useState, useEffect } from 'react';
import { fs } from '../Config/Config';
import { useParams, useNavigate } from 'react-router-dom';


const StudentsInClass = () => {
    const { classId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const naviagate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const classDoc = await fs.collection('classes').doc(classId).get();
                if (classDoc.exists) {
                    const classData = classDoc.data();
                    const studentDataPromises = classData.studentsOfClass.map(studentId =>
                        fs.collection('students').doc(studentId).get()
                    );
                    const studentDocs = await Promise.all(studentDataPromises);
                    const studentsList = studentDocs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsList);
                } else {
                    setError('Class data not found.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [classId]);

    const handleViewEnrollments = (studentId) => {
        
        naviagate(`/assign-results/${classId}/${studentId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Students in Class</h2>
            {students.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.dob}</td>
                                <td>{student.email}</td>
                                <td>
                                    <button onClick={() => handleViewEnrollments(student.id)}>View Enrollments</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No students found.</p>
            )}
        </div>
    );
};

export default StudentsInClass;
