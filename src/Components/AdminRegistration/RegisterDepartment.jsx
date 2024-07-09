import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';

const RegisterDepartment = () => {
    const [department, setDepartment] = useState({
        name: '',
        abbreviation: '',
        email: '',
        password: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [openForm, setOpenForm] = useState(false);

    // Function to fetch departments from Firestore
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const snapshot = await fs.collection('departments').get();
            const departmentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                editable: false  // Add editable property to each department
            }));
            setDepartments(departmentList);
        } catch (error) {
            console.error('Error fetching departments: ', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleChange = (e, id) => {
        const { name, value } = e.target;
        setDepartments(prevDepartments => prevDepartments.map(dep =>
            dep.id === id ? { ...dep, [name]: value } : dep
        ));
    };

    const handleEditToggle = (id) => {
        setDepartments(prevDepartments => prevDepartments.map(dep =>
            dep.id === id ? { ...dep, editable: !dep.editable } : dep
        ));
    };

    const handleUpdateDepartment = async (id) => {
        try {
            setLoading(true);
            const departmentToUpdate = departments.find(dep => dep.id === id);

            await fs.collection('departments').doc(id).update({
                name: departmentToUpdate.name,
                abbreviation: departmentToUpdate.abbreviation,
                email: departmentToUpdate.email,
            });

            // Toggle editable state after update
            handleEditToggle(id);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterDepartment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const departmentCredential = await auth.createUserWithEmailAndPassword(department.email, department.password);
            const departmentUser = departmentCredential.user;

            await fs.collection('departments').doc(departmentUser.uid).set({
                name: department.name,
                abbreviation: department.abbreviation,
                email: department.email,
                createdAt: new Date()
            });

            await departmentUser.updateProfile({
                displayName: department.name
            });

            // Fetch departments again to update the list
            await fetchDepartments();

            setDepartment({
                name: '',
                abbreviation: '',
                email: '',
                password: ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Registered Departments Details</h2>
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
            ) : (
                <div className='flex flex-col '>

                    {/* Display departments in a table */}
                    {departments.length > 0 && (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Department's Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Department Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Depertment's Program</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Email Of students</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map(dep => (
                                            <tr key={dep.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg font-medium'>
                                                <td className="px-6 py-4">{dep.editable ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={dep.name}
                                                        onChange={(e) => handleChange(e, dep.id)}
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        required
                                                    />
                                                ) : dep.name}</td>
                                                <td className="px-6 py-4">{dep.editable ? (
                                                    <input
                                                        type="text"
                                                        name="abbreviation"
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        value={dep.abbreviation}
                                                        onChange={(e) => handleChange(e, dep.id)}
                                                        required
                                                    />
                                                ) : dep.abbreviation}</td>
                                                <td className="px-6 py-4">{dep.editable ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={dep.email}
                                                        className='rounded-lg p-[4px] shadow-custom-light text-lg font-bold'
                                                        onChange={(e) => handleChange(e, dep.id)}
                                                        required
                                                    />
                                                ) : dep.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {dep.editable ? (
                                                        <>
                                                            <button onClick={() => handleUpdateDepartment(dep.id)} className="whitespace-nowrap bg-green-900 mr-[15px] w-[75px] hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">
                                                                Save
                                                            </button>
                                                            <button onClick={() => handleEditToggle(dep.id)} className="whitespace-nowrap bg-red-900 hover:bg-white  w-[75px] hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleEditToggle(dep.id)} className="whitespace-nowrap bg-custom-blue hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[25px] font-semibold text-white rounded-xl">
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
                        {openForm ? 'Close Registration' : 'Register Department'}
                    </button>
                    {openForm && (
                        <div className='my-[8px] flex flex-col w-[95%] lg::w-[65%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Register Department</h2>
                            <form onSubmit={handleRegisterDepartment}>
                                <label className="block text-lg font-medium text-gray-700" htmlFor="departmentName">Department Name:</label>
                                <input
                                    type="text"
                                    id="departmentName"
                                    name="name"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    value={department.name}
                                    onChange={(e) => setDepartment(prevState => ({ ...prevState, name: e.target.value }))}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="departmentAbbreviation">Abbreviation:</label>
                                <input
                                    type="text"
                                    id="departmentAbbreviation"
                                    name="abbreviation"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                    value={department.abbreviation}
                                    onChange={(e) => setDepartment(prevState => ({ ...prevState, abbreviation: e.target.value }))}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="departmentEmail">Department Email:</label>
                                <input
                                    type="email"
                                    id="departmentEmail"
                                    name="email"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                    value={department.email}
                                    onChange={(e) => setDepartment(prevState => ({ ...prevState, email: e.target.value }))}
                                    required
                                />
                                <label className="block text-lg font-medium text-gray-700" htmlFor="departmentPassword">Password:</label>
                                <input
                                    type="password"
                                    id="departmentPassword"
                                    className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                    name="password"
                                    value={department.password}
                                    onChange={(e) => setDepartment(prevState => ({ ...prevState, password: e.target.value }))}
                                    required
                                />
                                <button type="submit" disabled={loading} className="w-full mt-[10px] bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-blue-900 focus:outline-none focus:bg-blue-900"
                                >
                                    {loading ? 'Registering...' : 'Register Department'}
                                </button>
                            </form>
                        </div>
                    )}
                    {/* Display error message if there's an error */}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default RegisterDepartment;
