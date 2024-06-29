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
            setError(error.message);
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
            setError(error.message);
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
        <div>
            <h2>{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>
            <form onSubmit={handleCreateCourse}>
                <div>
                    <label htmlFor="courseName">Course Name:</label>
                    <input
                        type="text"
                        id="courseName"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="courseCode">Course Code:</label>
                    <input
                        type="text"
                        id="courseCode"
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="selectedDepartment">Select Department:</label>
                    <select
                        id="selectedDepartment"
                        name="selectedDepartment"
                        value={formData.selectedDepartment}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="creditHours">Credit Hours:</label>
                    <input
                        type="number"
                        id="creditHours"
                        name="creditHours"
                        value={formData.creditHours}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="expectedSemester">Expected Semester:</label>
                    <input
                        type="text"
                        id="expectedSemester"
                        name="expectedSemester"
                        value={formData.expectedSemester}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Pre-Requisites:</label>
                    {formData.preRequisites.map((preReq, index) => (
                        <div key={index}>
                            <select
                                value={preReq}
                                onChange={(e) => handlePreRequisitesChange(index, e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => removePreRequisite(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addPreRequisite}>Add Pre-Requisite</button>
                </div>
                <div>
                    {editingCourseId ? (
                        <div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Course'}
                            </button>
                            <button type="button" onClick={handleCancelEdit} disabled={loading}>
                                Cancel Edit
                            </button>
                        </div>
                    ) : (
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    )}
                </div>
            </form>

            <h2>Available Courses</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Department ID</th>
                        <th>Credit Hours</th>
                        <th>Expected Semester</th>
                        <th>Pre-Requisites</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.name}</td>
                            <td>{course.code}</td>
                            <td>{course.departmentId}</td>
                            <td>{course.creditHours}</td>
                            <td>{course.expectedSemester}</td>
                            <td>
                                {course.preRequisites && course.preRequisites.length > 0
                                    ? course.preRequisites.map(preReqId => {
                                        const preReqCourse = courses.find(c => c.id === preReqId);
                                        return preReqCourse ? preReqCourse.name : 'Unknown';
                                    }).join(', ')
                                    : 'None'}
                            </td>
                            <td>
                                <button onClick={() => handleEditCourse(course)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RegisterCourse;
