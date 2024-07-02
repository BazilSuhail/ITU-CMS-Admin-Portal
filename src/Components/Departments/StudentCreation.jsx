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
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] uppercase rounded-2xl'>Register Student</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {studentError && <p style={{ color: 'red' }}>{studentError}</p>}
            {studentSuccess && <p style={{ color: 'green' }}>{studentSuccess}</p>}
            <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Assign Courses To Instructors</h2>

                <form onSubmit={handleRegisterStudent}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentName">Name:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentName" name="name" value={student.name} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentEmail">Email:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="email" id="studentEmail" name="email" value={student.email} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentDob">Date of Birth:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="date" id="studentDob" name="dob" value={student.dob} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentPhone">Phone:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentPhone" name="phone" value={student.phone} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentPassword">Password:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="password" id="studentPassword" name="password" value={student.password} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentClassId">Class:</label>
                        <select id="studentClassId" name="classId" value={student.classId} onChange={handleChange} required
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                             placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md">

                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option className='bg-custom-blue text-white text-lg ' key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentRollNumber">Roll Number:</label>
                        <input type="text" id="studentRollNumber" name="rollNumber" value={student.rollNumber} onChange={handleChange} required
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                        />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentGender">Gender:</label>
                        <select
                            id="studentGender"
                            name="gender"
                            value={student.gender}
                            onChange={handleChange}
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                            required
                        >
                            <option className='bg-custom-blue text-white text-lg ' value="">Select Gender</option>
                            <option className='bg-custom-blue text-white text-lg ' value="male">Male</option>
                            <option className='bg-custom-blue text-white text-lg ' value="female">Female</option>
                        </select>

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentBloodGroup">Blood Group:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentBloodGroup" name="bloodGroup" value={student.bloodGroup} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentCity">City:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentCity" name="city" value={student.city} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentCountry">Country:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentCountry" name="country" value={student.country} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentNationality">Nationality:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentNationality" name="nationality" value={student.nationality} onChange={handleChange} required />


                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentCurrentAddress">Current Address:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentCurrentAddress" name="currentAddress" value={student.currentAddress} onChange={handleChange} required />


                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentPermanentAddress">Permanent Address:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentPermanentAddress" name="permanentAddress" value={student.permanentAddress} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentFatherName">Father's Name:</label>
                        <input className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            type="text" id="studentFatherName" name="fatherName" value={student.fatherName} onChange={handleChange} required />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentBatch">Batch:</label>
                        <input type="text" id="studentBatch" name="batch" value={student.batch} onChange={handleChange} required
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue
                         placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                        />

                        <label className="block text-lg  font-medium text-gray-700" htmlFor="studentDegreeProgram">Department:</label>
                        <input type="text" id="studentDegreeProgram" name="degreeProgram" value={`BS-${department ? department.name : 'Department'}`} readOnly
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"  />

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

                        <button className='lg:w-[45%] mx-auto my-[15px] py-[8px] w-[75%] justify-center rounded-md bg-custom-blue text-lg font-bold hover:text-custom-blue hover:bg-white text-white' type="submit" disabled={studentLoading}>
                            {studentLoading ? 'Registering...' : 'Register Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentCreation;
