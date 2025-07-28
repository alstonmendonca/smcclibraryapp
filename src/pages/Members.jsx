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
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Member" : "Add New Member"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="userDOB"
                    value={formData.userDOB}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Class
                  </label>
                  <input
                    type="text"
                    name="userClass"
                    value={formData.userClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-300"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      {editingId ? "Update Member" : "Add Member"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-2">Manage library members</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-black text-white py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
              placeholder="Search members by name, class or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    {searchTerm ? "No members match your search" : "No members found"}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.userNo} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{member.userNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                          <UserIcon className="w-5 h-5 text-gray-500" />
                        </div>
                        <span className="font-medium">{member.userName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {dayjs(member.userDOB).format("DD MMM YYYY")}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {member.userClass}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {dayjs(member.dateAdded).format("DD MMM YYYY")}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.userNo)}
                          className="text-gray-500 hover:text-red-600"
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
    </div>
  );
};

export default Members;