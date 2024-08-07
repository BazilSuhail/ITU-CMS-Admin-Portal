import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth, fs } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';
import { FaEdit } from 'react-icons/fa';
import { FaRegTrashCan } from "react-icons/fa6";

const ManageSchedule = () => {
    const { id } = useParams(); // Get ID from route parameters
    const [schedule, setSchedule] = useState([]);
    const [newEntry, setNewEntry] = useState({ venue: '', day: '', time: '', instructor: '', date: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editEntry, setEditEntry] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                if (!id) throw new Error('ID not provided.');

                const docRef = fs.collection('scheduleOfClasses').doc(id);
                const doc = await docRef.get();

                if (doc.exists) {
                    setSchedule(doc.data().schedule || []);
                } else {
                    // Create the document if it doesn't exist
                    await docRef.set({ schedule: [] });
                    setSchedule([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [id]);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user is currently logged in.');

            const docRef = fs.collection('scheduleOfClasses').doc(id);
            const doc = await docRef.get();
            const existingSchedule = doc.data()?.schedule || [];

            if (editEntry) {
                // Update existing entry
                const updatedSchedule = existingSchedule.map(entry =>
                    entry.date === editEntry.date && entry.venue === editEntry.venue && entry.day === editEntry.day
                        ? newEntry
                        : entry
                );
                await docRef.update({ schedule: updatedSchedule });
                setSchedule(updatedSchedule);
                setEditEntry(null);
                setSuccess('Schedule updated successfully!');
            } else {
                // Add new entry
                const updatedSchedule = [...existingSchedule, newEntry];
                await docRef.update({ schedule: updatedSchedule });
                setSchedule(updatedSchedule);
                setSuccess('Schedule added successfully!');
            }

            // Clear the form after submission
            setNewEntry({ venue: '', day: '', time: '', instructor: '', date: '' });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleEditEntry = (entry) => {
        setEditEntry(entry);
        setNewEntry(entry);
    };

    const handleDeleteEntry = async (index) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user is currently logged in.');

            const docRef = fs.collection('scheduleOfClasses').doc(id);
            const doc = await docRef.get();
            const existingSchedule = doc.data()?.schedule || [];
            const updatedSchedule = existingSchedule.filter((_, i) => i !== index);

            await docRef.update({ schedule: updatedSchedule });
            setSchedule(updatedSchedule);
            setSuccess('Schedule deleted successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full p-5">
            <h2 className='text-custom-blue text-2xl font-bold mb-4'>Manage Schedule</h2>

            {loading ? (
                <div className='w-full h-[calc(100vh-200px)] flex justify-center items-center'>
                    <Circles height="60" width="60" color="rgb(0, 63, 146)" ariaLabel="circles-loading" />
                </div>
            ) : (
                <>
                    {error && <p className='text-red-500 py-2 px-5 border-2 border-red-800 mb-[15px] rounded-xl'>{error}</p>}
                    {success && <p className='text-green-800 py-2 px-5 border-2 border-green-800 mb-[15px] rounded-xl'>{success}</p>}

                    <form onSubmit={handleAddEntry} className='bg-gray-100 p-5 w-[95%] xl:w-[90%] mx-auto rounded-lg shadow-md mb-6'>
                        <h3 className='text-xl font-semibold mb-4'>{editEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
                        <div className='mb-4'>
                            <label htmlFor="venue" className="block text-lg font-medium text-gray-700">Venue</label>
                            <input
                                id="venue"
                                type="text"
                                value={newEntry.venue}
                                onChange={(e) => setNewEntry({ ...newEntry, venue: e.target.value })}
                                className="block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className='mb-4'>
                            <label htmlFor="day" className="block text-lg font-medium text-gray-700">Day</label>
                            <input
                                id="day"
                                type="text"
                                value={newEntry.day}
                                onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                                className="block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className='mb-4'>
                            <label htmlFor="time" className="block text-lg font-medium text-gray-700">Time</label>
                            <input
                                id="time"
                                type="text"
                                value={newEntry.time}
                                onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                                className="block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className='mb-4'>
                            <label htmlFor="instructor" className="block text-lg font-medium text-gray-700">Instructor</label>
                            <input
                                id="instructor"
                                type="text"
                                value={newEntry.instructor}
                                onChange={(e) => setNewEntry({ ...newEntry, instructor: e.target.value })}
                                className="block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className='mb-4'>
                            <label htmlFor="date" className="block text-lg font-medium text-gray-700">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={newEntry.date}
                                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                className="block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                            {editEntry ? 'Update Entry' : 'Add Entry'}
                        </button>
                    </form>

                    {schedule.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[95%] xl:w-[90%] mx-auto p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Classes Data</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Venue</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Day</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Time</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Instructor</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Date</th>
                                            <th scope="col" className="px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {schedule.map((entry, index) => (
                                            <tr key={index} className='text-center odd:bg-white even:bg-gray-200 text-lg text-custom-blue  border-b  font-semibold text-md'>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-900">{entry.venue}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{entry.day}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{entry.time}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{entry.instructor}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">{entry.date}</td>
                                                <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                    <button onClick={() => handleEditEntry(entry)} className="text-blue-600 text-xl p-[12px] rounded-full bg-blue-300  hover:text-blue-900">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDeleteEntry(index)} className="ml-[5px] text-red-600 text-xl p-[12px] rounded-full bg-red-300  hover:text-red-900">
                                                        <FaRegTrashCan />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No schedule entries found.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageSchedule;
