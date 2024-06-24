import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';

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
        <div>
            <h2>Register Department</h2>
            <form onSubmit={handleRegisterDepartment}>
                <div>
                    <label htmlFor="departmentName">Department Name:</label>
                    <input
                        type="text"
                        id="departmentName"
                        name="name"
                        value={department.name}
                        onChange={(e) => setDepartment(prevState => ({ ...prevState, name: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departmentAbbreviation">Abbreviation:</label>
                    <input
                        type="text"
                        id="departmentAbbreviation"
                        name="abbreviation"
                        value={department.abbreviation}
                        onChange={(e) => setDepartment(prevState => ({ ...prevState, abbreviation: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departmentEmail">Department Email:</label>
                    <input
                        type="email"
                        id="departmentEmail"
                        name="email"
                        value={department.email}
                        onChange={(e) => setDepartment(prevState => ({ ...prevState, email: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departmentPassword">Password:</label>
                    <input
                        type="password"
                        id="departmentPassword"
                        name="password"
                        value={department.password}
                        onChange={(e) => setDepartment(prevState => ({ ...prevState, password: e.target.value }))}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Department'}
                </button>
            </form>

            {/* Display departments in a table */}
            {departments.length > 0 && (
                <div>
                    <h2>Registered Departments</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Abbreviation</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dep => (
                                <tr key={dep.id}>
                                    <td>{dep.editable ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={dep.name}
                                            onChange={(e) => handleChange(e, dep.id)}
                                            required
                                        />
                                    ) : dep.name}</td>
                                    <td>{dep.editable ? (
                                        <input
                                            type="text"
                                            name="abbreviation"
                                            value={dep.abbreviation}
                                            onChange={(e) => handleChange(e, dep.id)}
                                            required
                                        />
                                    ) : dep.abbreviation}</td>
                                    <td>{dep.editable ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={dep.email}
                                            onChange={(e) => handleChange(e, dep.id)}
                                            required
                                        />
                                    ) : dep.email}</td>
                                    <td>
                                        {dep.editable ? (
                                            <>
                                                <button onClick={() => handleUpdateDepartment(dep.id)}>Save</button>
                                                <button onClick={() => handleEditToggle(dep.id)}>Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditToggle(dep.id)}>Edit</button>
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

export default RegisterDepartment;
