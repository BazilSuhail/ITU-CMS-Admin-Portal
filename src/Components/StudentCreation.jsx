import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';
import { arrayUnion } from 'firebase/firestore'; 

const StudentRegistration = () => {
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
    const [students, setStudents] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserPassword, setCurrentUserPassword] = useState('');
    const [departmentAbbreviation, setDepartmentAbbreviation] = useState('');

    useEffect(() => {
        const fetchClassesAndStudents = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    setCurrentUser(user);
                    // Here you need to set the current user's password manually
                    // This is for demonstration purposes; in a real app, you might need to handle this securely
                    setCurrentUserPassword('current_user_password'); 

                    // Fetch department details
                    const departmentSnapshot = await fs.collection('departments').doc(user.uid).get();
                    const departmentData = departmentSnapshot.data();
                    setDepartmentAbbreviation(departmentData.abbreviation);

                    // Fetch classes
                    const classesSnapshot = await fs.collection('classes').get();
                    const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);

                    // Create a lookup for class names
                    const classLookup = {};
                    classesList.forEach(cls => {
                        classLookup[cls.id] = cls.name;
                    });

                    // Fetch students
                    const studentsSnapshot = await fs.collection('students').get();
                    const studentsList = studentsSnapshot.docs.map(doc => {
                        const studentData = doc.data();
                        return { id: doc.id, ...studentData, className: classLookup[studentData.classId] };
                    });

                    // Filter students based on department abbreviation
                    const filteredStudents = studentsList.filter(student => student.className && student.className.substring(0, 2) === departmentAbbreviation);

                    setStudents(filteredStudents);
                } else {
                    setStudentError('No user is currently logged in.');
                }
            } catch (err) {
                setStudentError(err.message);
            }
        };

        fetchClassesAndStudents();
    }, [departmentAbbreviation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prevStudent => ({
            ...prevStudent,
            [name]: value
        }));
    };

    const reauthenticateUser = async () => {
        const credential = auth.EmailAuthProvider.credential(
            currentUser.email,
            currentUserPassword
        );
        await currentUser.reauthenticateWithCredential(credential);
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setStudentLoading(true);
        setStudentError(null);
        setStudentSuccess(null);

        try {
            // Reauthenticate the current user
            await reauthenticateUser();

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

            <h3>Students</h3>
            {students.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date of Birth</th>
                            <th>Phone</th>
                            <th>Class</th>
                            <th>Roll Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.dob}</td>
                                <td>{student.phone}</td>
                                <td>{student.className}</td>
                                <td>{student.rollNumber}</td>
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

export default StudentRegistration;
