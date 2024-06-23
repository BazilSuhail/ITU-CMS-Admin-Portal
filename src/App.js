import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import RegisterDepartment from "./Components/RegisterDepartment";
import SignIn from "./Components/SignIn";
import DepartmentProfile from "./Components/DepartmentProfile";
import Navbar from "./Components/Navbar";
import InstructorProfile from "./Components/InstructorProfile";
import StudentRegistration from "./Components/StudentCreation";
import CourseDetails from "./Components/CourseDetails";
import Marking from "./Components/Marking";
import AssignMarks from "./Components/AssignMarks";
import ClassStudents from "./Components/Department_Classes/ClassStdudents";
import VerifyEnrollment from "./Components/Department_Classes/VerifyEnrollment";
import DepartmentClasses from "./Components/Department_Classes/DepartmentClasses";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*<Route exact path="/registerdepartment" element={<RegisterDepartment />} /> */}
        <Route exact path="/registerdepartment" element={<RegisterDepartment />} />

        <Route path="/department-profile" element={<DepartmentProfile />} />

        <Route path="/instructor-profile" element={<InstructorProfile />} />
        <Route path="/student-creation" element={<StudentRegistration />} />
        <Route path="/course-details/:assignCourseId" element={<CourseDetails />} />
        <Route path="/marking-details/:assignCourseId" element={<Marking />} />
        <Route path="/assign-marks/:assignCourseId" element={<AssignMarks />} />
        <Route exact path="/" element={<SignIn />} />


        <Route path="/checkthenrollment" element={<DepartmentClasses />} />
        <Route path="/verify-enrollment/:classId" element={<ClassStudents />} />
        <Route path="/verify-enrollment/:classId/:studentId" element={<VerifyEnrollment />} c />

      </Routes>
    </Router>
  );
};

export default App;