import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config'; // Ensure you import auth and fs from your Firebase config

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetchUserType = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const departmentDoc = await fs.collection("departments").doc(user.uid).get();
          if (departmentDoc.exists) {
            setUserType("department");
          } else {
            const instructorDoc = await fs.collection("instructors").doc(user.uid).get();
            if (instructorDoc.exists) {
              setUserType("instructor");
            } else {
              // Assuming admin is the fallback if not found in department or instructor
              setUserType("admin");
            }
          }
        } catch (error) {
          console.error("Error fetching user type: ", error);
          setUserType(""); // Set to empty if there's an error
        }
      } else {
        setUserType(""); // No user is logged in
      }
    };

    // Fetch user type when component mounts
    fetchUserType();

    // Optionally, you can set up a listener for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserType();
      } else {
        setUserType(""); // No user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [setUserType]);

  return (
    <AuthContext.Provider value={{ userType, setUserType }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
