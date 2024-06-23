import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fs } from '../Config/Config';

const Marking = () => {
    const { assignCourseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [marks, setMarks] = useState({});
    const [newCriteria, setNewCriteria] = useState({ subject: '', weightage: '' });
    const [editingCriteria, setEditingCriteria] = useState(-1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const assignCourseDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
                if (assignCourseDoc.exists) {
                    const assignCourseData = assignCourseDoc.data();
                    const classDoc = await fs.collection('classes').doc(assignCourseData.classId).get();
                    if (classDoc.exists) {
                        const classData = classDoc.data();
                        const studentsList = classData.studentsOfClass || [];
                        const studentsData = await Promise.all(
                            studentsList.map(async (studentId) => {
                                const studentDoc = await fs.collection('students').doc(studentId).get();
                                return {
                                    id: studentDoc.id,
                                    name: studentDoc.data().name,
                                };
                            })
                        );
                        setStudents(studentsData);
                        const marksDoc = await fs.collection('studentsMarks').doc(assignCourseId).get();
                        if (marksDoc.exists) {
                            const marksData = marksDoc.data();
                            setCriteria(marksData.criteriaDefined || []);
                            const marksObject = marksData.marksOfStudents.reduce((acc, studentMarks) => {
                                acc[studentMarks.studentId] = studentMarks.marks;
                                return acc;
                            }, {});
                            setMarks(marksObject);
                        }
                    } else {
                        setError('Class data not found');
                    }
                } else {
                    setError('Assigned course data not found');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assignCourseId]);

    const handleAddCriteria = () => {
        if (newCriteria.subject && newCriteria.weightage) {
            setCriteria([...criteria, { ...newCriteria }]);
            setNewCriteria({ subject: '', weightage: '' });
        }
    };

    /*
    const handleMarksChange = (studentId, subject, value) => {
        setMarks((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subject]: parseFloat(value),
            },
        }));
    };

    */
    const handleSaveMarks = async () => {
        try {
            const marksData = {
                criteriaDefined: criteria,
                marksOfStudents: Object.keys(marks).map((studentId) => ({
                    studentId,
                    marks: marks[studentId],
                })),
            };

            await fs.collection('studentsMarks').doc(assignCourseId).set(marksData);

            navigate(`/assign-marks/${assignCourseId}`);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteCriteria = (index) => {
        setCriteria((prev) => prev.filter((_, i) => i !== index));
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                const { [criteria[index].subject]: _, ...rest } = newMarks[studentId];
                newMarks[studentId] = rest;
            });
            return newMarks;
        });
    };

    const handleEditCriteria = (index) => {
        setEditingCriteria(index);
    };

    const handleSaveEditCriteria = (index, newSubject, newWeightage) => {
        setCriteria((prev) =>
            prev.map((item, i) =>
                i === index ? { subject: newSubject, weightage: newWeightage } : item
            )
        );
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                if (newMarks[studentId][criteria[index].subject] !== undefined) {
                    newMarks[studentId][newSubject] = newMarks[studentId][criteria[index].subject];
                    delete newMarks[studentId][criteria[index].subject];
                }
            });
            return newMarks;
        });
        setEditingCriteria(-1);
    };

    const totalWeightage = criteria.reduce((total, item) => total + parseFloat(item.weightage), 0);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Marking</h2>
            <div>
                <h3>Define Marking Criteria</h3>
                <div>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={newCriteria.subject}
                        onChange={(e) => setNewCriteria({ ...newCriteria, subject: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Weightage"
                        value={newCriteria.weightage}
                        onChange={(e) => setNewCriteria({ ...newCriteria, weightage: e.target.value })}
                    />
                    <button onClick={handleAddCriteria}>Add Criteria</button>
                </div>
                <p>Total Weightage: {totalWeightage}%</p>
                <ul>
                    {criteria.map((criterion, index) => (
                        <li key={index}>
                            {editingCriteria === index ? (
                                <div>
                                    <input
                                        type="text"
                                        value={criterion.subject}
                                        onChange={(e) =>
                                            setCriteria((prev) =>
                                                prev.map((item, i) =>
                                                    i === index ? { ...item, subject: e.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        type="number"
                                        value={criterion.weightage}
                                        onChange={(e) =>
                                            setCriteria((prev) =>
                                                prev.map((item, i) =>
                                                    i === index ? { ...item, weightage: e.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                    <button onClick={() => handleSaveEditCriteria(index, criterion.subject, criterion.weightage)}>
                                        Save
                                    </button>
                                    <button onClick={() => setEditingCriteria(-1)}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <span>
                                        {criterion.subject} ({criterion.weightage}%)
                                    </span>
                                    <button onClick={() => handleEditCriteria(index)}>Edit</button>
                                    <button onClick={() => handleDeleteCriteria(index)}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Enter Marks</h3>
                {criteria.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                {criteria.map((criterion, index) => (
                                    <th key={index}>
                                        {criterion.subject} ({criterion.weightage}%)
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    {criteria.map((criterion, index) => (
                                        <td key={index}>
                                            <div>
                                                {marks[student.id]?.[criterion.subject] || ''}
                                            </div>
                                        </td>
                                    ))}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No criteria defined yet.</p>
                )}
            </div>
            <button onClick={handleSaveMarks}>Edit Marks</button>
        </div>
    );
};

export default Marking;
