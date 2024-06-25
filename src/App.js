import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom"; 
import SignIn from "./Components/SignIn";
import DepartmentProfile from "./Components/DepartmentProfile";
import Navbar from "./Components/Navbar";
import InstructorProfile from "./Components/InstructorProfile";
import StudentRegistration from "./Components/StudentCreation";
import CourseDetails from "./Components/CourseDetails";
import Marking from "./Components/Marking"; 
import ClassStudents from "./Components/Department_Classes/ClassStudents";
import VerifyEnrollment from "./Components/Department_Classes/VerifyEnrollment";
import DepartmentClasses from "./Components/Department_Classes/DepartmentClasses";

import RegisterCourse from "./Components/Resgistrations/RegisterCourse";
import RegisterInstructor from "./Components/Resgistrations/ResisterInstructor";
import RegisterDepartment from "./Components/Resgistrations/RegisterDepartment";
import AssignResults from "./AssigningResults/AssignResults";
import AssignSemesterResult from "./AssigningResults/AssignSemesterResult";

import StudentsInClass from "./AssigningResults/StudentsInClass";
import ApplicationsForWithdraw from "./Components/Department_Classes/WithdrawCourses";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*<Route exact path="/registerdepartment" element={<RegisterDepartment />} /> */}
        <Route exact path="/registerdepartment" element={<RegisterDepartment />} />
        <Route exact path="/registerinstructor" element={<RegisterInstructor />} />
        <Route exact path="/registercourse" element={<RegisterCourse />} />

        <Route path="/department-profile" element={<DepartmentProfile />} />

        <Route path="/instructor-profile" element={<InstructorProfile />} />
        <Route path="/student-creation" element={<StudentRegistration />} />
        <Route path="/course-details/:assignCourseId" element={<CourseDetails />} />
        <Route path="/marking-details/:assignCourseId" element={<Marking />} /> 
        
        <Route exact path="/" element={<SignIn />} />
 
        {/*Results*/}

        <Route path="/assignResults" element={<AssignResults />} />        
        <Route path="/students-in-class/:classData" element={<StudentsInClass/>} />
        <Route path="/assign-results/:classId/:studentId" element={<AssignSemesterResult />}   />
        

        <Route path="/checkthenrollment" element={<DepartmentClasses />} />
        <Route path="/verify-enrollment/:classId" element={<ClassStudents />} />
        <Route path="/verify-enrollment/:classId/:studentId" element={<VerifyEnrollment />} />
        <Route path="/withdraw-enrollment/:classId/:studentId" element={<ApplicationsForWithdraw />} />

      </Routes>
    </Router>
  );
};

export default App;