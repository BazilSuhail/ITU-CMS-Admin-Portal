import React, { useState, useEffect } from 'react';
import { Circles } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { fs } from '../../Config/Config';

const Marking = () => {
    const { assignCourseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [marks, setMarks] = useState({});
    const [newCriteria, setNewCriteria] = useState({ assessment: '', weightage: '', totalMarks: '' });
    const [editingCriteria, setEditingCriteria] = useState(-1);
    const [isEditing, setIsEditing] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isAddingMarks, setIsAddingMarks] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState('');
    const [tempMarks, setTempMarks] = useState({}); // Temporary state for entered marks

    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentsSnapshot = await fs.collection('students').get();
                const studentsData = studentsSnapshot.docs
                    .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                    }));
                setStudents(studentsData);

                const marksDoc = await fs.collection('studentsMarks').doc(assignCourseId).get();
                const marksObject = studentsData.reduce((acc, student) => {
                    acc[student.id] = { grade: 'I' };  // Initialize with default grade 'I'
                    return acc;
                }, {});

                if (marksDoc.exists) {
                    const marksData = marksDoc.data();
                    setCriteria(marksData.criteriaDefined || []);
                    marksData.marksOfStudents.forEach(studentMarks => {
                        marksObject[studentMarks.studentId] = {
                            ...marksObject[studentMarks.studentId],  // Keep the default grade 'I'
                            ...studentMarks.marks,
                            grade: studentMarks.grade || 'I'  // Override with actual grade if it exists
                        };
                    });
                }

                setMarks(marksObject);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assignCourseId]);

    const handleAddCriteria = () => {
        if (newCriteria.assessment && newCriteria.weightage && newCriteria.totalMarks) {
            setCriteria([...criteria, { ...newCriteria }]);
            setNewCriteria({ assessment: '', weightage: '', totalMarks: '' });
        }
    };

    const handleSaveMarks = async () => {
        try {
            const marksData = {
                criteriaDefined: criteria,
                marksOfStudents: Object.keys(marks).map((studentId) => {
                    const studentMarks = marks[studentId];
                    // Remove undefined fields
                    Object.keys(studentMarks).forEach(key => {
                        if (studentMarks[key] === undefined) {
                            delete studentMarks[key];
                        }
                    });
                    return {
                        studentId,
                        marks: studentMarks,
                        grade: studentMarks.grade,
                    };
                }),
            };

            // Log the data to be saved
            console.log('Data to be saved:', marksData);
            setEditingCriteria(-1)
            await fs.collection('studentsMarks').doc(assignCourseId).set(marksData);

            setSaveMessage('Marks saved successfully!');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteCriteria = (index) => {
        const assessmentToDelete = criteria[index].assessment;
        setCriteria((prev) => prev.filter((_, i) => i !== index));
        setMarks((prev) => {
            const newMarks = { ...prev };
            Object.keys(newMarks).forEach((studentId) => {
                const { [assessmentToDelete]: _, ...rest } = newMarks[studentId];
                newMarks[studentId] = rest;
            });
            return newMarks;
        });
    };

    const handleEditCriteria = (index) => {
        setEditingCriteria(index);
    };


    const handleAddMarks = () => {
        setIsAddingMarks(true);
    };

    const handleSaveAddMarks = () => {
        setMarks((prev) => {
            const newMarks = { ...prev };

            Object.keys(tempMarks).forEach((studentId) => {
                const assessmentMarks = tempMarks[studentId] || {};

                Object.keys(assessmentMarks).forEach((assessment) => {
                    const previousMarks = parseInt(newMarks[studentId]?.[assessment] || 0, 10);
                    const additionalMarks = parseInt(assessmentMarks[assessment], 10);

                    // Add the additional marks to the previous marks
                    newMarks[studentId] = {
                        ...newMarks[studentId],
                        [assessment]: previousMarks + additionalMarks,
                    };

                    // Logging for debugging
                    console.log(previousMarks);
                    console.log(additionalMarks);
                    console.log(newMarks[studentId][assessment]);
                });
            });

            return newMarks;
        });

        // Clear temporary marks and exit add marks mode
        setTempMarks({});
        setIsAddingMarks(false);
    };



    const handleAddMarksChange = (studentId, value) => {
        setTempMarks((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [selectedAssessment]: parseInt(value),
            },
        }));
    };


    const totalWeightage = criteria.reduce((total, item) => total + parseFloat(item.weightage), 0);

    const allCriteriaFilled = criteria.every(c => c.assessment && c.weightage && c.totalMarks);
    const allMarksEntered = students.every(student => criteria.every(c => marks[student.id]?.[c.assessment] !== undefined));


    return (
        <div>
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
                <p>Error: {saveMessage}+ {error}</p>
            ) : (

                <div>
                    <div className='my-[8px] w-[95%] lg::w-[65%] mx-auto p-[15px] bg-gray-200 rounded-xl overflow-x-auto'>

                        <h2 className='text-2xl text-white rounded-md text-center py-[15px] bg-custom-blue mb-[8px] font-bold '>Total Weightage: {totalWeightage}%</h2>
                        <div className='overflow-x-auto mx-auto'>
                            {criteria.map((criterion, index) => (
                                <p key={index}>
                                    {editingCriteria === index ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={criterion.assessment}
                                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                onChange={(e) =>
                                                    setCriteria((prev) =>
                                                        prev.map((item, i) =>
                                                            i === index ? { ...item, assessment: e.target.value } : item
                                                        )
                                                    )
                                                }
                                            />
                                            <input
                                                type="number"
                                                value={criterion.weightage}
                                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                onChange={(e) =>
                                                    setCriteria((prev) =>
                                                        prev.map((item, i) =>
                                                            i === index ? { ...item, weightage: e.target.value } : item
                                                        )
                                                    )
                                                }
                                            />
                                            <input
                                                type="number"
                                                value={criterion.totalMarks}
                                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                onChange={(e) =>
                                                    setCriteria((prev) =>
                                                        prev.map((item, i) =>
                                                            i === index ? { ...item, totalMarks: e.target.value } : item
                                                        )
                                                    )
                                                }
                                            />
                                            {/*       <button onClick={() => setEditingCriteria(-1)}
                                                className="whitespace-nowrap m-[6px] bg-green-900 hover:bg-white hover:shadow-custom-light hover:text-green-900 text-md py-[8px] px-[12px] font-semibold text-white rounded-xl"
                                            >
                                                Click Save Marks to Update
                                            </button>
                                             */}
                                            <button onClick={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered} className="whitespace-nowrap m-[6px] bg-green-900 hover:bg-white hover:shadow-custom-light hover:text-green-900 text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                Update Criteria
                                            </button>
                                        </div>
                                    ) : (

                                        <div className='flex overflow-auto w-[98%] mx-auto items-center my-[20px]'>

                                            <p className='font-bold whitespace-nowrap ml-[15px] text-lg text-custom-blue'>
                                                Assement Name:
                                            </p>
                                            <p className='font-bold  rounded-lg shadow-custom-light p-[5px] whitespace-nowrap ml-[15px] text-2xl text-blue-900'>
                                                {criterion.assessment}
                                            </p>

                                            <p className='font-bold  whitespace-nowrap ml-[15px] text-lg text-custom-blue'>
                                                Weightage:
                                            </p>
                                            <p className='font-bold  rounded-lg shadow-custom-light p-[5px] whitespace-nowrap ml-[15px] text-2xl text-blue-900'>
                                                {criterion.weightage}%
                                            </p>

                                            <p className='font-bold whitespace-nowrap ml-[15px] text-lg text-custom-blue'>
                                                Total Marks
                                            </p>
                                            <p className='font-bold  rounded-lg shadow-custom-light p-[5px] whitespace-nowrap ml-[15px] text-2xl text-blue-900'>
                                                {criterion.totalMarks}
                                            </p>

                                            <button onClick={() => handleEditCriteria(index)} className="whitespace-nowrap ml-[45px] w-[75px] bg-blue-800 hover:bg-white hover:shadow-custom-light hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteCriteria(index)} className="whitespace-nowrap w-[75px] m-[6px] bg-red-900 hover:bg-white hover:shadow-custom-light hover:text-red-900 text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </p>
                            ))}
                        </div>

                        <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Define Grading Criteria</h2>
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="Enter Assessment Name"
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                value={newCriteria.assessment}
                                onChange={(e) => setNewCriteria({ ...newCriteria, assessment: e.target.value })}
                            />
                            <input
                                type="number"
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                placeholder="Enter Assessment Weightage"
                                required
                                value={newCriteria.weightage}
                                onChange={(e) => setNewCriteria({ ...newCriteria, weightage: e.target.value })}
                            />
                            <input
                                type="number"
                                className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"

                                placeholder="Enter Expected Total Marks For the Assessment"
                                value={newCriteria.totalMarks}
                                required
                                onChange={(e) => setNewCriteria({ ...newCriteria, totalMarks: e.target.value })}
                            />
                            <button onClick={handleAddCriteria} className='lg:w-[155px] hover:shadow-custom-light  my-[10px] py-[8px] w-[75%] justify-center rounded-md bg-custom-blue text-lg font-bold hover:text-custom-blue hover:bg-white text-white'>
                                Add Criteria
                            </button>
                        </div>

                    </div>


                    <div>
                        {criteria.length > 0 ? (

                            <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                                <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Marks Details</h2>
                                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead class="text-md text-gray-200 uppercase bg-gray-700">
                                            <tr className='text-center'>
                                                <th scope="col" class="px-6 py-3 whitespace-nowrap">Student</th>
                                                {criteria.map((criterion, index) => (
                                                    <th scope="col" class="px-6 py-3 whitespace-nowrap" key={index}>{criterion.assessment}</th>
                                                ))}

                                                {criteria.map((criterion, index) => (
                                                    <th scope="col" class="px-6 py-3 whitespace-nowrap" key={index}>Weighted Marks ({criterion.assessment})</th>
                                                ))}
                                                <th>Grade</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {students.map((student) => (
                                                <tr key={student.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue font-semibold text-lg'>
                                                    <td>{student.name}</td>
                                                    {criteria.map((criterion, index) => (
                                                        <td className="px-6 py-4 whitespace-nowrap" key={index}>
                                                            <input
                                                                type="number"
                                                                value={marks[student.id]?.[criterion.assessment] || ''}
                                                                className="my-[5px] shadow-custom-light block w-[75px] px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                                onChange={(e) =>
                                                                    setMarks((prev) => ({
                                                                        ...prev,
                                                                        [student.id]: {
                                                                            ...prev[student.id],
                                                                            [criterion.assessment]: parseInt(e.target.value),
                                                                        },
                                                                    }))
                                                                }
                                                                disabled={!isEditing}
                                                            />
                                                        </td>
                                                    ))}
                                                    {criteria.map((criterion, index) => (
                                                        <td className="px-6 py-4 whitespace-nowrap" key={index}>
                                                            {marks[student.id]?.[criterion.assessment] !== undefined
                                                                ? (
                                                                    (marks[student.id][criterion.assessment] / criterion.totalMarks) * criterion.weightage
                                                                ).toFixed(2)
                                                                : ''
                                                            }
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select className="my-[5px] bg-gray-200 w-[80px] text-custom-blue shadow-custom-light block px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-800 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                            value={marks[student.id]?.grade || 'I'}
                                                            onChange={(e) =>
                                                                setMarks((prev) => ({
                                                                    ...prev,
                                                                    [student.id]: {
                                                                        ...prev[student.id],
                                                                        grade: e.target.value,
                                                                    },
                                                                }))
                                                            }
                                                        >
                                                            {grades.map((grade) => (
                                                                <option className='bg-gray-200 text-custom-blue font-bold text-md' key={grade} value={grade}>{grade}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p>No criteria defined yet</p>
                        )}
                        <div className='flex justify-center m-[15px]'>

                            <button onClick={handleSaveMarks} disabled={!allCriteriaFilled || !allMarksEntered}
                                className='w-[155px] hover:shadow-custom-light my-[10px] py-[8px] justify-center rounded-md bg-green-700 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'>
                                Save Marks
                            </button>
                            {/*saveMessage && <p>{saveMessage}</p>*/}
                            <button onClick={() => setIsEditing(!isEditing)}
                                className=' hover:shadow-custom-light  w-[155px] my-[10px] ml-[15px] py-[8px] justify-center rounded-md bg-blue-600 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'>
                                {isEditing ? 'Stop Editing' : 'Edit Marks'}
                            </button>
                        </div>
                    </div>

                    <div className='my-[8px] flex flex-col w-[95%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                        <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Add Marks</h2>
                        <button onClick={handleAddMarks}
                            className=' w-[295px] hover:shadow-custom-light my-[10px] ml-[15px] py-[8px] justify-center rounded-2xl bg-blue-700 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'>
                            Add-Up Marks Of Assessments
                        </button>

                        {isAddingMarks && (
                            <div>
                                <select onChange={(e) => setSelectedAssessment(e.target.value)} value={selectedAssessment} className="my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md">
                                    <option value="" className='font-bold text-lg'>Select Assessment</option>
                                    {criteria.map((criterion, index) => (
                                        <option key={index} value={criterion.assessment} className='bg-custom-blue text-white text-lg ' >
                                            {criterion.assessment}
                                        </option>
                                    ))}
                                </select>
                                {selectedAssessment && (
                                    <div >
                                        <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Enter Marks for {selectedAssessment}</h2>
                                        {students.map((student) => (
                                            <div key={student.id} className='flex items-center' >
                                                <p className="block w-[360px] text-xl font-bold p-[3px] px-[8px] shadow-custom-light rounded-lg text-gray-700">{student.name}</p>
                                                <input
                                                    className="my-[5px] ml-[15px] shadow-custom-light block w-[250px] px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md"
                                                    required
                                                    type="number"
                                                    onChange={(e) => handleAddMarksChange(student.id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        <button onClick={handleSaveAddMarks}
                                            className=' w-[155px] my-[10px] ml-[15px] py-[8px] justify-center rounded-md bg-blue-950 text-lg font-bold hover:text-custom-blue hover:bg-white text-white'>
                                            Add Results
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default Marking;
