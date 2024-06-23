import React from "react";
import { NavLink } from "react-router-dom"; 
import "../Styles/navbar.css"; 
 
const Navbar = () => { 

  return (
    <div className={"navbar"}>
       
      <div className="links">
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

export default Navbar;