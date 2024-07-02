import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, fs } from '../Config/Config';
import { useAuth } from "./AuthContext";
import { IoMdLogOut } from "react-icons/io";
import profile from "./itu.png"

const Navbar = () => {
  const { userType, setUserType } = useAuth();
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
  }, [setUserType]);

  const handleLogout = () => {
    auth.signOut();
    setUserType("");
    navigate("/");
  };

  return (
    <nav className="w-[98vw] mx-auto h-[80px] p-[4px]">
      <div className="bg-custom-blue h-[100%] flex items-center justify-between rounded-lg">

      <img src={profile} alt="" className="ml-[25px] w-[55px] h-[55px] " />
        <div className="flex text-white items-center">
          {userType === "department" && (
            <div className="ml-[10px]">
              <NavLink to="/department-profile" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Dashboard</NavLink>
              <NavLink to="/assign-courses" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Courses Details</NavLink>
              <NavLink to="/checkthenrollment" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Enrollments</NavLink>
              <NavLink to="/assignResults" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Result Compilation</NavLink>
              <NavLink to="/student-creation" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Student Accounts</NavLink>
            </div>
          )}

          {userType === "instructor" && (
            <NavLink to="/instructor-profile" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] "></NavLink>
          )}
          {userType === "admin" && (
            <>
              <NavLink to="/registerdepartment" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Departments</NavLink>
              <NavLink to="/registerinstructor" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Instructor</NavLink>
              <NavLink to="/registercourse" className="text-md lg:text-lg mx-[4px] lg:mx-[8px] font-medium hover:bg-white hover:rounded-lg hover:text-custom-blue p-[2px] lg:p-[5px] ">Register Course</NavLink>
            </>
          )}
        </div>
        {userType && <button className="text-lg bg-red-600 text-white rounded-md w-[100px] h-[36px] my-auto mr-[10px] flex items-center" onClick={handleLogout}> <IoMdLogOut className="mt-[2px] mx-[5px] text-2xl" /><p>Logout</p></button>}
      </div>
    </nav>
  );
};

export default Navbar;
