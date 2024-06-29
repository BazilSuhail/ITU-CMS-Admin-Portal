import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs } from '../../Config/Config';

const Marking = () => {
    const { assignCourseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [marks, setMarks] = useState({});
    const [newCriteria, setNewCriteria] = useState({ assessment: '', weightage: '', totalMarks: '' });
    const [editingCriteria, setEditingCriteria] = useState(-1);
    const [isEditing, setIsEditing] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentsSnapshot = await fs.collection('students').get();
                const studentsData = studentsSnapshot.docs
                    .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                    }));
                setStudents(studentsData);

                const marksDoc = await fs.collection('studentsMarks').doc(assignCourseId).get();
                if (marksDoc.exists) {
                    const marksData = marksDoc.data();
                    setCriteria(marksData.criteriaDefined || []);
                    const marksObject = marksData.marksOfStudents.reduce((acc, studentMarks) => {
                        acc[studentMarks.studentId] = { ...studentMarks.marks, grade: studentMarks.grade || 'I' };
                        return acc;
                    }, {});
                    setMarks(marksObject);
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
        if (newCriteria.assessment && newCriteria.weightage && newCriteria.totalMarks) {
            setCriteria([...criteria, { ...newCriteria }]);
            setNewCriteria({ assessment: '', weightage: '', totalMarks: '' });
        }
    };

    const handleSaveMarks = async () => {
        try {
            const marksData = {
                criteriaDefined: criteria,
                marksOfStudents: Object.keys(marks).map((studentId) => ({
                    studentId,
                    marks: marks[studentId],
                    grade: marks[studentId].grade,
                })),
            };

            await fs.collection('studentsMarks').doc(assignCourseId).set(marksData);

            setSaveMessage('Marks saved successfully!');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteCriteria = (index) => {
        setCriteria((prev) => prev.filter((_, i) => i !== index));
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                const { [criteria[index].assessment]: _, ...rest } = newMarks[studentId];
                newMarks[studentId] = rest;
            });
            return newMarks;
        });
    };

    const handleEditCriteria = (index) => {
        setEditingCriteria(index);
    };

    const handleSaveEditCriteria = (index, newAssessment, newWeightage, newTotalMarks) => {
        setCriteria((prev) =>
            prev.map((item, i) =>
                i === index ? { assessment: newAssessment, weightage: newWeightage, totalMarks: newTotalMarks } : item
            )
        );
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                if (newMarks[studentId][criteria[index].assessment] !== undefined) {
                    newMarks[studentId][newAssessment] = newMarks[studentId][criteria[index].assessment];
                    delete newMarks[studentId][criteria[index].assessment];
                }
            });
            return newMarks;
        });
        setEditingCriteria(-1);
    };

    const totalWeightage = criteria.reduce((total, item) => total + parseFloat(item.weightage), 0);

    const allCriteriaFilled = criteria.every(c => c.assessment && c.weightage && c.totalMarks);
    const allMarksEntered = students.every(student => criteria.every(c => marks[student.id]?.[c.assessment] !== undefined));

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
                        placeholder="Assessment"
                        value={newCriteria.assessment}
                        onChange={(e) => setNewCriteria({ ...newCriteria, assessment: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Weightage"
                        value={newCriteria.weightage}
                        onChange={(e) => setNewCriteria({ ...newCriteria, weightage: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Total Marks"
                        value={newCriteria.totalMarks}
                        onChange={(e) => setNewCriteria({ ...newCriteria, totalMarks: e.target.value })}
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
                                        value={criterion.assessment}
                                        onChange={(e) =>
                                            setCriteria((prev) =>
                                                prev.map((item, i) =>
                                                    i === index ? { ...item, assessment: e.target.value } : item
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
                                    <input
                                        type="number"
                                        value={criterion.totalMarks}
                                        onChange={(e) =>
                                            setCriteria((prev) =>
                                                prev.map((item, i) =>
                                                    i === index ? { ...item, totalMarks: e.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                    <button onClick={() => handleSaveEditCriteria(index, criterion.assessment, criterion.weightage, criterion.totalMarks)}>
                                        Save
                                    </button>
                                    <button onClick={() => setEditingCriteria(-1)}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <span>
                                        {criterion.assessment} ({criterion.weightage}%) Total Marks: {criterion.totalMarks}
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
                                        {criterion.assessment} ({criterion.weightage}%) (Total Marks: {criterion.totalMarks})
                                    </th>
                                ))}
                                {criteria.map((criterion, index) => (
                                    <th key={index}>
                                        {criterion.assessment} (Calculated)
                                    </th>
                                ))}
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    {criteria.map((criterion, index) => (
                                        <td key={index}>
                                            <input
                                                type="number"
                                                value={marks[student.id]?.[criterion.assessment] || ''}
                                                onChange={(e) =>
                                                    setMarks((prev) => ({
                                                        ...prev,
                                                        [student.id]: {
                                                            ...prev[student.id],
                                                            [criterion.assessment]: parseFloat(e.target.value),
                                                        },
                                                    }))
                                                }
                                                disabled={!isEditing}
                                            />
                                        </td>
                                    ))}
                                    {criteria.map((criterion, index) => (
                                        <td key={index}>
                                            {marks[student.id]?.[criterion.assessment] !== undefined
                                                ? (
                                                    (marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage
                                                ).toFixed(2)
                                                : ''
                                            }
                                        </td>
                                    ))}
                                    <td>
                                        <select
                                            value={marks[student.id]?.grade || 'I'}
                                            onChange={(e) =>
                                                setMarks((prev) => ({
                                                    ...prev,
                                                    [student.id]: {
                                                        ...prev[student.id],
                                                        grade: e.target.value,
                                                    },
                                                }))
                                            }
                                        >
                                            {grades.map((grade) => (
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No criteria defined yet</p>
                )}
                <button onClick={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered}>Save Marks</button>
                {saveMessage && <p>{saveMessage}</p>}
                <button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Stop Editing' : 'Edit Marks'}
                </button>
            </div>
        </div>
    );
};

export default Marking;
