import { useState, useEffect } from 'react';
import { format, addDays, startOfYear } from 'date-fns';
import { Book, Calendar, PenTool, ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Home } from 'lucide-react';
import { ReadingPlan } from './types/ReadingPlan';
import { SOAPEntry } from './types/SOAPEntry';
import Header from './components/Header';
import ReadingView from './components/ReadingView';
import SOAPForm from './components/SOAPForm';
import ProgressTracker from './components/ProgressTracker';
import ShareModal from './components/ShareModal';
import GroupChat from './components/GroupChat';
import ResourcesPanel from './components/ResourcesPanel';
import { generateFullYearPlan } from './data/readingPlan';

function App() {
  const [readingPlan] = useState<ReadingPlan>(generateFullYearPlan());
  
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
  const [activeView, setActiveView] = useState<'reading' | 'soap' | 'progress' | 'chat' | 'resources'>('reading');
  const [showShareModal, setShowShareModal] = useState(false);
  const [entryToShare, setEntryToShare] = useState<SOAPEntry | null>(null);

  // Load saved entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soap-entries');
    if (saved) {
      setSoapEntries(JSON.parse(saved));
    }
  }, []);

  // Save entries to localStorage
  const saveSOAPEntry = (day: number, entry: SOAPEntry) => {
    const updated = { ...soapEntries, [day]: entry };
    setSoapEntries(updated);
    localStorage.setItem('soap-entries', JSON.stringify(updated));
  };

  const handleShareEntry = (entry: SOAPEntry) => {
    setEntryToShare(entry);
    setShowShareModal(true);
  };

  const goToToday = () => {
    setCurrentDay(todaysDayOfYear);
    setActiveView('reading');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      <Header 
        planName={readingPlan.name}
        currentDay={currentDay}
        totalDays={readingPlan.days.length}
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
            onClick={() => setActiveView('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors whitespace-nowrap ${
              activeView === 'chat' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageCircle size={18} />
            Chat
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

        {activeView === 'chat' && (
          <GroupChat />
        )}

        {activeView === 'resources' && (
          <ResourcesPanel />
        )}
      </main>

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