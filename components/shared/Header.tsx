import React from 'react';
import { auth } from '../../services/firebase';

interface HeaderProps {
  userEmail: string | null;
  userRole?: 'user' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ userEmail, userRole }) => {
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <i className="fas fa-dollar-sign text-2xl text-emerald-500 mr-2"></i>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">PK Earn App</h1>
          </div>
          <div className="flex items-center">
            {userEmail && (
              <div className="text-right mr-4">
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{userEmail}</span>
                {userRole && <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 font-semibold px-2 py-0.5 rounded-full ml-2 capitalize">{userRole}</span>}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;