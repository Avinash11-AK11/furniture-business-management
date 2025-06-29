import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, User, Hammer, X, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';

const Calendar = () => {
  const { productions, sales } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidays, setHolidays] = useState([
    { date: '2024-01-26', name: 'Republic Day' },
    { date: '2024-08-15', name: 'Independence Day' },
    { date: '2024-10-02', name: 'Gandhi Jayanti' },
    { date: '2024-12-25', name: 'Christmas' },
  ]);
  const [events, setEvents] = useState([]);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [newEvent, setNewEvent] = useState({ 
    date: '', 
    title: '', 
    description: '', 
    type: 'meeting',
    time: '09:00'
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const productionEvents = productions
      .filter(prod => new Date(prod.productionDate).toISOString().split('T')[0] === dateStr)
      .map(prod => ({
        id: prod.id,
        type: 'production',
        title: `Production #${prod.id.slice(-6)}`,
        time: 'All day',
        color: 'bg-blue-100 text-blue-800',
        status: prod.status
      }));

    const salesEvents = sales
      .filter(sale => new Date(sale.saleDate).toISOString().split('T')[0] === dateStr)
      .map(sale => ({
        id: sale.id,
        type: 'sale',
        title: `Sale to ${sale.customerName}`,
        time: 'All day',
        color: 'bg-green-100 text-green-800',
        amount: sale.totalAmount
      }));

    const holidayEvents = holidays
      .filter(holiday => holiday.date === dateStr)
      .map(holiday => ({
        id: holiday.date,
        type: 'holiday',
        title: holiday.name,
        time: 'All day',
        color: 'bg-red-100 text-red-800'
      }));

    const customEvents = events
      .filter(event => event.date === dateStr)
      .map(event => ({
        id: event.id,
        type: event.type,
        title: event.title,
        time: event.time,
        color: 'bg-purple-100 text-purple-800',
        description: event.description
      }));

    return [...productionEvents, ...salesEvents, ...holidayEvents, ...customEvents];
  };

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday({ date: '', name: '' });
      setShowAddHoliday(false);
    }
  };

  const addEvent = () => {
    if (newEvent.date && newEvent.title) {
      const event = {
        ...newEvent,
        id: Date.now().toString()
      };
      setEvents([...events, event]);
      setNewEvent({ date: '', title: '', description: '', type: 'meeting', time: '09:00' });
      setShowAddEvent(false);
    }
  };

  const removeHoliday = (date) => {
    setHolidays(holidays.filter(h => h.date !== date));
  };

  const removeEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleExport = (format) => {
    const allEvents = [];
    
    // Add all events for the current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      
      dayEvents.forEach(event => {
        allEvents.push({
          'Date': date.toLocaleDateString(),
          'Event': event.title,
          'Type': event.type,
          'Time': event.time,
          'Status': event.status || 'N/A',
          'Amount': event.amount ? `₹${event.amount.toLocaleString()}` : 'N/A'
        });
      });
    }

    const filename = `calendar_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(allEvents, filename, 'Calendar');
        break;
      case 'csv':
        exportToCSV(allEvents, filename);
        break;
      case 'pdf':
        const columns = ['Date', 'Event', 'Type', 'Time', 'Status', 'Amount'];
        exportToPDF(allEvents, filename, 'Calendar Report', columns);
        break;
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasHoliday = events.some(e => e.type === 'holiday');

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-32 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-300' : ''} ${
            hasHoliday ? 'bg-red-50 border-red-200' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : hasHoliday ? 'text-red-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded ${event.color} truncate`}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddHoliday(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Holiday</span>
          </button>
          <button 
            onClick={() => setShowAddEvent(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Event Details Sidebar */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {event.type === 'production' ? (
                    <Hammer className="w-5 h-5 text-blue-600" />
                  ) : event.type === 'sale' ? (
                    <User className="w-5 h-5 text-green-600" />
                  ) : (
                    <CalendarIcon className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {event.time}
                    </p>
                    {event.status && (
                      <p className="text-xs text-gray-500">Status: {event.status}</p>
                    )}
                    {event.amount && (
                      <p className="text-xs text-green-600">₹{event.amount.toLocaleString()}</p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-500">{event.description}</p>
                    )}
                  </div>
                </div>
                {(event.type === 'holiday' || event.type === 'meeting') && (
                  <button
                    onClick={() => event.type === 'holiday' ? removeHoliday(event.id) : removeEvent(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
            )}
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Holiday</h2>
              <button
                onClick={() => setShowAddHoliday(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="holidayDate"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  id="holidayName"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter holiday name"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowAddHoliday(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addHoliday}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Event</h2>
              <button
                onClick={() => setShowAddEvent(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="eventDate"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="eventType"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="appointment">Appointment</option>
                    <option value="delivery">Delivery</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="eventTime"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="eventDescription"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event description (optional)"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;