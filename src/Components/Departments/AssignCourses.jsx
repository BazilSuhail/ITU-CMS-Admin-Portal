import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';

import { Circles } from 'react-loader-spinner';
const AssignCourses = () => {
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState(null);
    const [assignSuccess, setAssignSuccess] = useState(null);
    const [departmentAbbreviation, setDepartmentAbbreviation] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const departmentSnapshot = await fs.collection('departments').doc(user.uid).get();
                    const departmentData = departmentSnapshot.data();
                    setDepartmentAbbreviation(departmentData.abbreviation);

                    const coursesSnapshot = await fs.collection('courses').get();
                    const instructorsSnapshot = await fs.collection('instructors').get();
                    const classesSnapshot = await fs.collection('classes').get();

                    setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setInstructors(instructorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setClasses(classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                    const assignmentsSnapshot = await fs.collection('assignCourses').get();
                    setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    setAssignError('No user is currently logged in.');
                }
            } catch (err) {
                setAssignError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (departmentAbbreviation && classes.length > 0) {
            const filtered = classes.filter(cls => cls.name.startsWith(departmentAbbreviation));
            setFilteredClasses(filtered);
        }
    }, [departmentAbbreviation, classes]);

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        setAssignError(null);
        setAssignSuccess(null);

        try {
            const user = auth.currentUser;
            if (user) {
                const existingAssignment = assignments.find(
                    assignment =>
                        assignment.courseId === selectedCourse &&
                        assignment.instructorId === selectedInstructor &&
                        assignment.classId === selectedClass
                );

                if (existingAssignment) {
                    setAssignError('This assignment already exists.');
                    return;
                }

                const assignmentRef = await fs.collection('assignCourses').add({
                    courseId: selectedCourse,
                    instructorId: selectedInstructor,
                    classId: selectedClass
                });

                setAssignments([
                    ...assignments,
                    {
                        id: assignmentRef.id,
                        courseId: selectedCourse,
                        instructorId: selectedInstructor,
                        classId: selectedClass
                    }
                ]);

                setSelectedCourse('');
                setSelectedInstructor('');
                setSelectedClass('');
                setAssignSuccess('Course assigned successfully!');
            } else {
                setAssignError('No user is currently logged in.');
            }
        } catch (error) {
            setAssignError(error.message);
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Course Details</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {loading ? (
                <div className='w-screen h-[calc(98vh-195px)] flex flex-col justify-center items-center'>
                    <Circles
                        height="60"
                        width="60"
                        color="rgb(0, 63, 146)"
                        ariaLabel="circles-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                    />
                </div>
            ) : (
                <>
                    {assignError && <p style={{ color: 'red' }}>{assignError}</p>}
                    {assignSuccess && <p style={{ color: 'green' }}>{assignSuccess}</p>}

                    <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                        <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Assign Courses To Instructors</h2>
                        <form onSubmit={handleAssignCourse}>

                            <label htmlFor="className" className="block text-lg font-medium text-gray-700">Course Name:</label>
                            <select id="course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option className='bg-custom-blue text-white text-lg ' key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="className" className="block text-lg  font-medium text-gray-700">Select Instructor :</label>
                            <select
                                id="instructor"
                                value={selectedInstructor}
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                required
                            >
                                <option value="">Select Instructor</option>
                                {instructors.map((instructor) => (
                                    <option className='bg-custom-blue text-white text-lg ' key={instructor.id} value={instructor.id}>
                                        {instructor.name}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="className" className="block text-lg border-3 font-bold   text-gray-700">Select Class:</label>
                            <select
                                id="class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                required
                            >
                                <option value="">Select Class</option>
                                {filteredClasses.map((cls) => (
                                    <option className='bg-custom-blue text-white text-lg ' key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            <button className='lg:w-[45%] my-[15px] py-[8px] w-[75%] justify-center rounded-md bg-custom-blue text-lg font-bold hover:text-custom-blue hover:bg-white text-white' type="submit" disabled={assignLoading}>
                                {assignLoading ? 'Assigning...' : 'Assign Course'}
                            </button>
                        </form>
                    </div>
                    {assignments.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Course Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Class Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className='bg-white'>
                                        {assignments
                                            .filter(assignment => {
                                                const className = classes.find(cls => cls.id === assignment.classId)?.name;
                                                return className && className.startsWith(departmentAbbreviation);
                                            })
                                            .map((assignment, index) => (
                                                <tr key={index} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b  font-semibold text-md'>
                                                    <th scope='row' className="px-6 py-4 font-bold ">{courses.find(course => course.id === assignment.courseId)?.name}</th>
                                                    <td className="px-6 py-4">{instructors.find(instructor => instructor.id === assignment.instructorId)?.name}</td>
                                                    <td className="px-6 py-4">{classes.find(cls => cls.id === assignment.classId)?.name}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No assignments found.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default AssignCourses;
