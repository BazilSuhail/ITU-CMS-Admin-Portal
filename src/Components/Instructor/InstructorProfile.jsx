import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';

import { useNavigate } from 'react-router-dom';

import img1 from "../../Assets/img1.jpg";
import img2 from "../../Assets/img2.jpg";
import img3 from "../../Assets/img3.jpg";
import img4 from "../../Assets/img4.jpg";
import img5 from "../../Assets/img5.jpg";

const InstructorProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const docRef = await fs.collection('instructors').doc(currentUser.uid).get();
          if (docRef.exists) {
            setUserData(docRef.data());
            const assignCoursesSnapshot = await fs.collection('assignCourses')
              .where('instructorId', '==', currentUser.uid)
              .get();

            const assignedCoursesData = await Promise.all(assignCoursesSnapshot.docs.map(async doc => {
              const assignment = doc.data();
              const courseDoc = await fs.collection('courses').doc(assignment.courseId).get();
              const classDoc = await fs.collection('classes').doc(assignment.classId).get();

              return {
                assignCourseId: doc.id,
                courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                courseId: assignment.courseId,
                classId: assignment.classId
              };
            }));

            setAssignedCourses(assignedCoursesData);
          } else {
            setError('No user data found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNavigateToCourse = (assignCourseId) => {
    navigate(`/course-details/${assignCourseId}`);
  };

  const handleNavigateToMarkingCourse = (assignCourseId) => {
    navigate(`/marking-details/${assignCourseId}`);
  };
  const images = [img1, img2, img3, img4, img5]; // Array of imported images

  return (
    <main className='h-full w-full'>

      {loading ? (
        <div className='w-screen h-[calc(98vh-195px)] flex flex-col justify-center items-center'>
          <Circles
            height="60"
            width="60"
            color="rgb(0, 63, 146)"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          {userData ? (
            <div>

              <h2 className='text-custom-blue my-[12px] flex text-4xl text-center ml-[10px] font-bold p-[8px] rounded-2xl'>Hii, <p className='text-blue-700 px-[8px]'>{userData.name}</p> !!  </h2>
              <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
              <div className='grid grid-cols-1 xsx:grid-cols-3 gap-x-[6px] gap-y-[15px] p-[8px]'>
                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                  <div className='ml-[5px] text-md'>Name:</div>
                  <div className='text-3xl xsx:text-2xl '>{userData.name}</div>
                </div>
                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                  <div className='ml-[5px] text-md'>Registered Email:</div>
                  <div className='text-3xl xsx:text-2xl '>{userData.email}</div>
                </div>
                <div className='bg-custom-blue rounded-2xl mx-auto text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
                  <div className='ml-[5px] text-md'>Conatact:</div>
                  <div className='text-3xl xsx:text-2xl '>{userData.phone}</div>
                </div>
              </div>

              <h2 className='w-[225px] ml-[14px] my-[12px] text-2xl text-custom-blue font-bold p-[8px] '>Courses Teaching:</h2>
              <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

              {assignedCourses.length > 0 ? (
                <div className='mx-auto w-[96vw] grid grid-cols-1 xsx:grid-cols-2 xl:grid-cols-3 p-[10px] my-[12px]'>
                  {assignedCourses.map((course, index) => {
                    const imageIndex = index % images.length; // Calculate the image index based on the course index
                    return (
                      <div key={course.assignCourseId} className='bg-custom-blue flex flex-col rounded-lg m-[5px] text-white p-[15px]'>
                        <div className='bg-gray-500 mt-[15px] rounded-lg mx-auto w-[100%] h-[230px]'>
                          <img src={images[imageIndex]} alt="Counldn't fetch details | Network Error - :/" className='rounded-lg w-full h-full object-cover' />
                        </div>
                        <p className='text-2xl font-bold my-[8px] ml-[5px]'>{course.courseName}</p>
                        <p className='text-md text-gray-400 font-bold'>{course.className}</p>

                        <button onClick={() => handleNavigateToCourse(course.assignCourseId)} className='mx-auto w-[100%] font-bold hover:bg-custom-back-grey my-[8px] bg-red-600 p-[8px] rounded-xl'>
                          Mark Attendance
                        </button>
                        <button onClick={() => handleNavigateToMarkingCourse(course.assignCourseId)} className='mx-auto w-[100%] font-bold hover:bg-custom-back-grey my-[8px] bg-green-700 p-[8px] rounded-xl'>
                          Grade Students
                        </button>
                      </div>
                    );
                  })}

                </div>
              ) : (
                <p>No courses assigned.</p>
              )}
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>
      )}
    </main>
  );
};

export default InstructorProfile;
