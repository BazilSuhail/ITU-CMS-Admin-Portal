import React, { useState, useEffect } from 'react';
import { auth, fs, st } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';

const RegisterInstructor = () => {
    const [instructor, setInstructor] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        nationality: '',
        address: '',
        city: '',
        profileUrl: ''
    });
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [file, setFile] = useState(null);
    const [editingInstructorId, setEditingInstructorId] = useState(null);

    // Function to fetch instructors from Firestore
    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const snapshot = await fs.collection('instructors').get();
            const instructorList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
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

    const handleEdit = (id) => {
        const instructorToEdit = instructors.find(inst => inst.id === id);
        setInstructor(instructorToEdit);
        setEditingInstructorId(id);
    };

    const handleUpdateInstructor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (file) {
                // Upload profile picture
                const storageRef = st.ref(`instructorProfilePhotos/${auth.currentUser.uid}`);
                await storageRef.put(file);
                instructor.profileUrl = await storageRef.getDownloadURL();
            }

            // Update instructor data in Firestore
            await fs.collection('instructors').doc(editingInstructorId).update({
                ...instructor
            });

            // Reset the form and state
            setInstructor({
                name: '',
                email: '',
                password: '',
                phone: '',
                dob: '',
                nationality: '',
                address: '',
                city: '',
                profileUrl: ''
            });
            setEditingInstructorId(null);
            setSuccess('Instructor updated successfully!');
            alert(success);
            fetchInstructors();  // Refresh the list of instructors
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
        setSuccess(null);

        try {
            // Register the new instructor
            const userCredential = await auth.createUserWithEmailAndPassword(instructor.email, instructor.password);
            const user = userCredential.user;

            let profilePhotoUrl = '';

            if (file) {
                // Upload profile picture
                const storageRef = st.ref(`instructorProfilePhotos/${user.uid}`);
                await storageRef.put(file);
                profilePhotoUrl = await storageRef.getDownloadURL();
            }

            // Store instructor data in Firestore
            await fs.collection('instructors').doc(user.uid).set({
                ...instructor,
                profileUrl: profilePhotoUrl, // Add profile URL
                createdAt: new Date()
            });

            // Reset the form and set success message
            setInstructor({
                name: '',
                email: '',
                password: '',
                phone: '',
                dob: '',
                nationality: '',
                address: '',
                city: '',
                profileUrl: ''
            });
            setSuccess('Instructor registered successfully!');
            fetchInstructors();  // Refresh the list of instructors
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div className='h-full w-full'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Registered Instructors</h2>
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
                <div className='flex xl:w-[85%] xl:mx-auto flex-col'>
                    {instructors.length > 0 && (
                        <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold'>Instructors Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor Name</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor Email</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor's Contact</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Joined Since</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {instructors.map(inst => (
                                            <tr key={inst.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg font-medium'>
                                                <td className="px-6 py-4">{inst.name}</td>
                                                <td className="px-6 py-4">{inst.email}</td>
                                                <td className="px-6 py-4">{inst.phone}</td>
                                                <td className="px-6 py-4">{inst.dob}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleEdit(inst.id)} className="whitespace-nowrap bg-green-800 w-[75px] hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl'>

                        {error && <p className='text-red-600'>{error}</p>}
                        {success && <p className='text-green-600'>{success}</p>}
                        <h2 className='text-2xl text-custom-blue mb-[8px] font-bold'>{editingInstructorId ? 'Edit Instructor' : 'Register New Instructor'}</h2>
                        <form onSubmit={editingInstructorId ? handleUpdateInstructor : handleRegisterInstructor} className='flex flex-col space-y-6'>
                            <input
                                type="text"
                                name="name"
                                value={instructor.name}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Instructor Name"
                                onChange={(e) => setInstructor(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={instructor.email}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Instructor Email"
                                onChange={(e) => setInstructor(prev => ({ ...prev, email: e.target.value }))}
                                required
                            />
                            {editingInstructorId ? null : (
                                <input
                                    type="password"
                                    name="password"
                                    value={instructor.password}
                                    className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                    placeholder="Password"
                                    onChange={(e) => setInstructor(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                />
                            )}
                            <input
                                type="text"
                                name="phone"
                                value={instructor.phone}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Phone Number"
                                onChange={(e) => setInstructor(prev => ({ ...prev, phone: e.target.value }))}
                                required
                            />
                            <input
                                type="date"
                                name="dob"
                                value={instructor.dob}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Date of Birth"
                                onChange={(e) => setInstructor(prev => ({ ...prev, dob: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                name="nationality"
                                value={instructor.nationality}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Nationality"
                                onChange={(e) => setInstructor(prev => ({ ...prev, nationality: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                value={instructor.address}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="Address"
                                onChange={(e) => setInstructor(prev => ({ ...prev, address: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                name="city"
                                value={instructor.city}
                                className='rounded-lg p-[8px] shadow-custom-light text-lg font-medium'
                                placeholder="City"
                                onChange={(e) => setInstructor(prev => ({ ...prev, city: e.target.value }))}
                                required
                            />
                            <input
                                type="file"
                                name="profileUrl"
                                onChange={handleFileChange}
                            />
                            <button type="submit" className='bg-blue-600 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded'>
                                {editingInstructorId ? 'Update Instructor' : 'Register Instructor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterInstructor;
