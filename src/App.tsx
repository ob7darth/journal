import { useState, useEffect } from 'react';
import { format, addDays, startOfYear } from 'date-fns';
import { Book, Calendar, PenTool, ChevronLeft, ChevronRight, ExternalLink, Home } from 'lucide-react';
import { ReadingPlan } from './types/ReadingPlan';
import { SOAPEntry } from './types/SOAPEntry';
import { authService, User as AuthUser } from './services/AuthService';
import Header from './components/Header';
import ReadingView from './components/ReadingView';
import SOAPForm from './components/SOAPForm';
import ProgressTracker from './components/ProgressTracker';
import ShareModal from './components/ShareModal';
import ResourcesPanel from './components/ResourcesPanel';
import SplashScreen from './components/SplashScreen';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import { generateFullYearPlan } from './data/readingPlan';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [readingPlan] = useState<ReadingPlan>(generateFullYearPlan());
  
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'guest'>('guest');
  const [showProfile, setShowProfile] = useState(false);
  
  // Calculate today's day of year
  const getTodaysDayOfYear = () => {
    const now = new Date();
    const startOfCurrentYear = startOfYear(now);
    const dayOfYear = Math.floor((now.getTime() - startOfCurrentYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(dayOfYear, 365); // 2025 is not a leap year, so max 365 days
  };

  const [todaysDayOfYear] = useState(getTodaysDayOfYear());
  const [currentDay, setCurrentDay] = useState(todaysDayOfYear);
  const [soapEntries, setSoapEntries] = useState<Record<number, SOAPEntry>>({});
  const [activeView, setActiveView] = useState<'reading' | 'soap' | 'progress' | 'resources'>('reading');
  const [showShareModal, setShowShareModal] = useState(false);
  const [entryToShare, setEntryToShare] = useState<SOAPEntry | null>(null);

  // Initialize auth service
  useEffect(() => {
    authService.onAuthChange((authState) => {
      setUser(authState.user);
      if (authState.user) {
        loadUserEntries();
      }
    });

    // Check if user is already authenticated
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserEntries();
    } else {
      // Show auth modal after splash screen
      setTimeout(() => {
        if (!authService.isAuthenticated()) {
          setShowAuthModal(true);
        }
      }, 3000);
    }
  }, []);

  // Load user-specific entries
  const loadUserEntries = () => {
    const storageKey = authService.getStorageKey('soap-entries');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSoapEntries(JSON.parse(saved));
    }
  };

  // Save entries with user-specific storage
  const saveSOAPEntry = (day: number, entry: SOAPEntry) => {
    const updated = { ...soapEntries, [day]: entry };
    setSoapEntries(updated);
    
    const storageKey = authService.getStorageKey('soap-entries');
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Sync to cloud if member
    if (user && !user.isGuest) {
      authService.syncData().catch(console.error);
    }
  };

  const handleShareEntry = (entry: SOAPEntry) => {
    setEntryToShare(entry);
    setShowShareModal(true);
  };

  const goToToday = () => {
    setCurrentDay(todaysDayOfYear);
    setActiveView('reading');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Reload entries for the new user
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      loadUserEntries();
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'guest') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const currentReading = readingPlan.days.find(d => d.day === currentDay);
  const currentEntry = soapEntries[currentDay];

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === 'next' && currentDay < readingPlan.days.length) {
      setCurrentDay(currentDay + 1);
    }
    setActiveView('reading');
  };

  // Get the actual date for the current day
  const getCurrentDate = () => {
    const startDate = new Date(2025, 0, 1); // January 1, 2025
    return addDays(startDate, currentDay - 1);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show auth modal if not authenticated
  if (!user && !showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Life Journal</h1>
          <p className="text-gray-600 mb-6">Choose how you'd like to get started</p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <button
              onClick={() => openAuthModal('guest')}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue as Guest
            </button>
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      <Header 
        planName={readingPlan.name}
        currentDay={currentDay}
        totalDays={readingPlan.days.length}
        user={user}
        onUserClick={() => setShowProfile(true)}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateDay('prev')}
            disabled={currentDay === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Previous Day
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Day {currentDay}</h2>
              <p className="text-sm text-gray-600">{format(getCurrentDate(), 'MMMM d')}</p>
            </div>
            
            {/* Today Button */}
            {currentDay !== todaysDayOfYear && (
              <button
                onClick={goToToday}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Home size={18} />
                Today
              </button>
            )}
          </div>
          
          <button
            onClick={() => navigateDay('next')}
            disabled={currentDay === readingPlan.days.length}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Day
            <ChevronRight size={20} />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveView('reading')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
              activeView === 'reading' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Book size={18} />
            Reading
          </button>
          <button
            onClick={() => setActiveView('soap')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
              activeView === 'soap' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PenTool size={18} />
            SOAP
          </button>
          <button
            onClick={() => setActiveView('progress')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
              activeView === 'progress' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar size={18} />
            Progress
          </button>
          <button
            onClick={() => setActiveView('resources')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
              activeView === 'resources' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ExternalLink size={18} />
            Resources
          </button>
        </div>

        {/* Content */}
        {activeView === 'reading' && currentReading && (
          <ReadingView 
            reading={currentReading}
            onStartSOAP={() => setActiveView('soap')}
            hasSOAPEntry={!!currentEntry}
            onShareEntry={currentEntry ? () => handleShareEntry(currentEntry) : undefined}
          />
        )}

        {activeView === 'soap' && currentReading && (
          <SOAPForm
            day={currentDay}
            reading={currentReading}
            existingEntry={currentEntry}
            onSave={saveSOAPEntry}
            onBack={() => setActiveView('reading')}
            onShare={handleShareEntry}
          />
        )}

        {activeView === 'progress' && (
          <ProgressTracker
            readingPlan={readingPlan}
            soapEntries={soapEntries}
            onDaySelect={(day) => {
              setCurrentDay(day);
              setActiveView('reading');
            }}
            onShareEntry={handleShareEntry}
          />
        )}

        {activeView === 'resources' && (
          <ResourcesPanel />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && user && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && entryToShare && (
        <ShareModal
          entry={entryToShare}
          onClose={() => {
            setShowShareModal(false);
            setEntryToShare(null);
          }}
        />
      )}
    </div>
  );
}

export default App;