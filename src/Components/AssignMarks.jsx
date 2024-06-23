import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs } from '../Config/Config';

const AssignMarks = () => {
  const { assignCourseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [marks, setMarks] = useState({});

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
            const studentsData = await Promise.all(studentsList.map(async studentId => {
              const studentDoc = await fs.collection('students').doc(studentId).get();
              return {
                id: studentDoc.id,
                name: studentDoc.data().name,
              };
            }));
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

  const handleMarksChange = (studentId, subject, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: parseFloat(value),
      },
    }));
  };

  const handleSaveMarks = async () => {
    try {
      const marksData = {
        criteriaDefined: criteria,
        marksOfStudents: Object.keys(marks).map(studentId => ({
          studentId,
          marks: marks[studentId],
        })),
      };

      await fs.collection('studentsMarks').doc(assignCourseId).set(marksData);
      alert('Marks saved successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Assign Marks</h2>
      {criteria.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              {criteria.map((criterion, index) => (
                <th key={index}>{criterion.subject} ({criterion.weightage}%)</th>
              ))}
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
                      value={marks[student.id]?.[criterion.subject] || ''}
                      onChange={(e) =>
                        handleMarksChange(student.id, criterion.subject, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No criteria defined yet.</p>
      )}
      <button onClick={handleSaveMarks}>Save Marks</button>
    </div>
  );
};

export default AssignMarks;
