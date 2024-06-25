import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, fs } from '../Config/Config';
import { arrayUnion } from 'firebase/firestore';

const StudentRegistration = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState({
        name: '',
        email: '',
        dob: '',
        phone: '',
        password: '',
        classId: '',
        rollNumber: '',
        completedCourses: [],
        enrolledCourses: [],
        currentCourses: []
    });
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState(null);
    const [studentSuccess, setStudentSuccess] = useState(null);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Fetch classes
                    const classesSnapshot = await fs.collection('classes').get();
                    const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);
                } else {
                    setStudentError('No user is currently logged in.');
                }
            } catch (err) {
                setStudentError(err.message);
            }
        };

        fetchClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prevStudent => ({
            ...prevStudent,
            [name]: value
        }));
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setStudentLoading(true);
        setStudentError(null);
        setStudentSuccess(null);

        try {
            // Register the new student
            const userCredential = await auth.createUserWithEmailAndPassword(student.email, student.password);
            const user = userCredential.user;

            await fs.collection('students').doc(user.uid).set({
                ...student,
                createdAt: new Date()
            });

            await fs.collection('classes').doc(student.classId).update({
                studentsOfClass: arrayUnion(user.uid)
            });

            setStudent({
                name: '',
                email: '',
                dob: '',
                phone: '',
                password: '',
                classId: '',
                rollNumber: '',
                completedCourses: [],
                enrolledCourses: [],
                currentCourses: []
            });
            setStudentSuccess('Student registered successfully!');
            navigate('/');
        } catch (error) {
            setStudentError(error.message);
        } finally {
            setStudentLoading(false);
        }
    };

    return (
        <div>
            <h3>Register Student</h3>
            {studentError && <p style={{ color: 'red' }}>{studentError}</p>}
            {studentSuccess && <p style={{ color: 'green' }}>{studentSuccess}</p>}
            <form onSubmit={handleRegisterStudent}>
                <div>
                    <label htmlFor="studentName">Name:</label>
                    <input
                        type="text"
                        id="studentName"
                        name="name"
                        value={student.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentEmail">Email:</label>
                    <input
                        type="email"
                        id="studentEmail"
                        name="email"
                        value={student.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentDob">Date of Birth:</label>
                    <input
                        type="date"
                        id="studentDob"
                        name="dob"
                        value={student.dob}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentPhone">Phone:</label>
                    <input
                        type="text"
                        id="studentPhone"
                        name="phone"
                        value={student.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentPassword">Password:</label>
                    <input
                        type="password"
                        id="studentPassword"
                        name="password"
                        value={student.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentClassId">Class:</label>
                    <select
                        id="studentClassId"
                        name="classId"
                        value={student.classId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="studentRollNumber">Roll Number:</label>
                    <input
                        type="text"
                        id="studentRollNumber"
                        name="rollNumber"
                        value={student.rollNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={studentLoading}>
                    {studentLoading ? 'Registering...' : 'Register Student'}
                </button>
            </form>
        </div>
    );
};

export default StudentRegistration;
