import React from 'react';

const StudentAttendance = ({ student, attendance, onAttendanceChange }) => {
  const handleChange = (e) => {
    onAttendanceChange(student.id, e.target.value === 'true');
  };

  const getBackgroundColor = (value) => {
    if (value === 'true') {
      return 'bg-green-700 text-white';
    }
    if (value === 'false') {
      return 'bg-red-700 text-white';
    }
    return '';
  };

  const selectedValue = attendance[student.id] !== undefined ? attendance[student.id].toString() : '';

  return (
    <tr className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-md'>
      <th scope='row' className="px-6 py-4 text-lg font-bold ">{student.name}</th>
      <td className="px-6 py-4">
        <div>
          <select
            className={`my-[5px] shadow-custom-light block w-full px-3 py-2 border-3 font-bold border-custom-blue placeholder-gray-400 focus:outline-none focus:ring focus:border-custom-blue sm:text-sm rounded-md ${getBackgroundColor(selectedValue)}`}
            value={selectedValue}
            onChange={handleChange}
          >
            <option className='font-medium text-lg' value="">Select</option>
            <option className='font-medium text-lg' value="true">Present</option>
            <option className='font-medium text-lg' value="false">Absent</option>
          </select>
        </div>
      </td>
    </tr>
  );
};

export default StudentAttendance;
