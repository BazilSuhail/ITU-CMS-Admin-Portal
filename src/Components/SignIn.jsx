import React, { useState } from 'react';
import { auth, fs } from '../Config/Config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import logo from "./itu.png"

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('department');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUserType } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === 'admin') {
        // Admin sign-in
        if (password === '112233') {
          setUserType('admin');
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
            setUserType('instructor');
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
            setUserType('department');
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

  const handleRoleChange = (role) => {
    setRole(role);
  };
  return (
    <div className='fixed mt-[-85px] text-white bg-custom-blue w-screen h-[125vh] z-50'>
      <img src={logo} alt="" className='mx-auto xsx:w-[200px] xsx:mt-[45px] mt-[65px] w-[150px] h-[150px] xsx:h-[200px] rounded-[50%] my-[20px]' />
      <div className='w-[100vw] md:w-[600px] mx-auto p-[8px] md:p-[20px] flex flex-col items-center'>

        <h2 className='text-3xl font-bold xsx:mt-[-20px] mb-[15px]'>Admin Portal</h2>
        <div className='h-[3px] w-[95%] mx-auto mb-[25px] bg-blue-50'></div>
        {error && <p className='text-red-500 font-medium '>{error}</p>}

        <form onSubmit={handleSignIn} className='flex flex-col w-[95%]'>
          <div className='text-lg text-blue-200 mb-[5px] font-normal'>Select Role to Continue:</div>
          <div className="flex justify-between my-[7px] px-[2px]">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-500 appearance-none rounded-md border-2 border-blue-500 checked:bg-blue-500 checked:border-transparent focus:outline-none"
                checked={role === 'admin'}
                onChange={() => handleRoleChange('admin')}
              />
              <span className="ml-2 text-lg font-normal text-white">Admin</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-500 appearance-none rounded-md border-2 border-blue-500 checked:bg-blue-500 checked:border-transparent focus:outline-none"
                checked={role === 'department'}
                onChange={() => handleRoleChange('department')}
              />
              <span className="ml-2 text-lg font-normal text-white">Department</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-500 appearance-none rounded-md border-2 border-blue-500 checked:bg-blue-500 checked:border-transparent focus:outline-none"
                checked={role === 'instructor'}
                onChange={() => handleRoleChange('instructor')}
              />
              <span className="ml-2 text-lg font-normal text-white">Instructor</span>
            </label>
          </div>

          <div className='text-lg text-blue-200 mb-[5px] font-normal'>Email:</div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='rounded-lg bg-custom-blue border placeholder:font-thin font-normal text-lg text-white p-[8px] border-white'
            required
          />
          <div className='text-lg text-blue-200 mb-[5px] mt-[15px] font-normal'>Password:</div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='rounded-lg bg-custom-blue border placeholder:font-thin font-normal text-lg text-white p-[8px] border-white'
            required
          />

          <button type="submit" className='bg-blue-600 w-[100%] font-medium p-[8px] text-2xl rounded-2xl my-[35px]' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
