import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";

import RegisterDepartment from "./Components/AdminRegistration/RegisterDepartment";
import RegisterInstructor from "./Components/AdminRegistration/RegisterInstructor";
import RegisterCourse from "./Components/AdminRegistration/RegisterCourse";

import DepartmentProfile from "./Components/Departments/DepartmentProfile";
import AssignCourses from "./Components/Departments/AssignCourses";
import StudentCreation from "./Components/Departments/StudentCreation";
import DepartmentClasses from "./Components/Departments/DepartmentClasses";
import ClassStudents from "./Components/Departments/ClassStudents";
import ClassSchedule from "./Components/Departments/ClassSchedule";
import ManageSchedule from "./Components/Departments/ManageSchedule";

import VerifyEnrollment from "./Components/Departments/VerifyEnrollment";
import ApplicationsForWithdraw from "./Components/Departments/WithdrawCourses";
//---------------------------

import InstructorProfile from "./Components/Instructor/InstructorProfile";
import CourseDetails from "./Components/Instructor/CourseDetails";
import Marking from "./Components/Instructor/Marking";
import AssignMarks from "./Components/Instructor/AssignMarks";

//result

import AssignResults from "./Components/AssigningResults/AssignResults";
import StudentsInClass from "./Components/AssigningResults/StudentsInClass";
import AssignSemesterResult from "./Components/AssigningResults/AssignSemesterResult";



import Navbar from "./Components/Navbar";
import SignIn from "./Components/SignIn";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*<Route exact path="/registerdepartment" element={<RegisterDepartment />} /> */}

        <Route exact path="/registerdepartment" element={<RegisterDepartment />} />
        <Route exact path="/registerinstructor" element={<RegisterInstructor />} />
        <Route exact path="/registercourse" element={<RegisterCourse />} />


        {/* -------------------------  */}
        <Route path="/department-profile" element={<DepartmentProfile />} />
        <Route path="/assign-courses" element={<AssignCourses />} />
        <Route path="/student-creation" element={<StudentCreation />} />
        <Route path="/class-schedule" element={<ClassSchedule />} />
        <Route path="/class-schedule/:id" element={<ManageSchedule />} />

        <Route path="/checkthenrollment" element={<DepartmentClasses />} />
        <Route path="/verify-enrollment/:classId" element={<ClassStudents />} />

        <Route path="/verify-enrollment/:classId/:studentId" element={<VerifyEnrollment />} />
        <Route path="/withdraw-enrollment/:classId/:studentId" element={<ApplicationsForWithdraw />} />

        {/*Instructor*/}

        <Route path="/instructor-profile" element={<InstructorProfile />} />
        <Route path="/course-details/:assignCourseId" element={<CourseDetails />} />
        <Route path="/marking-details/:assignCourseId" element={<Marking />} />
        <Route path="/assign-marks/:assignCourseId" element={<AssignMarks />} />
        <Route exact path="/" element={<SignIn />} />

        {/*Results*/}

        <Route path="/assignResults" element={<AssignResults />} />
        <Route path="/students-in-class/:classId" element={<StudentsInClass />} />
        <Route path="/edit-profile/:classId/:studentId" element={<AssignSemesterResult />} />
        <Route path="/assign-results/:classId/:studentId" element={<AssignSemesterResult />} />



      </Routes>
    </Router>
  );
};

export default App;