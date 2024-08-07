import React, { useState, useEffect } from 'react';
import { fs } from '../../Config/Config';
import { useParams, useNavigate } from 'react-router-dom';
import { Circles } from 'react-loader-spinner';


const StudentsInClass = () => {
    const { classId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const naviagate = useNavigate();

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

    const handleResultAssign = (studentId) => {

        naviagate(`/assign-results/${classId}/${studentId}`);
    };
    const handleEditProfile = (studentId) => {

        naviagate(`/edit-profile/${classId}/${studentId}`);
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Students Applications</h2>
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
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                        <>                            
                    {students.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Student Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Email</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">DOB</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Compile Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b  font-semibold text-lg'>
                                                <th scope='row' className="px-6 py-4 font-bold ">{student.name}</th>
                                                <td className="px-6 py-4">{student.dob}</td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                <td>
                                                    <button onClick={() => handleResultAssign(student.id)} className="whitespace-nowrap bg-green-800 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                        Compile Result
                                                    </button>
                                                    <button onClick={() => handleEditProfile(student.id)} className="whitespace-nowrap bg-blue-800 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                        Edit Bio
                                                    </button>
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

export default StudentsInClass;
