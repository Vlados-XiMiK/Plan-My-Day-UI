import Calendar, { Task } from '../../../components/main/Calendar';

// Sample tasks data
const sampleTasks: Task[] = [
  { id: 1, title: 'Project meeting', dueDate: '2024-12-05T10:00:00', type: 'event' },
  { id: 2, title: 'Dentist appointment', dueDate: '2024-12-10T14:30:00', type: 'event' },
  { id: 3, title: 'Submit report', dueDate: '2024-12-15T17:00:00', type: 'deadline' },
];

export default function CalendarView() {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Calendar</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Calendar tasks={sampleTasks} />
      </div>
    </div>
  );
}