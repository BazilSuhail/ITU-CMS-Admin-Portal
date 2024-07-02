import React, { useState, useEffect } from 'react';
import { fs } from '../../Config/Config';

const RegisterCourse = () => {
    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        selectedDepartment: '',
        creditHours: '',
        expectedSemester: '',
        preRequisites: []
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [editingCourseId, setEditingCourseId] = useState(null); // Track the course being edited


    useEffect(() => {
        fetchDepartments();
        fetchCourses();
    }, []); // Empty dependency array to run once on component mount

    const fetchDepartments = async () => {
        try {
            const snapshot = await fs.collection('departments').get();
            const departmentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDepartments(departmentsData);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to fetch departments.');
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const snapshot = await fs.collection('courses').get();
            const coursesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to fetch courses.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePreRequisitesChange = (index, value) => {
        const newPreRequisites = [...formData.preRequisites];
        newPreRequisites[index] = value;
        setFormData({
            ...formData,
            preRequisites: newPreRequisites
        });
    };

    const addPreRequisite = () => {
        setFormData({
            ...formData,
            preRequisites: [...formData.preRequisites, '']
        });
    };

    const removePreRequisite = (index) => {
        const newPreRequisites = formData.preRequisites.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            preRequisites: newPreRequisites
        });
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingCourseId) {
                // Update existing course
                await fs.collection('courses').doc(editingCourseId).update({
                    name: formData.courseName,
                    code: formData.courseCode,
                    departmentId: formData.selectedDepartment,
                    creditHours: formData.creditHours,
                    expectedSemester: formData.expectedSemester,
                    preRequisites: formData.preRequisites,
                    updatedAt: new Date()
                });
            } else {
                // Create new course
                await fs.collection('courses').add({
                    name: formData.courseName,
                    code: formData.courseCode,
                    departmentId: formData.selectedDepartment,
                    creditHours: formData.creditHours,
                    expectedSemester: formData.expectedSemester,
                    preRequisites: formData.preRequisites,
                    createdAt: new Date()
                });
            }

            console.log('Course saved successfully.');

            setFormData({
                courseName: '',
                courseCode: '',
                selectedDepartment: '',
                creditHours: '',
                expectedSemester: '',
                preRequisites: []
            });

            // Refresh courses list after saving
            fetchCourses();

        } catch (error) {
            console.error('Error saving course:', error);
            setError('Failed to save course.');
        } finally {
            setLoading(false);
            setEditingCourseId(null); // Reset editing mode
        }
    };

    const handleEditCourse = (course) => {
        setEditingCourseId(course.id);
        setFormData({
            courseName: course.name,
            courseCode: course.code,
            selectedDepartment: course.departmentId,
            creditHours: course.creditHours,
            expectedSemester: course.expectedSemester,
            preRequisites: course.preRequisites || []
        });
    };

    const handleCancelEdit = () => {
        setEditingCourseId(null);
        setFormData({
            courseName: '',
            courseCode: '',
            selectedDepartment: '',
            creditHours: '',
            expectedSemester: '',
            preRequisites: []
        });
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Register Courses</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading && <p>Loading courses...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                    <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Available Courses</h2>
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead class="text-md text-gray-200 uppercase bg-gray-700">
                                <tr className='text-center'>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Course Name</th>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Course Code </th>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Credit Hours</th>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Course's Expected Semester</th>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Actions</th>
                                    <th scope="col" class="px-6 py-3 whitespace-nowrap">Pre Requisites</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg font-medium'>
                                        { /* <td>{course.id}</td> */}
                                        { /* <td>{course.departmentId}</td>*/}
                                        <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                                        <td className="px-6 py-4">{course.code}</td>
                                        <td className="px-6 py-4">{course.creditHours}</td>
                                        <td className="px-6 py-4">{course.expectedSemester}</td>
                                        <td>
                                            <button onClick={() => handleEditCourse(course)} className="whitespace-nowrap bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[25px] font-semibold text-white rounded-xl">
                                                Edit
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {course.preRequisites && course.preRequisites.length > 0
                                                ?  <button onClick={() => handleEditCourse(course)}  className=" w-[205px] text-center bg-blue-950 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] font-semibold text-white rounded-md">Check Pre-Requisites</button>
                                                : <p className='bg-green-800 text-white rounded-xl p-[8px] w-[195px] mx-auto'>None</p>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>
                <form onSubmit={handleCreateCourse} className='flex flex-col'>
                    <div>
                        <label className="block text-lg font-medium text-gray-700" htmlFor="courseName">Course Name:</label>
                        <input
                            type="text"
                            id="courseName"
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                            name="courseName"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            required
                        />
                        <label className="block text-lg font-medium text-gray-700" htmlFor="courseCode">Course Code:</label>
                        <input
                            type="text"
                            id="courseCode"
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleInputChange}
                            required
                        />
                        <label className="block text-lg font-medium text-gray-700" htmlFor="selectedDepartment">Select Department:</label>
                        <select
                            id="selectedDepartment"
                            name="selectedDepartment"
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                            value={formData.selectedDepartment}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        <label className="block text-lg font-medium text-gray-700" htmlFor="creditHours">Credit Hours:</label>
                        <input
                            type="number"
                            id="creditHours"
                            name="creditHours"
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            value={formData.creditHours}
                            onChange={handleInputChange}
                            required
                        />
                        <label className="block text-lg font-medium text-gray-700" htmlFor="expectedSemester">Expected Semester:</label>
                        <input
                            type="text"
                            id="expectedSemester"
                            className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            name="expectedSemester"
                            value={formData.expectedSemester}
                            onChange={handleInputChange}
                            required
                        />
                        <label className="block text-xl my-[15px] pl-[15px] py-[8px] w-[215px] font-medium text-white rounded-lg bg-gray-700" >Pre-Requisites:</label>
                        {formData.preRequisites.map((preReq, index) => (
                            <div key={index}>
                                <select
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    value={preReq}
                                    onChange={(e) => handlePreRequisitesChange(index, e.target.value)}
                                >
                                    <option className='font-bold text-md ' value="">Select Course</option>
                                    {courses.map(course => (
                                        <option className='font-bold text-md ' key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => removePreRequisite(index)} className='bg-red-700 font-bold hover:text-red-800 hover:shadow-custom-light hover:bg-white p-[8px] items-end text-md text-white rounded-lg m-[8px]'>Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={addPreRequisite} className='hover:bg-green-800 p-[8px] text-green-800 font-bold  w-[215px] hover:text-white shadow-custom-light bg-white text-md rounded-lg  my-[8px]'>Add Pre-Requisite</button>
                    </div>
                    <div>
                        {editingCourseId ? (
                            <div className='mx-auto'>
                                <button className='bg-green-900 p-[8px]  hover:text-green-800 hover:shadow-custom-create hover:bg-white text-xl font-extrabold text-white rounded-lg m-[8px]' type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Course'}
                                </button>
                                <button className='bg-red-700 font-bold hover:text-red-800 hover:shadow-custom-light hover:bg-white p-[8px] items-end text-xl text-white rounded-lg m-[8px]' type="button" onClick={handleCancelEdit} disabled={loading}>
                                    Cancel Edit
                                </button>
                            </div>
                        ) : (
                            <button type="submit" disabled={loading} className="w-full mt-[10px] font-bold bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-blue-900 focus:outline-none focus:bg-blue-900">
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                        )}
                    </div>
                </form>

            </div>
        </div>
    );
};

export default RegisterCourse;
