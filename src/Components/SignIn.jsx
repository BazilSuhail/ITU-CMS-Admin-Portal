import React, { useState } from 'react';
import { auth, fs } from '../Config/Config';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('department');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === 'admin') {
        // Admin sign-in
        if (password === '112233') {
          navigate('/registerdepartment');
        } else {
          setError('Incorrect admin password.');
        }
      } else {
        // Sign in the user with Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (role === 'instructor') {
          // Fetch the instructor details from Firestore
          const instructorDoc = await fs.collection('instructors').doc(user.uid).get();
          if (instructorDoc.exists) {
            const instructorData = instructorDoc.data();
            // Redirect to the instructor's profile page
            navigate('/instructor-profile', { state: { name: instructorData.name, email: instructorData.email } });
          } else {
            setError('Instructor not found in database.');
          }
        } else if (role === 'department') {
          // Fetch the department details from Firestore
          const departmentDoc = await fs.collection('departments').doc(user.uid).get();
          if (departmentDoc.exists) {
            const departmentData = departmentDoc.data();
            // Redirect to the department's profile page
            navigate('/department-profile', { state: { name: departmentData.name, email: departmentData.email } });
          } else {
            setError('Department not found in database.');
          }
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="department">Department</option>
          </select>
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
