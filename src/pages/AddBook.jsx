import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const AddBook = () => {
  const [books, setBooks] = useState([]);
  const [newBookName, setNewBookName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const books = await window.electronAPI.getBooks();
      setBooks(books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!newBookName.trim()) return;
    
    try {
      const result = await window.electronAPI.addBook({ bookName: newBookName });
      if (result.success) {
        setBooks([...books, result.book]);
        setNewBookName('');
      }
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const startEditing = (book) => {
    setEditingId(book.bookId);
    setEditName(book.bookName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;

    try {
      const result = await window.electronAPI.updateBook({
        bookId: editingId, // now using bookId instead of _id
        bookName: editName
      });

      if (result.success) {
        setBooks(books.map(book =>
          book.bookId === editingId ? { ...book, bookName: editName } : book
        ));
        cancelEditing();
      }
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };


  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const result = await window.electronAPI.deleteBook(bookId);
      if (result.success) {
        setBooks(books.filter(book => book.bookId !== bookId));
      } else {
        alert(result.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Books Collection</h1>
        
        {/* Add Book Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Book</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              placeholder="Enter book name"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              onClick={handleAddBook}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
            >
              Add Book
            </button>
          </div>
        </div>

        {/* Books List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium border-b">
            <div className="col-span-3">Book ID</div>
            <div className="col-span-4">Book Name</div>
            <div className="col-span-3">Date Added</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading books...</div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No books found</div>
          ) : (
            books.map((book) => (
              <div 
                key={book._id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 text-sm border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="col-span-3 text-gray-600">{book.bookId}</div>
                
                <div className="col-span-4">
                  {editingId === book.bookId ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-900">{book.bookName}</span>
                  )}
                </div>
                
                <div className="col-span-3 text-gray-500">
                  {new Date(book.DateAdded).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="col-span-2 flex justify-end space-x-2">
                  {editingId === book.bookId ? (
                    <>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Cancel"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={saveEdit}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Save"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(book)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.bookId)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBook;