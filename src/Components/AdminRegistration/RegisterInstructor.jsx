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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Register Instructor</h2>
            <form onSubmit={handleRegisterInstructor}>
                <div>
                    <label htmlFor="instructorName">Instructor Name:</label>
                    <input
                        type="text"
                        id="instructorName"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorEmail">Instructor Email:</label>
                    <input
                        type="email"
                        id="instructorEmail"
                        value={instructorEmail}
                        onChange={(e) => setInstructorEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorPassword">Password:</label>
                    <input
                        type="password"
                        id="instructorPassword"
                        value={instructorPassword}
                        onChange={(e) => setInstructorPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorPhone">Phone:</label>
                    <input
                        type="text"
                        id="instructorPhone"
                        value={instructorPhone}
                        onChange={(e) => setInstructorPhone(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorDob">Date of Birth:</label>
                    <input
                        type="date"
                        id="instructorDob"
                        value={instructorDob}
                        onChange={(e) => setInstructorDob(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Instructor'}
                </button>
            </form>

            {/* Display instructors in a table */}
            {instructors.length > 0 && (
                <div>
                    <h2>Registered Instructors</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Date of Birth</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.map(inst => (
                                <tr key={inst.id}>
                                    <td>{inst.editable ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={inst.name}
                                            onChange={(e) => handleChange(e, inst.id)}
                                            required
                                        />
                                    ) : inst.name}</td>
                                    <td>{inst.editable ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={inst.email}
                                            onChange={(e) => handleChange(e, inst.id)}
                                            required
                                        />
                                    ) : inst.email}</td>
                                    <td>{inst.editable ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={inst.phone}
                                            onChange={(e) => handleChange(e, inst.id)}
                                            required
                                        />
                                    ) : inst.phone}</td>
                                    <td>{inst.editable ? (
                                        <input
                                            type="date"
                                            name="dob"
                                            value={inst.dob}
                                            onChange={(e) => handleChange(e, inst.id)}
                                            required
                                        />
                                    ) : inst.dob}</td>
                                    <td>
                                        {inst.editable ? (
                                            <>
                                                <button onClick={() => handleUpdateInstructor(inst.id)}>Save</button>
                                                <button onClick={() => handleEditToggle(inst.id)}>Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditToggle(inst.id)}>Edit</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Display error message if there's an error */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default RegisterInstructor;
