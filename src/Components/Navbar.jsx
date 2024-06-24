import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from '../Config/Config';
import "../Styles/navbar.css";

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
        <NavLink to="/student-creation" className="nav-links">Student Creation</NavLink>


        <NavLink to="/instructor-profile" className="nav-links">Instructor Profile</NavLink> 

        <button onClick={handleLogout} className="logout-button">Logout</button>
        {
          /*
        
        <NavLink to="/registerdepartment" className="nav-links">Admin Registering</NavLink>
        <NavLink to="/" className="nav-links">Sign In</NavLink>
        <NavLink to="/department-profile" className="nav-links">Department-profile</NavLink>
        <NavLink to="/checkthenrollment" className="nav-links">Approve enrollment</NavLink>
        <NavLink to="/student-creation" className="nav-links">Student Creation</NavLink>
        <NavLink to="/instructor-profile" className="nav-links">Instructor-profile</NavLink>
        */
        }
      </div>
    </div>
  );
};

export default Navbar;