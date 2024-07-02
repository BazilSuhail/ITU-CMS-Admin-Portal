import React, { useState, useEffect } from 'react';
import { fs } from '../../Config/Config';
import { useParams, useNavigate } from 'react-router-dom';

const ClassStudents = () => {
    const { classId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const classDoc = await fs.collection('classes').doc(classId).get();
                if (classDoc.exists) {
                    const classData = classDoc.data();
                    const studentDataPromises = classData.studentsOfClass.map(studentId =>
                        fs.collection('students').doc(studentId).get()
                    );
                    const studentDocs = await Promise.all(studentDataPromises);
                    const studentsList = studentDocs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsList);
                } else {
                    setError('Class data not found.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [classId]);

    const handleViewEnrollments = (studentId) => {
        navigate(`/verify-enrollment/${classId}/${studentId}`);
    };

    const handleWithdrawEnrollments = (studentId) => {
        navigate(`/withdraw-enrollment/${classId}/${studentId}`);
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Students Applications</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <>
                    {students.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead class="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Student Name</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Email</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">DOB</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Enrollments</th>
                                            <th scope="col" class="px-6 py-3 whitespace-nowrap">Applications</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b  font-semibold text-lg'>
                                                <th scope='row' class="px-6 py-4 font-bold ">{student.name}</th>
                                                <td className="px-6 py-4">{student.dob}</td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                <td>
                                                    <button onClick={() => handleViewEnrollments(student.id)} className="whitespace-nowrap bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >View Enrollments</button>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleWithdrawEnrollments(student.id)} className="whitespace-nowrap bg-red-600 hover:bg-white hover:shadow-custom-light hover:text-red-600 text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >Withdraw Enrollments</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No students found.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ClassStudents;
