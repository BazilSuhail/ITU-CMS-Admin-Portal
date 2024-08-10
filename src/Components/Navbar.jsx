import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from '../Config/Config';
import { useAuth } from "./AuthContext";
import { IoMdLogOut } from "react-icons/io";
import profile from "./itu.png"


import { FiX } from "react-icons/fi";
import { CgMenuLeftAlt } from "react-icons/cg";

const Navbar = () => {
 
  const { userType, setUserType } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUserType(""); // Clear the user type on logout
      navigate("/");
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  };

  const linkStyles = "text-md my-[8px] ml-[15px] border-black border-2 hover:border-white px-[8px] py-[5px] flex items-center font-medium rounded-xl";
  const activeLinkStyles = "bg-white text-black";

  return (
    <nav className="w-[98vw] mx-auto h-[80px] p-[4px]">
      {userType === "department" && (
        <>
          <div className="bg-custom-blue h-[100%] flex items-center justify-between rounded-lg">
            <img src={profile} alt="" className="ml-[25px] w-[55px] h-[55px] " />
            <button className="xsx:hidden text-white m-[15px]" onClick={toggleMenu}>
              {isOpen ? <></> : <CgMenuLeftAlt size={24} />}
            </button>

            <div className="xsx:flex hidden text-md items-center text-white">
              <NavLink to="/department-profile" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Dashboard</NavLink>
              <NavLink to="/assign-courses" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Course Details</NavLink>
              <NavLink to="/checkthenrollment" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Enrollment</NavLink>
              <NavLink to="/assignResults" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Result Compilation</NavLink>
              <NavLink to="/student-creation" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium border-blue-800 bg-blue-800 border-2 rounded-lg hover:bg-custom-blue hover:border-white text-white p-[2px] lg:p-[5px] ">Registerations</NavLink>
            </div>

            <button className="text-lg bg-red-600 text-white rounded-md  w-[100px] h-[36px] my-auto mr-[10px] xsx:flex hidden items-center" onClick={handleLogout}> <IoMdLogOut className="mt-[2px] mx-[5px] text-2xl" /><p>Logout</p></button>
          </div>
          {/* Responsive Code */}
          <div className={`fixed top-0 left-0 w-3/5 h-full bg-custom-blue z-40 transition-transform duration-900 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            <div className="flex flex-col items-baseline text-white">
              <div className="flex p-[15px] w-[100%] mt-[25px] justify-between items-center">
                <img src={profile} alt="" className=" mb-[15px] w-[55px] h-[55px] " />
                <button onClick={toggleMenu}><FiX className="mb-[11px]" size={24} /></button>
              </div>

              <div className="w-[90%] mx-auto h-[2px] bg-gray-600"></div>

              <div className="flex flex-col items-baseline ml-[-15px] text-white">
                <NavLink to="/department-profile" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}>Dashboard</NavLink>
                <NavLink to="/assign-courses" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Course Details</NavLink>
                <NavLink to="/checkthenrollment" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Enrollments</NavLink>
                <NavLink to="/assignResults" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Result Compilation</NavLink>
                <NavLink to="/student-creation" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Registerations</NavLink>
              </div>

              <div className="w-[90%] mt-[15px] mx-auto h-[2px] bg-gray-600"></div>

              <div><button className="text-white ml-[20px] mt-[15px] text-xl px-[8px] py-[2px] font-medium flex items-center hover:bg-red-700 hover:text-white rounded-xl border-2 border-white" onClick={handleLogout}> <p>Logout</p></button></div>
            </div>

          </div>


        </>
      )}

      {userType === "instructor" && (
        <div className="bg-custom-blue h-[100%] flex items-center justify-between rounded-lg">
          <img src={profile} alt="" className="ml-[25px] w-[55px] h-[55px] " />

          <div className="xsx:flex hidden text-md items-center text-white">
            <NavLink to="/instructor-profile" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] "></NavLink>
          </div>

          <button className="text-lg bg-red-600 text-white rounded-md  w-[100px] h-[36px] my-auto mr-[10px] flex  items-center" onClick={handleLogout}> <IoMdLogOut className="mt-[2px] mx-[5px] text-2xl" /><p>Logout</p></button>
        </div>
      )}
      {userType === "admin" && (
        <>
          <div className="bg-custom-blue h-[100%] flex items-center justify-between rounded-lg">
            <img src={profile} alt="" className="ml-[25px] w-[55px] h-[55px] " />
            <button className="xsx:hidden text-white m-[15px]" onClick={toggleMenu}>
              {isOpen ? <></> : <CgMenuLeftAlt size={24} />}
            </button>

            <div className="xsx:flex hidden text-md items-center text-white">
              <NavLink to="/registerdepartment" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Departments</NavLink>
              <NavLink to="/registerinstructor" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Instructor</NavLink>
              <NavLink to="/registercourse" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Course</NavLink>
            </div>

            <button className="text-lg bg-red-600 text-white rounded-md  w-[100px] h-[36px] my-auto mr-[10px] xsx:flex hidden items-center" onClick={handleLogout}> <IoMdLogOut className="mt-[2px] mx-[5px] text-2xl" /><p>Logout</p></button>
          </div>
          {/* Responsive Code */}
          <div className={`fixed top-0 left-0 w-3/5 h-full bg-custom-blue z-40 transition-transform duration-900 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            <div className="flex flex-col items-baseline text-white">
              <div className="flex p-[15px] w-[100%] mt-[25px] justify-between items-center">
                <img src={profile} alt="" className=" mb-[15px] w-[55px] h-[55px] " />
                <button onClick={toggleMenu}><FiX className="mb-[11px]" size={24} /></button>
              </div>

              <div className="w-[90%] mx-auto h-[2px] bg-gray-600"></div>

              <div className="flex flex-col items-baseline ml-[-15px] text-white">
                <NavLink to="/registerdepartment" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}>Register Departments</NavLink>
                <NavLink to="/registerinstructor" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Register Instructor</NavLink>
                <NavLink to="/registercourse" onClick={toggleMenu} className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ""}`}> Register Course</NavLink>
              </div>

              <div className="w-[90%] mt-[15px] mx-auto h-[2px] bg-gray-600"></div>

              <div><button className="text-white ml-[20px] mt-[15px] text-xl px-[8px] py-[2px] font-medium flex items-center hover:bg-red-700 hover:text-white rounded-xl border-2 border-white" onClick={handleLogout}> <p>Logout</p></button></div>
            </div>

          </div>


        </>
      )}

    </nav >
  );
};

export default Navbar;
 