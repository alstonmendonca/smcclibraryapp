import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { 
  UserIcon, 
  BookOpenIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const IssueBook = () => {
  const [userNo, setUserNo] = useState("");
  const [bookId, setBookId] = useState("");
  const [time, setTime] = useState(7);
  const [issueDate, setIssueDate] = useState(dayjs());
  const [returnDate, setReturnDate] = useState(dayjs().add(7, "day"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setReturnDate(issueDate.add(time, "day"));
  }, [time, issueDate]);

  useEffect(() => {
    if (notification?.type === 'error') {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Book issued successfully!'
    });
    setTimeout(() => setNotification(null), 1000);
  };

  const showError = (message) => {
    setNotification({
      type: 'error',
      message: message
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const issueData = {
      userNo: parseInt(userNo),
      bookId: parseInt(bookId),
      time: time.toString(),
      issueDate: issueDate.toISOString(),
      returnDate: returnDate.toISOString(),
      returned: 0,
    };

    try {
      const result = await window.electronAPI.issueBook(issueData);
      if (result.success) {
        setUserNo("");
        setBookId("");
        setTime(7);
        setIssueDate(dayjs());
        setReturnDate(dayjs().add(7, "day"));
        showSuccess();
      } else {
        showError(result.error || "Failed to issue book");
      }
    } catch (error) {
      console.error("IPC Error:", error);
      showError("IPC communication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'animate-fade-in-out' : 'animate-fade-in'
        }`}>
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            )}
            <span className="ml-3 text-sm font-medium text-gray-900">
              {notification.message}
            </span>
            {notification.type === 'error' && (
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Book</h1>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* User and Book Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Number */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-base font-medium text-gray-700 mb-2">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    User Number
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter user number"
                      className="w-full pl-12 pr-5 py-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      value={userNo}
                      onChange={(e) => setUserNo(e.target.value)}
                      required
                    />
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Book ID */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-base font-medium text-gray-700 mb-2">
                    <BookOpenIcon className="w-5 h-5 text-gray-500" />
                    Book ID
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter book ID"
                      className="w-full pl-12 pr-5 py-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      required
                    />
                    <BookOpenIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-base font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  Borrow Duration
                </label>
                <div className="relative">
                  <select
                    className="w-full pl-12 pr-5 py-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white appearance-none cursor-pointer"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value))}
                  >
                    {[...Array(30).keys()].map((n) => (
                      <option key={n + 1} value={n + 1}>
                        {n + 1} {n + 1 === 1 ? "day" : "days"}
                      </option>
                    ))}
                  </select>
                  <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Date Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Issue Date */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Issue Date</h3>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{issueDate.format("DD MMM YYYY")}</p>
                  <p className="text-base text-gray-600 mt-2">{issueDate.format("dddd")}</p>
                </div>

                {/* Return Date */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Return Date</h3>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{returnDate.format("DD MMM YYYY")}</p>
                  <p className="text-base text-gray-600 mt-2">{returnDate.format("dddd")}</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !userNo || !bookId}
                className={`w-full py-5 px-8 rounded-xl font-medium flex items-center justify-center gap-4 transition-all duration-200 ${
                  isSubmitting || !userNo || !bookId
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="w-6 h-6" />
                    Issue Book
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-10 py-6 border-t border-gray-100">
            <p className="text-center text-base text-gray-600">
              Make sure all information is correct before issuing the book
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;