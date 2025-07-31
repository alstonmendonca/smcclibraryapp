import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const AddBook = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [formData, setFormData] = useState({ bookName: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => {
      const name = (book?.bookName || '').toLowerCase();
      const location = (book?.location || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || location.includes(term);
    });
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books, searchTerm]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const list = await window.electronAPI?.getBooks() || [];
      setBooks(list);
      setFilteredBooks(list);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ bookName: '', location: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const { bookName, location } = formData;
    if (!bookName.trim() || !location.trim()) return;
    
    setLoading(true);
    try {
      if (editingId) {
        const res = await window.electronAPI?.updateBook({ bookId: editingId, bookName, location });
        if (res?.success) {
          setBooks((prev) =>
            prev.map((b) => (b.bookId === editingId ? { ...b, bookName, location } : b))
          );
        }
      } else {
        const res = await window.electronAPI?.addBook({ bookName, location });
        if (res?.success) {
          setBooks((prev) => [...prev, res.book]);
        }
      }
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.bookId);
    setFormData({ bookName: book.bookName, location: book.location || '' });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ bookName: '', location: '' });
    setShowForm(true);
  };

  const confirmDelete = (bookId) => {
    setToDeleteId(bookId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await window.electronAPI?.deleteBook(toDeleteId);
      if (res?.success) {
        setBooks((prev) => prev.filter((b) => b.bookId !== toDeleteId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setToDeleteId(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpenIcon className="h-8 w-8 text-black" />
            <h1 className="text-4xl font-bold text-black">Books Collection</h1>
          </div>
          <p className="text-gray-600">Manage your personal library</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Book
            </button>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : paginatedBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No books found</h3>
              <p className="text-gray-400">Add your first book to get started</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-1 text-sm font-semibold text-gray-700 uppercase tracking-wide">ID</div>
                <div className="col-span-5 text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <BookOpenIcon className="h-4 w-4" />
                  Book Name
                </div>
                <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  Location
                </div>
                <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Date Added
                </div>
                <div className="col-span-2 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {paginatedBooks.map((book, index) => (
                  <div
                    key={book.bookId}
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <div className="col-span-1 text-sm font-mono text-gray-500">
                      #{book.bookId}
                    </div>
                    <div className="col-span-5 text-gray-900 font-medium">
                      {book.bookName}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border">
                        {book.location}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {new Date(book.DateAdded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(book)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit book"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(book.bookId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete book"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Book' : 'Add New Book'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Name
                  </label>
                  <input
                    type="text"
                    value={formData.bookName}
                    onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="Enter book title"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="e.g. 3B"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editingId ? 'Update Book' : 'Add Book'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Book</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this book? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBook;