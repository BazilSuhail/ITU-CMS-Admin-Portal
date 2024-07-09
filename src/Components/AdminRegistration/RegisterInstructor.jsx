import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';

const RegisterInstructor = () => {
    const [instructorName, setInstructorName] = useState('');
    const [instructorEmail, setInstructorEmail] = useState('');
    const [instructorPassword, setInstructorPassword] = useState('');
    const [instructorPhone, setInstructorPhone] = useState('');
    const [instructorDob, setInstructorDob] = useState('');
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [openForm, setOpenForm] = useState(false);

    // Function to fetch instructors from Firestore
    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const snapshot = await fs.collection('instructors').get();
            const instructorList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                editable: false  // Add editable property to each instructor
            }));
            setInstructors(instructorList);
        } catch (error) {
            console.error('Error fetching instructors: ', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch instructors on component mount
    useEffect(() => {
        fetchInstructors();
    }, []);

    const handleChange = (e, id) => {
        const { name, value } = e.target;
        setInstructors(prevInstructors =>
            prevInstructors.map(inst =>
                inst.id === id ? { ...inst, [name]: value } : inst
            )
        );
    };

    const handleEditToggle = (id) => {
        setInstructors(prevInstructors =>
            prevInstructors.map(inst =>
                inst.id === id ? { ...inst, editable: !inst.editable } : inst
            )
        );
    };

    const handleUpdateInstructor = async (id) => {
        try {
            setLoading(true);
            const instructorToUpdate = instructors.find(inst => inst.id === id);

            await fs.collection('instructors').doc(id).update({
                name: instructorToUpdate.name,
                email: instructorToUpdate.email,
                phone: instructorToUpdate.phone,
                dob: instructorToUpdate.dob,
            });

            // Toggle editable state after update
            handleEditToggle(id);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterInstructor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const instructorCredential = await auth.createUserWithEmailAndPassword(instructorEmail, instructorPassword);
            const instructorUser = instructorCredential.user;

            await fs.collection('instructors').doc(instructorUser.uid).set({
                name: instructorName,
                email: instructorEmail,
                phone: instructorPhone,
                dob: instructorDob,
                createdAt: new Date()
            });

            await instructorUser.updateProfile({
                displayName: instructorName
            });

            setInstructorName('');
            setInstructorEmail('');
            setInstructorPassword('');
            setInstructorPhone('');
            setInstructorDob('');

            // Fetch instructors again to update the list
            await fetchInstructors();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Registered Instructors</h2>
            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className='flex flex-col '>
                    {instructors.length > 0 && (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Instructors Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor Email </th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor's Contact</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Joined Since</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {instructors.map(inst => (
                                            <tr key={inst.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg font-medium'>
                                                <td className="px-6 py-4">{inst.editable ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={inst.name}
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        onChange={(e) => handleChange(e, inst.id)}
                                                        required
                                                    />
                                                ) : inst.name}</td>
                                                <td className="px-6 py-4">{inst.editable ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={inst.email}
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        onChange={(e) => handleChange(e, inst.id)}
                                                        required
                                                    />
                                                ) : inst.email}</td>
                                                <td className="px-6 py-4">{inst.editable ? (
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        value={inst.phone}
                                                        onChange={(e) => handleChange(e, inst.id)}
                                                        required
                                                    />
                                                ) : inst.phone}</td>
                                                <td className="px-6 py-4">{inst.editable ? (
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={inst.dob}
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        onChange={(e) => handleChange(e, inst.id)}
                                                        required
                                                    />
                                                ) : inst.dob}</td>
                                                <td className="px-6 py-4">
                                                    {inst.editable ? (
                                                        <>
                                                            <button className="whitespace-nowrap bg-green-900 mr-[15px] w-[75px] hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" onClick={() => handleUpdateInstructor(inst.id)}>Save</button>
                                                            <button onClick={() => handleEditToggle(inst.id)} className="whitespace-nowrap bg-red-900 hover:bg-white  w-[75px] hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">Cancel</button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleEditToggle(inst.id)} className="whitespace-nowrap bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[25px] font-semibold text-white rounded-xl">
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div> 
                    )}

                    <button className='ml-auto mr-[20px] mt-[20px] bg-custom-blue rounded-lg text-white text-lg py-[5px] px-[10px]' onClick={() => { setOpenForm(!openForm) }}>
                        {openForm ? 'Close Registration' : 'Register Instructor'}
                    </button>

                    {openForm && (
                        <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Register Department</h2>
                            <form onSubmit={handleRegisterInstructor}>
                                <label className="block text-lg font-medium text-gray-700" htmlFor="instructorName">Instructor Name:</label>
                                <input
                                    type="text"
                                    id="instructorName"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                    value={instructorName}
                                    onChange={(e) => setInstructorName(e.target.value)}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="instructorEmail">Instructor Email:</label>
                                <input
                                    type="email"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    id="instructorEmail"
                                    value={instructorEmail}
                                    onChange={(e) => setInstructorEmail(e.target.value)}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="instructorPassword">Password:</label>
                                <input
                                    type="password"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    id="instructorPassword"
                                    value={instructorPassword}
                                    onChange={(e) => setInstructorPassword(e.target.value)}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="instructorPhone">Phone:</label>
                                <input
                                    type="text"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    id="instructorPhone"
                                    value={instructorPhone}
                                    onChange={(e) => setInstructorPhone(e.target.value)}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="instructorDob">Date of Birth:</label>
                                <input
                                    type="date"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    id="instructorDob"
                                    value={instructorDob}
                                    onChange={(e) => setInstructorDob(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={loading} className="w-full mt-[10px] font-bold bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-blue-900 focus:outline-none focus:bg-blue-900"
                                >
                                    {loading ? 'Registering...' : 'Register Instructor'}
                                </button>
                            </form>
                        </div>
                    )}


                    {/* Display error message if there's an error */}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>)}
        </div>
    );
};

export default RegisterInstructor;
