import React, { useState, useEffect } from 'react';
import { fs,auth } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';
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
 
    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Registered Classes Data</h2>
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
                <div> 
                    {classes.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Class Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map((cls) => (
                                            <tr key={cls.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b  font-semibold text-md'>
                                                <th scope='row' className="px-6 py-4 font-bold ">{cls.name}</th>
                                                <td>
                                                    <button onClick={() => handleViewStudents(cls.id)}  className="whitespace-nowrap bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >View Students</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>

                        </div>
                    ) : (
                        <p>No classes found.</p>
                    )}
                </div>
            )}
        </div>
    );
};
export default AssignResults;
