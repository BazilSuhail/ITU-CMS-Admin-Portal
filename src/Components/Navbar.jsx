import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, fs } from '../Config/Config'; 

const Navbar = () => {
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      const user = auth.currentUser;
      if (user) {
        const departmentDoc = await fs.collection("departments").doc(user.uid).get();
        if (departmentDoc.exists) {
          setUserType("department");
        } else {
          const instructorDoc = await fs.collection("instructors").doc(user.uid).get();
          if (instructorDoc.exists) {
            setUserType("instructor");
          } else {
            setUserType("admin");
          }
        }
      }
    };

    fetchUserType();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="links">
        {userType === "department" && (
          <>
          <NavLink to="/department-profile" className="nav-links">Department Profile</NavLink>
          <NavLink to="/checkthenrollment" className="nav-links">Approve Enrollment</NavLink>
          <NavLink to="/assignResults" className="nav-links">Assign Results</NavLink>
          <NavLink to="/student-creation" className="nav-links">Student Creation</NavLink>
          </>
        )}
        {userType === "instructor" && (
          <NavLink to="/instructor-profile" className="nav-links">Instructor Profile</NavLink>
        )}
        {userType === "admin" && (
          <>
          <NavLink to="/registerdepartment" className="nav-links">Register Departments</NavLink>
          <NavLink to="/registerinstructor" className="nav-links">Register Instructor</NavLink>
          <NavLink to="/registercourse" className="nav-links">Register Course</NavLink>
          </>
        )}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;


/*import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from '../Config/Config'; 

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <div className={"navbar"}>

      <div className="links">


        <NavLink to="/registerdepartment" className="nav-links">Register Departments</NavLink>
        <NavLink to="/registerinstructor" className="nav-links">Register Instructor</NavLink>
        <NavLink to="/registercourse" className="nav-links">Register Course</NavLink>


        <NavLink to="/department-profile" className="nav-links">Department Profile</NavLink>
        <NavLink to="/checkthenrollment" className="nav-links">Approve Enrollment</NavLink>
        <NavLink to="/assignResults" className="nav-links">Assign Results</NavLink>
        <NavLink to="/student-creation" className="nav-links">Student Creation</NavLink>


        <NavLink to="/instructor-profile" className="nav-links">Instructor Profile</NavLink> 

        <button onClick={handleLogout} className="logout-button">Logout</button>
        
        <NavLink to="/registerdepartment" className="nav-links">Admin Registering</NavLink>
        <NavLink to="/" className="nav-links">Sign In</NavLink>
        <NavLink to="/department-profile" className="nav-links">Department-profile</NavLink>
        <NavLink to="/checkthenrollment" className="nav-links">Approve enrollment</NavLink>
        <NavLink to="/student-creation" className="nav-links">Student Creation</NavLink>
        <NavLink to="/instructor-profile" className="nav-links">Instructor-profile</NavLink>
        
      </div>
    </div>
  );
};

export default Navbar;*/