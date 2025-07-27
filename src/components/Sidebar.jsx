import { HomeIcon, BookOpenIcon, Cog6ToothIcon, ClockIcon, UserIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'
    }`;

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-800">
      <nav className="flex flex-col flex-1 px-2 py-4 space-y-2">
        <NavLink to="/issue-book" className={linkClass}>
          <BookOpenIcon className="w-5 h-5 mr-3" />
          Issue Book
        </NavLink>
        <NavLink to="/view-issues" className={linkClass}>
          <ClockIcon className="w-5 h-5 mr-3" />
          View Issues
        </NavLink>
        <NavLink to="/add-book" className={linkClass}>
          <PlusCircleIcon className="w-5 h-5 mr-3" />
          Add Book
        </NavLink>
        <NavLink to="/members" className={linkClass}>
          <UserIcon className="w-5 h-5 mr-3" />
          Members
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Cog6ToothIcon className="w-5 h-5 mr-3" />
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
