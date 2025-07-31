import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import ConfirmDialog from "../components/ConfirmDialog";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    userDOB: dayjs().format("YYYY-MM-DD"),
    userClass: "",
    userNo: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUserNo, setDeleteUserNo] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userNo.toString().includes(searchTerm)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.getMembers();
      if (result.success) {
        setMembers(result.data);
        setFilteredMembers(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const memberData = {
        ...formData,
        userDOB: new Date(formData.userDOB),
      };

      if (editingId) {
        const result = await window.electronAPI.updateMember(editingId, memberData);
        if (result.success) {
          setEditingId(null);
        }
      } else {
        await window.electronAPI.addMember(memberData);
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      userName: member.userName,
      userDOB: dayjs(member.userDOB).format("YYYY-MM-DD"),
      userClass: member.userClass,
      userNo: member.userNo,
    });
    setEditingId(member.userNo);
    setIsFormOpen(true);
  };

  const handleDelete = (userNo) => {
    setDeleteUserNo(userNo);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserNo) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.deleteMember(deleteUserNo);
      if (result.success) {
        fetchMembers();
      }
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setDeleteUserNo(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteUserNo(null);
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      userDOB: dayjs().format("YYYY-MM-DD"),
      userClass: "",
      userNo: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {showConfirm && (
        <ConfirmDialog
          title="Delete Member"
          message="Are you sure you want to delete this member? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Edit Member Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Member" : "Add New Member"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!editingId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      User Number
                    </label>
                    <input
                      type="number"
                      name="userNo"
                      value={formData.userNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="userDOB"
                    value={formData.userDOB}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Class
                  </label>
                  <input
                    type="text"
                    name="userClass"
                    value={formData.userClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    required
                  />
                </div>


              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-400 transition-all font-medium shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span>{editingId ? "Update Member" : "Add Member"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserIcon className="w-9 h-9 text-gray-800" />
            Member Management
          </h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-3 bg-gray-900 text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all font-medium shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, class or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Member Table */}
      <div className="overflow-hidden rounded-xl border border-gray-300 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-bold">User No</th>
              <th className="px-6 py-4 text-left font-bold">Full Name</th>
              <th className="px-6 py-4 text-left font-bold">Class</th>
              <th className="px-6 py-4 text-left font-bold">Date of Birth</th>
              <th className="px-6 py-4 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-700">Loading members...</span>
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <div className="flex flex-col items-center justify-center py-4">
                    <UserIcon className="w-16 h-16 text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-700">No members found</p>
                    <p className="mt-1 text-gray-500">Try adjusting your search or add a new member</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr 
                  key={member.userNo} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{member.userNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <UserIcon className="w-5 h-5 text-gray-700" />
                      </div>
                      <span className="font-medium">{member.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-lg font-medium">
                      {member.userClass}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{dayjs(member.userDOB).format("MMM D, YYYY")}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(member)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(member.userNo)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default Members;
