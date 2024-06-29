import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs ,FieldValue} from '../../Config/Config';

const gradePoints = {
  'A+': 4.00,
  'A': 4.00,
  'A-': 3.67,
  'B+': 3.33,
  'B': 3.00,
  'B-': 2.67,
  'C+': 2.33,
  'C': 2.00,
  'C-': 1.67,
  'D+': 1.33,
  'D': 1.00,
  'F': 0.00,
  'I': 0.00 // Incomplete
};

const AssignSemesterResult = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [semester, setSemester] = useState('');
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);

      try {
        const studentDoc = await fs.collection('students').doc(studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          const courseIds = studentData.currentCourses || [];

          const courseDataPromises = courseIds.map(async (courseId) => {
            const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
            if (assignCourseDoc.exists) {
              const assignCourseData = assignCourseDoc.data();
              const actualCourseId = assignCourseData.courseId;

              const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
              if (courseDoc.exists) {
                const courseData = courseDoc.data();
                const marksDoc = await fs.collection('studentsMarks').doc(courseId).get();
                let grade = 'No grade assigned';
                if (marksDoc.exists) {
                  const marksData = marksDoc.data();
                  const studentMarks = marksData.marksOfStudents.find(student => student.studentId === studentId);
                  if (studentMarks) {
                    grade = studentMarks.grade;
                  }
                }
                return {
                  courseId: actualCourseId,
                  courseName: courseData.name || 'Unknown Course',
                  creditHours: courseData.creditHours || 0,
                  grade: grade,
                };
              }
            }
            return null;
          });

          const courses = await Promise.all(courseDataPromises);
          setCurrentCourses(courses.filter(course => course !== null));
        } else {
          setError('Student data not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCreditHours = 0;

    currentCourses.forEach(course => {
      if (gradePoints[course.grade] !== undefined) {
        totalPoints += gradePoints[course.grade] * course.creditHours;
        totalCreditHours += parseInt(course.creditHours);
      }
    });

    const calculatedGpa = totalCreditHours > 0 ? (totalPoints / totalCreditHours).toFixed(2) : 'N/A';
    setGpa(calculatedGpa);
  };

  const allGradesAssigned = currentCourses.every(course => course.grade !== 'No grade assigned');

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setIsCodeValid(e.target.value === '112233');
  };

  const handleSaveResults = async () => {
    if (semester === '' || !isCodeValid) return;

    setLoading(true);
    setError(null);

    try {
      const studentDocRef = fs.collection('students').doc(studentId);

      await studentDocRef.update({
        completedCourses: [...currentCourses.map(course => course.courseId)],
        results: FieldValue.arrayUnion({ semester, gpa }),
        currentCourses: []
      });

      await Promise.all(
        currentCourses.map(course => 
          fs.collection('assignCourses').doc(course.courseId).delete()
        )
      );

      setCurrentCourses([]);
      setGpa(null);
      setSemester('');
      setCode('');
      setIsCodeValid(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
      <h2>Assign Semester Result</h2>
      {currentCourses.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Credit Hours</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseId}</td>
                <td>{course.courseName}</td>
                <td>{course.creditHours}</td>
                <td>{course.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No current courses found.</p>
      )}
      {allGradesAssigned ? (
        <>
          <button onClick={calculateGPA}>Calculate GPA</button>
          {gpa !== null && (
            <>
              <p>GPA: {gpa}</p>
              <div>
                <label>
                  Select Semester:
                  <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                    <option value="">Select</option>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Enter Code to Confirm:
                  <input type="text" value={code} onChange={handleCodeChange} />
                </label>
              </div>
              <button disabled={!isCodeValid} onClick={handleSaveResults}>Save Results</button>
            </>
          )}
        </>
      ) : (
        <p>Assign all grades to enable GPA calculation</p>
      )}
    </div>
  );
};

export default AssignSemesterResult;
