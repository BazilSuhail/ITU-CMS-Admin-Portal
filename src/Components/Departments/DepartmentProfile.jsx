import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';

const DepartmentProfile = () => {
    const [departmentData, setDepartmentData] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [className, setClassName] = useState('');
    const [classLoading, setClassLoading] = useState(false);
    const [classError, setClassError] = useState(null);
    const [classSuccess, setClassSuccess] = useState(null);
    const [classes, setClasses] = useState([]);

    const [openForm, setOpenForm] = useState(false);

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
                    }
                    else {
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
        return <div className='w-screen h-[calc(98vh-195px)] flex flex-col justify-center items-center'>
            <Circles
                height="60"
                width="60"
                color="rgb(0, 63, 146)"
                ariaLabel="circles-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className='h-full w-full flex flex-col'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Department Profile</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

            {departmentData && (
                <div className='grid grid-cols-1 xsx:grid-cols-3 gap-x-[6px] gap-y-[15px] p-[8px]'>
                    <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                        <div className='ml-[5px] text-md'>Roll Number:</div>
                        <div className='text-3xl xsx:text-2xl '>{departmentData.name}</div>
                    </div>
                    <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                        <div className='ml-[5px] text-md'>Roll Number:</div>
                        <div className='text-3xl xsx:text-2xl '>{departmentData.email}</div>
                    </div>
                    <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                        <div className='ml-[5px] text-md'>Roll Number:</div>
                        <div className='text-3xl xsx:text-2xl '>{departmentData.abbreviation}</div>
                    </div>
                </div>
            )}


            {classes.length > 0 ? (

                <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                    <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                <tr className='text-center'>
                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Class Name</th>
                                    <th scope="col" className="px-6 py-3 whitespace-nowrap">Number Of students</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white'>
                                {classes.map((cls) => (
                                    <tr key={cls.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                                        <th scope="row" className="px-6 py-4 font-bold ">{cls.name}</th>
                                        <td className="px-6 py-4">{cls.studentsOfClass.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p>No classes found.</p>
            )}


            <button className='ml-auto mr-[20px] mt-[20px] bg-custom-blue rounded-lg text-white text-lg py-[5px] px-[10px]' onClick={() => { setOpenForm(!openForm) }}>
                {openForm ? 'Close Registration' : 'Register Class'}
            </button>

            {openForm && (
                <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                    <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Create Class</h2>
                    {classError && <p className="text-red-500 mb-2">{classError}</p>}
                    {classSuccess && <p className="text-green-500 mb-2">{classSuccess}</p>}
                    <form onSubmit={handleCreateClass}>
                        <div className="mb-4">
                            <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name:</label>
                            <input
                                type="text"
                                id="className"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={classLoading}
                            className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        >
                            {classLoading ? 'Creating...' : 'Create Class'}
                        </button>
                    </form>
                </div>
            )}

        </div>
    );
};

export default DepartmentProfile;
