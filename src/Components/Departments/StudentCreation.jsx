import React, { useState, useEffect } from 'react';
import { auth, fs, FieldValue } from '../../Config/Config';

const StudentCreation = () => {
    
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
        currentCourses: [],
        withdrawCourses: [],
        gender: '',
        bloodGroup: '',
        city: '',
        country: '',
        nationality: '',
        currentAddress: '',
        permanentAddress: '',
        fatherName: '',
        batch: '',
        degreeProgram: '',
        status: 'current',
        semester: 1
    });
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState(null);
    const [studentSuccess, setStudentSuccess] = useState(null);
    const [classes, setClasses] = useState([]);
    const [department, setDepartment] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Fetch classes
                    const classesSnapshot = await fs.collection('classes').get();
                    const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);

                    // Fetch department of current user
                    const departmentDoc = await fs.collection('departments').doc(user.uid).get();
                    if (departmentDoc.exists) {
                        setDepartment(departmentDoc.data());
                    } else {
                        setStudentError('Department not found for the current user.');
                    }
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

            // Store student data in Firestore
            await fs.collection('students').doc(user.uid).set({
                ...student,
                departmentEmail: department.email,
                departmentPassCode: department.passCode,
                createdAt: new Date()
            });

            // Update the corresponding class document
            await fs.collection('classes').doc(student.classId).update({
                studentsOfClass: FieldValue.arrayUnion(user.uid)
            });

            // Sign in the user again with department email and passCode
            await auth.signInWithEmailAndPassword(department.email, department.passCode);

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
                currentCourses: [],
                withdrawCourses: [],
                gender: '',
                bloodGroup: '',
                city: '',
                country: '',
                nationality: '',
                currentAddress: '',
                permanentAddress: '',
                fatherName: '',
                batch: '',
                degreeProgram: '',
                status: 'current',
                semester: 1
            });
            setStudentSuccess('Student registered successfully!');
            alert(studentSuccess);
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="studentName">Name:</label>
                    <input type="text" id="studentName" name="name" value={student.name} onChange={handleChange} required />

                    <label htmlFor="studentEmail">Email:</label>
                    <input type="email" id="studentEmail" name="email" value={student.email} onChange={handleChange} required />

                    <label htmlFor="studentDob">Date of Birth:</label>
                    <input type="date" id="studentDob" name="dob" value={student.dob} onChange={handleChange} required />

                    <label htmlFor="studentPhone">Phone:</label>
                    <input type="text" id="studentPhone" name="phone" value={student.phone} onChange={handleChange} required />

                    <label htmlFor="studentPassword">Password:</label>
                    <input type="password" id="studentPassword" name="password" value={student.password} onChange={handleChange} required />

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

                    <label htmlFor="studentRollNumber">Roll Number:</label>
                    <input
                        type="text"
                        id="studentRollNumber"
                        name="rollNumber"
                        value={student.rollNumber}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="studentGender">Gender:</label>
                    <select
                        id="studentGender"
                        name="gender"
                        value={student.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <label htmlFor="studentBloodGroup">Blood Group:</label>
                    <input type="text" id="studentBloodGroup" name="bloodGroup" value={student.bloodGroup} onChange={handleChange} required />
                
                    <label htmlFor="studentCity">City:</label>
                    <input type="text" id="studentCity" name="city" value={student.city} onChange={handleChange} required />
                
                    <label htmlFor="studentCountry">Country:</label>
                    <input type="text" id="studentCountry" name="country" value={student.country} onChange={handleChange} required />

                    <label htmlFor="studentNationality">Nationality:</label>
                    <input type="text" id="studentNationality" name="nationality" value={student.nationality} onChange={handleChange} required />
                

                    <label htmlFor="studentCurrentAddress">Current Address:</label>
                    <input type="text" id="studentCurrentAddress" name="currentAddress" value={student.currentAddress} onChange={handleChange} required />
                

                    <label htmlFor="studentPermanentAddress">Permanent Address:</label>
                    <input type="text" id="studentPermanentAddress" name="permanentAddress" value={student.permanentAddress} onChange={handleChange} required />
                
                    <label htmlFor="studentFatherName">Father's Name:</label>
                    <input type="text" id="studentFatherName" name="fatherName" value={student.fatherName} onChange={handleChange} required />
                
                    <label htmlFor="studentBatch">Batch:</label>
                    <input
                        type="text"
                        id="studentBatch"
                        name="batch"
                        value={student.batch}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="studentDegreeProgram">Department:</label>
                    <input
                        type="text"
                        id="studentDegreeProgram"
                        name="degreeProgram"
                        value={`BS-${department ? department.name : 'Department'}`}
                        readOnly
                    />

                    <input
                        type="hidden"
                        id="studentStatus"
                        name="status"
                        value="current"
                    />

                    <input
                        type="hidden"
                        id="studentSemester"
                        name="semester"
                        value="1"
                    />

                    <button type="submit" disabled={studentLoading}>
                        {studentLoading ? 'Registering...' : 'Register Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentCreation;
