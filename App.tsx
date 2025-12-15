import React, { useState, useEffect } from 'react';
import { Country, Aircraft, AppView, StatDefinition } from './types';
import { 
    MOCK_COUNTRIES, INITIAL_STAT_DEFINITIONS, INITIAL_CATEGORIES,
    MOCK_AIRCRAFT, INITIAL_AIRCRAFT_STAT_DEFINITIONS, INITIAL_AIRCRAFT_CATEGORIES 
} from './constants';
import { generateCountryData, generateAircraftData } from './services/geminiService';
import { subscribeToData, initializeDatabase, subscribeToAuth, saveDatabase } from './services/firebase';
import { CountryDetail } from './components/CountryDetail';
import { AircraftDetail } from './components/AircraftDetail';
import { ComparisonTool } from './components/ComparisonTool';
import { AdminPortal } from './components/AdminPortal';
import { Login } from './components/Login';
import { User } from 'firebase/auth';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.RANKINGS);
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Data State (Driven by Firebase)
  const [countries, setCountries] = useState<Country[]>(MOCK_COUNTRIES);
  const [statDefinitions, setStatDefinitions] = useState<StatDefinition[]>(INITIAL_STAT_DEFINITIONS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  
  const [aircrafts, setAircrafts] = useState<Aircraft[]>(MOCK_AIRCRAFT);
  const [aircraftStats, setAircraftStats] = useState<StatDefinition[]>(INITIAL_AIRCRAFT_STAT_DEFINITIONS);
  const [aircraftCats, setAircraftCats] = useState<string[]>(INITIAL_AIRCRAFT_CATEGORIES);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- FIREBASE INITIALIZATION ---
  useEffect(() => {
    // 1. Initialize DB (create default data if empty)
    initializeDatabase();

    // 2. Subscribe to Data Changes
    const unsubscribeData = subscribeToData((data) => {
      if (data) {
        if (data.countries) setCountries(data.countries);
        if (data.statDefinitions) setStatDefinitions(data.statDefinitions);
        if (data.categories) setCategories(data.categories);
        
        if (data.aircrafts) setAircrafts(data.aircrafts);
        if (data.aircraftStats) setAircraftStats(data.aircraftStats);
        if (data.aircraftCats) setAircraftCats(data.aircraftCats);
      }
      setLoadingData(false);
    });

    // 3. Subscribe to Auth Changes
    const unsubscribeAuth = subscribeToAuth((u) => {
      setUser(u);
    });

    return () => {
      unsubscribeData();
      unsubscribeAuth();
    };
  }, []);

  // --- SAVE HANDLERS (Wrappers for Firebase) ---
  const handleUpdateCountries = (newData: Country[]) => saveDatabase({ countries: newData });
  const handleUpdateCountryStats = (newData: StatDefinition[]) => saveDatabase({ statDefinitions: newData });
  const handleUpdateCountryCats = (newData: string[]) => saveDatabase({ categories: newData });
  
  const handleUpdateAircrafts = (newData: Aircraft[]) => saveDatabase({ aircrafts: newData });
  const handleUpdateAircraftStats = (newData: StatDefinition[]) => saveDatabase({ aircraftStats: newData });
  const handleUpdateAircraftCats = (newData: string[]) => saveDatabase({ aircraftCats: newData });


  // Sorting
  const sortedCountries = [...countries].sort((a, b) => b.score - a.score);
  const sortedAircraft = [...aircrafts].sort((a, b) => b.score - a.score);

  const handleCountryClick = (id: string) => {
    setSelectedId(id);
    setView(AppView.DETAIL);
  };

  const handleAircraftClick = (id: string) => {
      setSelectedId(id);
      setView(AppView.AIRCRAFT_DETAIL);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (view === AppView.AIRCRAFT_RANKINGS || view === AppView.AIRCRAFT_DETAIL) {
        // Search Aircraft
        const existing = aircrafts.find(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (existing) {
            handleAircraftClick(existing.id);
            setSearchQuery('');
            return;
        }
        setIsGenerating(true);
        const newAircraft = await generateAircraftData(searchQuery, aircrafts.length + 1, aircraftStats);
        if (newAircraft) {
            // Save directly to DB via the wrapper
            handleUpdateAircrafts([...aircrafts, newAircraft]);
            handleAircraftClick(newAircraft.id);
        } else {
            alert("Could not generate aircraft data.");
        }
        setIsGenerating(false);

    } else {
        // Search Country
        const existing = countries.find(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (existing) {
            handleCountryClick(existing.id);
            setSearchQuery('');
            return;
        }
        setIsGenerating(true);
        const newCountry = await generateCountryData(searchQuery, countries.length + 1, statDefinitions);
        if (newCountry) {
             // Save directly to DB via the wrapper
            handleUpdateCountries([...countries, newCountry]);
            handleCountryClick(newCountry.id);
        } else {
            alert("Could not generate country data.");
        }
        setIsGenerating(false);
    }
    setSearchQuery('');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-4xl text-amber-500"></i>
          <p className="uppercase font-bold tracking-widest text-sm">Connecting to Secure Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.RANKINGS)}>
            <i className="fas fa-globe-americas text-3xl text-amber-500"></i>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Global<span className="text-amber-500">Defense</span></h1>
              <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Intelligence Index</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setView(AppView.RANKINGS)}
              className={`text-sm font-bold uppercase tracking-wider hover:text-amber-500 transition-colors ${view === AppView.RANKINGS || view === AppView.DETAIL ? 'text-amber-500' : 'text-slate-400'}`}
            >
              Nations
            </button>
            <button 
              onClick={() => setView(AppView.AIRCRAFT_RANKINGS)}
              className={`text-sm font-bold uppercase tracking-wider hover:text-amber-500 transition-colors ${view === AppView.AIRCRAFT_RANKINGS || view === AppView.AIRCRAFT_DETAIL ? 'text-sky-500' : 'text-slate-400'}`}
            >
              Aircraft DB
            </button>
            <button 
              onClick={() => setView(AppView.COMPARE)}
              className={`text-sm font-bold uppercase tracking-wider hover:text-amber-500 transition-colors ${view === AppView.COMPARE ? 'text-amber-500' : 'text-slate-400'}`}
            >
              Compare
            </button>
            <button 
              onClick={() => setView(AppView.ADMIN)}
              className={`text-sm font-bold uppercase tracking-wider hover:text-amber-500 transition-colors ${view === AppView.ADMIN ? 'text-red-500' : 'text-slate-400'}`}
            >
              {user ? 'Admin (Logged In)' : 'Admin Login'}
            </button>
          </div>

          {/* Mobile Nav Icons */}
          <div className="flex md:hidden items-center gap-4">
             <button 
              onClick={() => setView(AppView.RANKINGS)}
              className={`text-lg hover:text-amber-500 transition-colors ${view === AppView.RANKINGS ? 'text-amber-500' : 'text-slate-400'}`}
            >
              <i className="fas fa-flag"></i>
            </button>
            <button 
              onClick={() => setView(AppView.AIRCRAFT_RANKINGS)}
              className={`text-lg hover:text-sky-500 transition-colors ${view === AppView.AIRCRAFT_RANKINGS ? 'text-sky-500' : 'text-slate-400'}`}
            >
              <i className="fas fa-fighter-jet"></i>
            </button>
            <button 
              onClick={() => setView(AppView.ADMIN)}
              className={`text-lg hover:text-red-500 transition-colors ${view === AppView.ADMIN ? 'text-red-500' : 'text-slate-400'}`}
            >
              <i className="fas fa-user-shield"></i>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
             <input 
               type="text" 
               placeholder={view === AppView.AIRCRAFT_RANKINGS ? "Find Aircraft..." : "Find Nation..."} 
               className="bg-slate-800 border border-slate-600 rounded-full py-1.5 px-4 text-sm w-64 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
               {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
             </button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* NATIONS RANKINGS */}
        {view === AppView.RANKINGS && (
          <div className="animate-fade-in">
             <div className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase mb-2">World Powers</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Global military strength aggregate rankings.</p>
             </div>

             <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-900 p-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700">
                   <div className="col-span-1 text-center">Rank</div>
                   <div className="col-span-1">Flag</div>
                   <div className="col-span-4 md:col-span-3">Nation</div>
                   <div className="col-span-3 md:col-span-2 text-right">Score</div>
                   <div className="hidden md:block col-span-3 text-right">Manpower</div>
                   <div className="hidden md:block col-span-2 text-right">Budget</div>
                </div>
                <div className="divide-y divide-slate-700">
                  {sortedCountries.map((c, idx) => (
                    <div 
                      key={c.id} 
                      onClick={() => handleCountryClick(c.id)}
                      className="grid grid-cols-12 p-4 items-center hover:bg-slate-700/50 cursor-pointer transition-colors group"
                    >
                      <div className="col-span-1 text-center font-mono text-lg font-bold text-slate-400 group-hover:text-amber-500">
                        {idx + 1}
                      </div>
                      <div className="col-span-1">
                        <img src={`https://flagcdn.com/w40/${c.flagCode}.png`} alt={c.name} className="h-6 rounded shadow-sm" />
                      </div>
                      <div className="col-span-4 md:col-span-3 font-bold text-lg text-white">
                        {c.name} {c.isGenerated && <i className="fas fa-magic text-xs text-indigo-400 ml-2"></i>}
                      </div>
                      <div className="col-span-3 md:col-span-2 text-right font-mono text-emerald-400 font-bold">
                        {c.score}
                      </div>
                      <div className="hidden md:block col-span-3 text-right font-mono text-slate-300">
                        {(c.stats['activePersonnel'] || 0).toLocaleString()}
                      </div>
                      <div className="hidden md:block col-span-2 text-right font-mono text-green-400">
                        ${((c.stats['defenseBudget'] || 0) / 1e9).toFixed(1)}B
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* AIRCRAFT RANKINGS */}
        {view === AppView.AIRCRAFT_RANKINGS && (
          <div className="animate-fade-in">
             <div className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase mb-2 text-white">Military <span className="text-sky-500">Aircraft</span> Database</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Comparison of next-generation air dominance platforms.</p>
             </div>

             <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-900 p-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700">
                   <div className="col-span-1 text-center">Rank</div>
                   <div className="col-span-5">Aircraft Name</div>
                   <div className="col-span-2">Origin</div>
                   <div className="col-span-2 text-right">Rating</div>
                   <div className="col-span-2 text-right">Max Speed</div>
                </div>
                <div className="divide-y divide-slate-700">
                  {sortedAircraft.map((a, idx) => (
                    <div 
                      key={a.id} 
                      onClick={() => handleAircraftClick(a.id)}
                      className="grid grid-cols-12 p-4 items-center hover:bg-slate-700/50 cursor-pointer transition-colors group"
                    >
                      <div className="col-span-1 text-center font-mono text-lg font-bold text-slate-400 group-hover:text-sky-500">
                        {idx + 1}
                      </div>
                      <div className="col-span-5 font-bold text-lg text-white group-hover:text-sky-400 transition-colors">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-fighter-jet text-slate-500"></i>
                            {a.name}
                            {a.isGenerated && <i className="fas fa-magic text-xs text-indigo-400"></i>}
                        </div>
                      </div>
                      <div className="col-span-2 text-slate-300 text-sm font-bold">
                        {a.origin}
                      </div>
                      <div className="col-span-2 text-right font-mono text-emerald-400 font-bold">
                        {a.score}
                      </div>
                      <div className="col-span-2 text-right font-mono text-sky-300">
                         {a.stats['maxSpeed'] ? `Mach ${a.stats['maxSpeed']}` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* DETAIL VIEWS */}
        {view === AppView.DETAIL && selectedId && (
          <CountryDetail 
            country={countries.find(c => c.id === selectedId)!} 
            statDefinitions={statDefinitions}
            onBack={() => setView(AppView.RANKINGS)}
          />
        )}
        
        {view === AppView.AIRCRAFT_DETAIL && selectedId && (
          <AircraftDetail 
            aircraft={aircrafts.find(a => a.id === selectedId)!} 
            statDefinitions={aircraftStats}
            onBack={() => setView(AppView.AIRCRAFT_RANKINGS)}
          />
        )}

        {/* COMPARE VIEW */}
        {view === AppView.COMPARE && (
          <div className="animate-fade-in">
             <div className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase mb-2">Direct Comparison</h2>
                <p className="text-slate-400">Select two nations to analyze their military capabilities side-by-side.</p>
             </div>
             <ComparisonTool countries={countries} statDefinitions={statDefinitions} />
          </div>
        )}

        {/* ADMIN VIEW OR LOGIN */}
        {view === AppView.ADMIN && (
          <>
            {!user ? (
              <Login onCancel={() => setView(AppView.RANKINGS)} />
            ) : (
              <AdminPortal 
                countries={countries}
                countryStats={statDefinitions}
                countryCats={categories}
                aircrafts={aircrafts}
                aircraftStats={aircraftStats}
                aircraftCats={aircraftCats}
                onUpdateCountries={handleUpdateCountries}
                onUpdateCountryStats={handleUpdateCountryStats}
                onUpdateCountryCats={handleUpdateCountryCats}
                onUpdateAircrafts={handleUpdateAircrafts}
                onUpdateAircraftStats={handleUpdateAircraftStats}
                onUpdateAircraftCats={handleUpdateAircraftCats}
                onExit={() => setView(AppView.RANKINGS)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm mb-2">
            Global Defense Index &copy; 2024. All data is for educational and simulation purposes.
          </p>
          <div className="text-slate-700 text-xs">
            Powered by Google Gemini 2.5 Flash | React | Firebase | Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;