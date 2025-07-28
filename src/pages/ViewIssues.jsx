import { useEffect, useState, useMemo } from "react";
import {
  format,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isValid,
  parseISO,
  parse,
  differenceInDays
} from "date-fns";
import { Dialog } from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const formatDate = (dateString) => {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, "dd MMM yyyy"); // or "dd MMM yyyy, hh:mm a" if you want time
  } catch {
    return "Invalid Date";
  }
};

const ViewIssues = () => {
  const [issues, setIssues] = useState([]);
  const [returnedFilter, setReturnedFilter] = useState("returnedWeek");
  const [searchTerm, setSearchTerm] = useState("");
  const [editIssue, setEditIssue] = useState(null);
  const [markingReturnedIds, setMarkingReturnedIds] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({
    pendingToday: true,
    allPending: true,
    returned: true,
  });

  // Fetch issues on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await window.electronAPI.getIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }
    };
    load();
  }, []);

  // Mark as returned handler
  const handleReturn = async (id) => {
    if (markingReturnedIds.has(id)) return;
    setMarkingReturnedIds((prev) => new Set(prev).add(id));

    try {
      await window.electronAPI.markReturned(id, 1);
      setIssues((prev) =>
        prev.map((i) => (i.issueId === id ? { ...i, returned: 1 } : i))
      );
    } catch (e) {
      console.error("Failed to mark returned:", e);
      alert("Failed to mark returned");
    } finally {
      setMarkingReturnedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Categorize issues
  const categorizedIssues = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = issues.filter((issue) => {
      const searchMatch =
        issue.bookId?.toString().toLowerCase().includes(lowerSearch) ||
        issue.userNo?.toString().toLowerCase().includes(lowerSearch);
      return searchTerm ? searchMatch : true;
    });

    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const pendingToday = filtered.filter((issue) => {
      if (issue.returned !== 0) return false;
      
      // Extract date part from returnDate for comparison
      const returnDateString = new Date(issue.returnDate).toISOString().split('T')[0];
      return returnDateString === todayString;
    });

    const allPending = filtered.filter((issue) => {
      if (issue.returned !== 0) return false;
      
      // Extract date part from returnDate for comparison
      const returnDateString = new Date(issue.returnDate).toISOString().split('T')[0];
      // Only include items that are NOT due today
      return returnDateString !== todayString;
    });

    // Debug logging to help troubleshoot
    console.log('Today:', todayString);
    console.log('All issues:', filtered.map(issue => ({
      issueId: issue.issueId,
      returnDate: issue.returnDate,
      returnDateString: new Date(issue.returnDate).toISOString().split('T')[0],
      returned: issue.returned
    })));
    console.log('Pending today:', pendingToday.length);
    console.log('All pending:', allPending.length);

    return { pendingToday, allPending };
  }, [issues, searchTerm]);

  // Filter returned items
  const filteredReturns = useMemo(() => {
    let returnedItems = issues.filter((i) => i.returned === 1);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      returnedItems = returnedItems.filter(
        (i) =>
          i.bookId?.toString().toLowerCase().includes(q) ||
          i.userNo?.toString().toLowerCase().includes(q)
      );
    }

    return returnedItems.filter((issue) => {
      try {
        // Parse the returnDate and normalize to local time
        const rawDate = typeof issue.returnDate === "string"
          ? parseISO(issue.returnDate)
          : new Date(issue.returnDate);

        if (!isValid(rawDate)) return false;

        // Convert to local time to avoid timezone issues
        const localDate = new Date(rawDate.getTime() + rawDate.getTimezoneOffset() * 60000);

        switch (returnedFilter) {
          case "returnedDay":
            return isToday(localDate);
          case "returnedWeek":
            return isThisWeek(localDate, { weekStartsOn: 0 }); // Sunday as start of week
          case "returnedMonth":
            return isThisMonth(localDate);
          case "returnedYear":
            return isThisYear(localDate);
          case "returnedPrevious":
            return localDate.getFullYear() < new Date().getFullYear();
          default:
            return true;
        }
      } catch (err) {
        console.error("Date parse error:", err);
        return false;
      }
    });
  }, [issues, searchTerm, returnedFilter]);


  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (returned, returnDate) => {
    if (returned) return "bg-green-100 text-green-800";
    
    try {
      const returnDateObj = parseISO(returnDate);
      if (!isValid(returnDateObj)) return "bg-gray-100 text-gray-800";
      
      const daysLeft = differenceInDays(returnDateObj, new Date());
      
      if (daysLeft < 0) return "bg-red-100 text-red-800";
      if (daysLeft <= 2) return "bg-yellow-100 text-yellow-800";
      return "bg-blue-100 text-blue-800";
    } catch {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (returned, returnDate) => {
    if (returned) return "Returned";
    
    try {
      const returnDateObj = parseISO(returnDate);
      if (!isValid(returnDateObj)) return "Invalid date";
      
      const daysLeft = differenceInDays(returnDateObj, new Date());
      
      if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
      if (daysLeft === 0) return "Due today";
      if (daysLeft === 1) return "Due tomorrow";
      return `Due in ${daysLeft} days`;
    } catch {
      return "Invalid date";
    }
  };

  // Handle date changes in edit form
  const handleDateChange = (field, value) => {
    try {
      const date = new Date(value);
      if (isValid(date)) {
        setEditIssue(prev => ({
          ...prev,
          [field]: date.toISOString()
        }));
      }
    } catch (error) {
      console.error("Invalid date:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Issues</h1>
          <p className="text-gray-500">Manage all book issues and returns</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search by User ID or Book ID..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onChange={(e) => setSearchTerm(e.target.value.trim())}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {categorizedIssues.pendingToday.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">All Other Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {categorizedIssues.allPending.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Returned</p>
              <p className="text-2xl font-bold text-gray-900">
                {issues.filter(i => i.returned === 1).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <CheckBadgeIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Today Section */}
{/* Pending Today Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer group"
          onClick={() => toggleSection("pendingToday")}
        >
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Due Today</h2>
              <p className="text-sm text-gray-500">Returns due today and past due</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100">
              {categorizedIssues.pendingToday.length}
            </span>
            <div className="p-1 rounded-lg group-hover:bg-gray-100 transition-colors">
              {expandedSections.pendingToday ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        {expandedSections.pendingToday && (
          <div className="border-t border-gray-50">
            {categorizedIssues.pendingToday.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">All caught up!</p>
                <p className="text-sm text-gray-300 mt-1">No returns due today</p>
              </div>
            ) : (
              <div className="p-2">
                {categorizedIssues.pendingToday.map((issue, index) => (
                  <div 
                    key={issue.issueId} 
                    className="p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer"
                    onDoubleClick={() => setEditIssue(issue)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{issue.userNo}</p>
                            <p className="text-xs text-gray-500">User</p>
                          </div>
                        </div>

                        {/* Book Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <BookOpenIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{issue.bookId}</p>
                            <p className="text-xs text-gray-500">Book</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="hidden sm:flex items-center gap-6 ml-6">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Issued</p>
                            <p className="text-sm text-gray-700">{formatDate(issue.issueDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-orange-500 uppercase tracking-wide font-medium">Due Today</p>
                            <p className="text-sm text-gray-900 font-medium">{formatDate(issue.returnDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        disabled={markingReturnedIds.has(issue.issueId)}
                        onClick={(e) => {
                          e.stopPropagation();
                            handleReturn(issue.issueId);
                          }}
                          className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 border-2 ${
                            markingReturnedIds.has(issue.issueId)
                            ? "bg-white text-blue-900 border-blue-300 opacity-60 cursor-not-allowed"
                            : "bg-transparent text-blue-900 border-blue-700 hover:bg-blue-50 hover:border-blue-900 group-hover:scale-105"
                          }`}
                          >
                          {markingReturnedIds.has(issue.issueId) ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">Return</span>
                          </button>
                        </div>

                        {/* Mobile Dates */}
                    <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Issued: </span>
                        <span className="text-gray-700">{formatDate(issue.issueDate)}</span>
                      </div>
                      <div>
                        <span className="text-orange-500">Due: </span>
                        <span className="text-gray-900 font-medium">{formatDate(issue.returnDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Pending Returns Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection("allPending")}
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">All Pending Returns</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {categorizedIssues.allPending.length}
            </span>
          </div>
          {expandedSections.allPending ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.allPending && (
          <div className="border-t border-gray-200">
            {categorizedIssues.allPending.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending returns
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issued
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categorizedIssues.allPending.map((issue) => (
                      <tr 
                        key={issue.issueId} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onDoubleClick={() => setEditIssue(issue)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{issue.userNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <BookOpenIcon className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{issue.bookId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(issue.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(issue.returnDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.returned, issue.returnDate)}`}>
                            {getStatusText(issue.returned, issue.returnDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReturn(issue.issueId);
                            }}
                            disabled={markingReturnedIds.has(issue.issueId)}
                            className={`text-green-600 hover:text-green-900 mr-3 ${
                              markingReturnedIds.has(issue.issueId) ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {markingReturnedIds.has(issue.issueId) ? (
                              <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditIssue(issue);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Returned Issues Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection("returned")}
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Returned Issues</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {issues.filter(i => i.returned === 1).length}
            </span>
          </div>
          {expandedSections.returned ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.returned && (
          <div className="border-t border-gray-200 p-4">
            {/* Pill Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                ["returnedDay", "Today"],
                ["returnedWeek", "This Week"],
                ["returnedMonth", "This Month"],
                ["returnedYear", "This Year"],
                ["returnedPrevious", "Previous Years"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setReturnedFilter(key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    returnedFilter === key
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {filteredReturns.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {{
                  returnedDay:    "No returns recorded today",
                  returnedWeek:   "No returns recorded this week",
                  returnedMonth:  "No returns recorded this month",
                  returnedYear:   "No returns recorded this year",
                  returnedPrevious: "No returns recorded in previous years",
                }[returnedFilter]}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReturns.map((issue) => (
                      <tr
                        key={issue.issueId}
                        className="hover:bg-gray-50 cursor-pointer"
                        onDoubleClick={() => setEditIssue(issue)}
                      >
                        {/* User ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {issue.userNo}
                            </div>
                          </div>
                        </td>

                        {/* Book ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <BookOpenIcon className="h-5 w-5" />
                            </div>
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {issue.bookId}
                            </div>
                          </div>
                        </td>

                        {/* Dates & Duration */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(issue.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(issue.returnDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {issue.time} days
                        </td>

                        {/* Edit action */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditIssue(issue);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Issue Dialog */}
    {editIssue && (
      <Dialog
        open={true}
        onClose={() => setEditIssue(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Edit Issue Details
              </Dialog.Title>
              <button
                onClick={() => setEditIssue(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Create update object without _id (immutable field)
                  const { _id, ...updateData } = editIssue;
                  const updated = {
                    ...updateData,
                    issueDate: new Date(editIssue.issueDate).toISOString(),
                    returnDate: new Date(editIssue.returnDate).toISOString(),
                    time: editIssue.time.toString(), // Keep as string to match your structure
                    userNo: parseInt(editIssue.userNo), // Convert to number
                    bookId: parseInt(editIssue.bookId), // Convert to number
                    returned: parseInt(editIssue.returned) // Ensure returned is a number
                  };
                  
                  // Send update data without _id, but include _id for identification
                  await window.electronAPI.updateIssue({ _id, ...updated });
                  
                  // Update local state with the complete object including _id
                  setIssues((prev) =>
                    prev.map((i) =>
                      i._id === _id ? { _id, ...updated } : i
                    )
                  );
                  setEditIssue(null);
                } catch (error) {
                  console.error("Failed to update issue:", error);
                  alert("Failed to update issue");
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User No
                  </label>
                  <input
                    type="number"
                    value={editIssue.userNo || ""}
                    onChange={(e) =>
                      setEditIssue({ ...editIssue, userNo: parseInt(e.target.value) || "" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book ID
                  </label>
                  <input
                    type="number"
                    value={editIssue.bookId || ""}
                    onChange={(e) =>
                      setEditIssue({ ...editIssue, bookId: parseInt(e.target.value) || "" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={
                      editIssue.issueDate 
                        ? new Date(editIssue.issueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        // Create date at midnight UTC to avoid timezone issues
                        const date = new Date(e.target.value + "T20:00:00.000Z");
                        setEditIssue({
                          ...editIssue,
                          issueDate: date.toISOString(),
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={
                      editIssue.returnDate 
                        ? new Date(editIssue.returnDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        // Create date at midnight UTC to avoid timezone issues
                        const date = new Date(e.target.value + "T20:00:00.000Z");
                        setEditIssue({
                          ...editIssue,
                          returnDate: date.toISOString(),
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="text"
                  value={editIssue.time || ""}
                  onChange={(e) =>
                    setEditIssue({
                      ...editIssue,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Status
                </label>
                <select
                  value={editIssue.returned || 0}
                  onChange={(e) =>
                    setEditIssue({
                      ...editIssue,
                      returned: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Not Returned</option>
                  <option value={1}>Returned</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditIssue(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    )}

    </div>
  );
};

export default ViewIssues;