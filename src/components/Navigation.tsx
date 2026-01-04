
import React from 'react';
import { MAX_FREE_AVATARS, STRIPE_PAYMENT_LINK } from '../constants';

type View = 'create' | 'profile' | 'generator';

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  userEmail: string;
  purchasedSlots?: number;
  avatarsCreated?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
    currentView, 
    setCurrentView, 
    onLogout, 
    userEmail,
    purchasedSlots = 0,
    avatarsCreated = 0
}) => {
  const isAdmin = userEmail.toLowerCase() === 'dreknows@gmail.com';
  const totalLimit = MAX_FREE_AVATARS + purchasedSlots;
  const remainingSlots = isAdmin 
    ? 9999 
    : Math.max(0, totalLimit - avatarsCreated);

  const handleBuy = () => {
      if (STRIPE_PAYMENT_LINK.includes("replace_with")) {
          alert("Error: Stripe Payment Link not configured.");
          return;
      }
      window.location.href = STRIPE_PAYMENT_LINK;
  };

  return (
    <nav className="w-full bg-gray-800 border-b border-gray-700 shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('create')}>
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AI Avatar Creator Pro
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
            <button
                onClick={() => setCurrentView('create')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'create' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
                Creator
            </button>
            <button
                onClick={() => setCurrentView('profile')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'profile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
                My Profile
            </button>
            <button
                onClick={() => setCurrentView('generator')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'generator' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
                Image Studio
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-gray-900 rounded-full px-3 py-1 border border-gray-700">
            <span className="text-xs text-gray-400">Credits:</span>
            <span className={`text-xs font-bold ${remainingSlots > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {isAdmin ? '∞' : remainingSlots}
            </span>
            <button 
                onClick={handleBuy}
                className="ml-1 w-5 h-5 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-full text-white text-[10px] transition-colors"
                title="Buy more slots"
            >
                +
            </button>
        </div>

        <span className="text-xs text-gray-500 hidden sm:inline-block">{userEmail}</span>
        <button 
           onClick={onLogout}
           className="text-xs sm:text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
         >
           Logout
         </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex space-x-4 absolute top-14 left-0 w-full bg-gray-800 p-2 border-b border-gray-700 justify-center">
            <button onClick={() => setCurrentView('create')} className={currentView === 'create' ? 'text-white' : 'text-gray-400'}>Creator</button>
            <button onClick={() => setCurrentView('profile')} className={currentView === 'profile' ? 'text-white' : 'text-gray-400'}>Profile</button>
            <button onClick={() => setCurrentView('generator')} className={currentView === 'generator' ? 'text-white' : 'text-gray-400'}>Studio</button>
      </div>
    </nav>
  );
};
