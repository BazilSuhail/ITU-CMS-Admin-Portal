import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import AssignCourses from './AssignCourses';

const DepartmentProfile = () => {
    const [departmentData, setDepartmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [className, setClassName] = useState('');
    const [classLoading, setClassLoading] = useState(false);
    const [classError, setClassError] = useState(null);
    const [classSuccess, setClassSuccess] = useState(null);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchDepartmentData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const departmentDoc = await fs.collection('departments').doc(user.uid).get();
                    if (departmentDoc.exists) {
                        setDepartmentData(departmentDoc.data());

                        const classesSnapshot = await fs.collection('classes').where('departmentId', '==', user.uid).get();
                        const classesList = classesSnapshot.docs.map(doc => {
                            const classData = doc.data();
                            return { id: doc.id, ...classData, studentsOfClass: classData.studentsOfClass || [] };
                        });
                        setClasses(classesList);
                    } else {
                        setError('No department data found.');
                    }
                } else {
                    setError('No user is currently logged in.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentData();
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setClassLoading(true);
        setClassError(null);
        setClassSuccess(null);

        try {
            const user = auth.currentUser;
            if (user) {
                const classRef = await fs.collection('classes').add({
                    name: className,
                    departmentId: user.uid,
                    studentsOfClass: []
                });

                setClasses([...classes, { id: classRef.id, name: className, departmentId: user.uid, studentsOfClass: [] }]);

                setClassName('');
                setClassSuccess('Class created successfully!');
            } else {
                setClassError('No user is currently logged in.');
            }
        } catch (error) {
            setClassError(error.message);
        } finally {
            setClassLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Department Profile</h2>
            {departmentData && (
                <div>
                    <p><strong>Name:</strong> {departmentData.name}</p>
                    <p><strong>Email:</strong> {departmentData.email}</p>
                    <p><strong>Abbreviation:</strong> {departmentData.abbreviation}</p>
                </div>
            )}

            <h3>Create Class</h3>
            {classError && <p style={{ color: 'red' }}>{classError}</p>}
            {classSuccess && <p style={{ color: 'green' }}>{classSuccess}</p>}
            <form onSubmit={handleCreateClass}>
                <div>
                    <label htmlFor="className">Class Name:</label>
                    <input
                        type="text"
                        id="className"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={classLoading}>
                    {classLoading ? 'Creating...' : 'Create Class'}
                </button>
            </form>

            <h3>Classes</h3>
            {classes.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Number of Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id}>
                                <td>{cls.name}</td>
                                <td>{cls.studentsOfClass.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No classes found.</p>
            )}

            <AssignCourses departmentAbbreviation={departmentData ? departmentData.abbreviation : ''} />
        </div>
    );
};

export default DepartmentProfile;
