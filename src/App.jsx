import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import IssueBook from './pages/IssueBook';
import ViewIssues from './pages/ViewIssues';
import Settings from './pages/Settings';
import AddBook from './pages/AddBook';
import Members from './pages/Members';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/issue-book" replace />} />
            <Route path="/issue-book" element={<IssueBook />} />
            <Route path="/view-issues" element={<ViewIssues />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/members" element={<Members />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
