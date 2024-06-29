import React, { useState, useEffect } from 'react';
import { fs,auth } from '../../Config/Config';
import { useNavigate } from 'react-router-dom';

const AssignResults = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            setError(null);
            try {
                const user = auth.currentUser;
                if (user) {
                    const classesSnapshot = await fs.collection('classes').where('departmentId', '==', user.uid).get();
                    const classesList = classesSnapshot.docs.map(doc => {
                        const classData = doc.data();
                        return { id: doc.id, ...classData };
                    });
                    setClasses(classesList);
                } else {
                    setError('No user is currently logged in.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handleViewStudents = (classId) => {
        navigate(`/students-in-class/${classId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Classes</h2>
            {classes.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id}>
                                <td>{cls.name}</td>
                                <td>
                                    <button onClick={() => handleViewStudents(cls.id)}>View Students</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No classes found.</p>
            )}
        </div>
    );
};

export default AssignResults;
