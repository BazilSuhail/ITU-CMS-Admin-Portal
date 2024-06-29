import React from 'react';

const StudentAttendance = ({ student, attendance, onAttendanceChange }) => {
  const handleChange = (e) => {
    onAttendanceChange(student.id, e.target.value === 'true');
  };

  return (
    <tr>
      <td>{student.name}</td>
      <td>
        <select
          value={attendance[student.id] !== undefined ? attendance[student.id] : ''}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="true">Present</option>
          <option value="false">Absent</option>
        </select>
      </td>
    </tr>
  );
};

export default StudentAttendance;
