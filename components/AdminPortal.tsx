import React, { useState, useEffect } from 'react';
import { Country, Aircraft, StatDefinition } from '../types';
import { logoutAdmin } from '../services/firebase';

interface AdminPortalProps {
  countries: Country[];
  countryStats: StatDefinition[];
  countryCats: string[];
  
  aircrafts: Aircraft[];
  aircraftStats: StatDefinition[];
  aircraftCats: string[];

  onUpdateCountries: (countries: Country[]) => void;
  onUpdateCountryStats: (stats: StatDefinition[]) => void;
  onUpdateCountryCats: (categories: string[]) => void;

  onUpdateAircrafts: (aircrafts: Aircraft[]) => void;
  onUpdateAircraftStats: (stats: StatDefinition[]) => void;
  onUpdateAircraftCats: (categories: string[]) => void;

  onExit: () => void;
}

type DBContext = 'countries' | 'aircraft';

export const AdminPortal: React.FC<AdminPortalProps> = ({ 
  countries, countryStats, countryCats,
  aircrafts, aircraftStats, aircraftCats,
  onUpdateCountries, onUpdateCountryStats, onUpdateCountryCats,
  onUpdateAircrafts, onUpdateAircraftStats, onUpdateAircraftCats,
  onExit
}) => {
  const [dbContext, setDbContext] = useState<DBContext>('countries');
  const [activeTab, setActiveTab] = useState<'items' | 'stats' | 'categories'>('items');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Generic item (Country or Aircraft)
  
  // Dynamic Helpers based on Context
  const currentList = dbContext === 'countries' ? countries : aircrafts;
  const currentStats = dbContext === 'countries' ? countryStats : aircraftStats;
  const currentCats = dbContext === 'countries' ? countryCats : aircraftCats;
  
  const [newStat, setNewStat] = useState<Partial<StatDefinition>>({ category: currentCats[0], format: 'number' });
  const [newCategory, setNewCategory] = useState('');
  const [isQuickAddingStat, setIsQuickAddingStat] = useState(false);
  const [deleteConfirmationCat, setDeleteConfirmationCat] = useState<string | null>(null);

  useEffect(() => {
    setNewStat({ category: currentCats[0], format: 'number', id: '', label: '' });
    setNewCategory('');
    setEditingItem(null);
    setIsEditing(false);
    setDeleteConfirmationCat(null);
  }, [dbContext]);

  const handleLogout = () => {
    logoutAdmin();
    // App.tsx handles the state change
  };

  // -- CRUD: Items (Country or Aircraft) --
  const handleEditItem = (item: any) => {
    setEditingItem({ ...item, stats: { ...item.stats } });
    setIsEditing(true);
    setIsQuickAddingStat(false);
  };

  const handleAddNewItem = () => {
    const emptyStats: Record<string, number> = {};
    currentStats.forEach(sd => emptyStats[sd.id] = sd.format === 'slider' ? 1 : 0);
    
    if (dbContext === 'countries') {
        setEditingItem({
            id: `new-${Date.now()}`,
            name: 'New Nation',
            flagCode: 'un',
            score: 50,
            rank: countries.length + 1,
            description: 'Description...',
            stats: emptyStats,
        } as Country);
    } else {
        setEditingItem({
            id: `new-${Date.now()}`,
            name: 'New Aircraft',
            origin: 'Unknown',
            score: 50,
            rank: aircrafts.length + 1,
            description: 'Description...',
            stats: emptyStats,
        } as Aircraft);
    }
    setIsEditing(true);
  };

  const saveItem = () => {
    if (!editingItem) return;
    
    let updatedList = [...currentList] as any[];
    const index = updatedList.findIndex(c => c.id === editingItem.id);
    
    if (index >= 0) {
      updatedList[index] = editingItem;
    } else {
      updatedList.push(editingItem);
    }
    
    updatedList.sort((a, b) => b.score - a.score);
    updatedList = updatedList.map((c, i) => ({ ...c, rank: i + 1 }));

    if (dbContext === 'countries') onUpdateCountries(updatedList);
    else onUpdateAircrafts(updatedList);

    setIsEditing(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Delete this record?')) {
        if (dbContext === 'countries') {
            onUpdateCountries(countries.filter(c => c.id !== id));
        } else {
            onUpdateAircrafts(aircrafts.filter(a => a.id !== id));
        }
    }
  };

  const updateItemField = (field: string, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const updateItemStat = (statId: string, value: string) => {
    if (!editingItem) return;
    const numVal = parseFloat(value) || 0;
    setEditingItem({
      ...editingItem,
      stats: { ...editingItem.stats, [statId]: numVal }
    });
  };

  // -- CRUD: Stats --
  const addStat = (isQuickAdd = false) => {
    if (!newStat.id && !newStat.label) return alert("Label/ID required");
    const id = newStat.id || newStat.label?.toLowerCase().replace(/\s+/g, '_') || '';
    if (currentStats.find(s => s.id === id)) return alert("Stat ID exists");

    const def: StatDefinition = {
      id,
      label: newStat.label!,
      category: newStat.category as string,
      format: newStat.format as any
    };

    const nextStats = [...currentStats, def];
    if (dbContext === 'countries') onUpdateCountryStats(nextStats);
    else onUpdateAircraftStats(nextStats);

    const initialValue = def.format === 'slider' ? 1 : 0;
    
    if (isQuickAdd && editingItem) {
        setEditingItem({
            ...editingItem,
            stats: { ...editingItem.stats, [id]: initialValue }
        });
        setIsQuickAddingStat(false);
    } else {
        const nextList = currentList.map(item => ({
            ...item,
            stats: { ...item.stats, [id]: initialValue }
        }));
        if (dbContext === 'countries') onUpdateCountries(nextList);
        else onUpdateAircrafts(nextList);
    }
    setNewStat({ category: currentCats[0], format: 'number', id: '', label: '' });
  };

  const removeStat = (id: string) => {
    if (window.confirm(`Remove stat "${id}"?`)) {
        if (dbContext === 'countries') {
            onUpdateCountryStats(countryStats.filter(s => s.id !== id));
            onUpdateCountries(countries.map(c => {
                const ns = { ...c.stats }; delete ns[id]; return { ...c, stats: ns };
            }));
        } else {
            onUpdateAircraftStats(aircraftStats.filter(s => s.id !== id));
            onUpdateAircrafts(aircrafts.map(a => {
                const ns = { ...a.stats }; delete ns[id]; return { ...a, stats: ns };
            }));
        }
    }
  };

  // -- CRUD: Categories --
  const addCategory = () => {
    if (!newCategory.trim() || currentCats.includes(newCategory.trim())) return;
    const nextCats = [...currentCats, newCategory.trim()];
    if (dbContext === 'countries') onUpdateCountryCats(nextCats);
    else onUpdateAircraftCats(nextCats);
    setNewCategory('');
  };

  const initiateDeleteCategory = (cat: string) => {
      setDeleteConfirmationCat(cat);
  };

  const confirmDeleteCategory = (catToRemove: string) => {
      const updatedCats = currentCats.filter(c => c !== catToRemove);
      if (dbContext === 'countries') {
          onUpdateCountryCats(updatedCats);
      } else {
          onUpdateAircraftCats(updatedCats);
      }
      setDeleteConfirmationCat(null);
  };

  // --- RENDER EDIT MODAL ---
  if (isEditing && editingItem) {
      return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 overflow-y-auto p-4 animate-fade-in">
             <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-6 mt-10">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-white">Edit {dbContext === 'countries' ? 'Nation' : 'Aircraft'}</h2>
                    <div className="space-x-4">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                        <button onClick={saveItem} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold">Save</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Name</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            value={editingItem.name} onChange={e => updateItemField('name', e.target.value)} />
                    </div>
                    
                    {dbContext === 'countries' ? (
                         <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Flag Code (ISO)</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white uppercase"
                                value={editingItem.flagCode} onChange={e => updateItemField('flagCode', e.target.value)} maxLength={2} />
                        </div>
                    ) : (
                         <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Origin Country</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                value={editingItem.origin} onChange={e => updateItemField('origin', e.target.value)} />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase font-bold text-emerald-500 mb-1">Power Score</label>
                        <input type="number" className="w-full bg-slate-900 border border-emerald-600 rounded p-2 text-emerald-400 font-bold"
                            value={editingItem.score} onChange={e => updateItemField('score', parseFloat(e.target.value))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Description</label>
                        <textarea className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-300 h-24"
                             value={editingItem.description} onChange={e => updateItemField('description', e.target.value)} />
                    </div>
                </div>

                {/* Inline Stats Adder */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white"><i className="fas fa-chart-bar text-amber-500 mr-2"></i> Stats</h3>
                    {!isQuickAddingStat ? (
                        <button onClick={() => setIsQuickAddingStat(true)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded">
                            <i className="fas fa-plus mr-1"></i> Add Metric
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-700 p-2 rounded">
                            <input type="text" placeholder="Name" className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white w-24"
                                value={newStat.label || ''} onChange={(e) => setNewStat({...newStat, label: e.target.value})} />
                            <select className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                value={newStat.category} onChange={(e) => setNewStat({...newStat, category: e.target.value})}>
                                {currentCats.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                value={newStat.format} onChange={(e) => setNewStat({...newStat, format: e.target.value as any})}>
                                <option value="number">Num</option>
                                <option value="slider">1-10</option>
                            </select>
                            <button onClick={() => addStat(true)} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs">Add</button>
                            <button onClick={() => setIsQuickAddingStat(false)} className="text-slate-400 px-2">X</button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentStats.map(def => (
                        <div key={def.id} className="bg-slate-900 p-3 rounded border border-slate-700">
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-bold text-slate-400 truncate" title={def.label}>{def.label}</label>
                                {def.format === 'slider' && <span className="text-xs text-amber-500 font-bold">{editingItem.stats[def.id]?.toFixed(1)}</span>}
                            </div>
                            {def.format === 'slider' ? (
                                <input type="range" min="1" max="10" step="0.1" className="w-full accent-amber-500"
                                    value={editingItem.stats[def.id] || 1} onChange={e => updateItemStat(def.id, e.target.value)} />
                            ) : (
                                <input type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-white text-sm"
                                    value={editingItem.stats[def.id] || 0} onChange={e => updateItemStat(def.id, e.target.value)} />
                            )}
                        </div>
                    ))}
                </div>
             </div>
        </div>
      );
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Admin <span className="text-red-500">Portal</span></h2>
          <p className="text-slate-400 text-sm">Secure Database Management System</p>
        </div>
        
        {/* Actions Area */}
        <div className="flex gap-4">
            <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase px-3 py-2 rounded flex items-center gap-2"
            >
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            <button onClick={onExit} className="text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded hover:bg-slate-800 text-xs font-bold uppercase">
                Exit
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
           {/* Context Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700 w-fit">
                <button 
                    onClick={() => setDbContext('countries')}
                    className={`px-4 py-2 rounded text-sm font-bold uppercase ${dbContext === 'countries' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                    Nation DB
                </button>
                <button 
                    onClick={() => setDbContext('aircraft')}
                    className={`px-4 py-2 rounded text-sm font-bold uppercase ${dbContext === 'aircraft' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Aircraft DB
                </button>
            </div>

            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg inline-flex w-fit">
                <button onClick={() => setActiveTab('items')} className={`px-6 py-2 rounded text-sm font-bold uppercase ${activeTab === 'items' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                    Records
                </button>
                <button onClick={() => setActiveTab('stats')} className={`px-6 py-2 rounded text-sm font-bold uppercase ${activeTab === 'stats' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                    Stats
                </button>
                <button onClick={() => setActiveTab('categories')} className={`px-6 py-2 rounded text-sm font-bold uppercase ${activeTab === 'categories' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                    Categories
                </button>
            </div>
      </div>

      <div className={`border-l-4 p-4 mb-6 bg-slate-800/50 rounded ${dbContext === 'countries' ? 'border-amber-500' : 'border-sky-500'}`}>
         <h4 className="font-bold text-white uppercase text-sm">Active Context: {dbContext === 'countries' ? 'Global Nations' : 'Military Aircraft'}</h4>
      </div>

      {activeTab === 'items' && (
          <div className="bg-slate-800 rounded border border-slate-700 overflow-hidden">
             <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="font-bold text-white uppercase">Records ({currentList.length})</h3>
                 <button onClick={handleAddNewItem} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase px-3 py-2 rounded">
                    + Add New
                 </button>
             </div>
             <table className="w-full text-left text-sm text-slate-400">
                 <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
                     <tr>
                         <th className="px-4 py-3">Rank</th>
                         <th className="px-4 py-3">Name</th>
                         <th className="px-4 py-3 text-right">Score</th>
                         <th className="px-4 py-3 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700">
                     {currentList.map((item: any) => (
                         <tr key={item.id} className="hover:bg-slate-700/30">
                             <td className="px-4 py-3 font-mono text-slate-500">#{item.rank}</td>
                             <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                {dbContext === 'countries' && <img src={`https://flagcdn.com/w40/${item.flagCode}.png`} className="h-4 w-6 rounded" />}
                                {item.name}
                             </td>
                             <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{item.score}</td>
                             <td className="px-4 py-3 text-right space-x-2">
                                 <button onClick={() => handleEditItem(item)} className="text-indigo-400 hover:text-white">Edit</button>
                                 <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-white">Delete</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      )}

      {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Stat Form */}
              <div className="bg-slate-800 p-6 rounded border border-slate-700 h-fit">
                 <h3 className="font-bold text-white uppercase mb-4">New Statistic</h3>
                 <div className="space-y-3">
                     <input type="text" placeholder="Label" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                        value={newStat.label || ''} onChange={e => setNewStat({...newStat, label: e.target.value})} />
                     <input type="text" placeholder="ID (auto)" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs font-mono"
                        value={newStat.id || ''} onChange={e => setNewStat({...newStat, id: e.target.value})} />
                     <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs"
                        value={newStat.category} onChange={e => setNewStat({...newStat, category: e.target.value})}>
                        {currentCats.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs"
                        value={newStat.format} onChange={e => setNewStat({...newStat, format: e.target.value as any})}>
                        <option value="number">Number</option>
                        <option value="currency">Currency</option>
                        <option value="slider">Index (1-10)</option>
                     </select>
                     <button onClick={() => addStat(false)} className="w-full bg-indigo-600 text-white font-bold py-2 rounded mt-2">Add Statistic</button>
                 </div>
              </div>
              {/* List Stats */}
              <div className="lg:col-span-2 bg-slate-800 rounded border border-slate-700">
                  <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
                          <tr>
                              <th className="px-4 py-2">Label</th>
                              <th className="px-4 py-2">Cat</th>
                              <th className="px-4 py-2 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {currentStats.map(s => (
                              <tr key={s.id}>
                                  <td className="px-4 py-3 text-white font-bold">{s.label}</td>
                                  <td className="px-4 py-3"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{s.category}</span></td>
                                  <td className="px-4 py-3 text-right"><button onClick={() => removeStat(s.id)} className="text-red-500">X</button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'categories' && (
          <div className="max-w-2xl mx-auto bg-slate-800 rounded border border-slate-700 p-6">
              <h3 className="font-bold text-white uppercase mb-4">Manage Categories</h3>
              <div className="flex gap-2 mb-6">
                  <input type="text" placeholder="New Category" className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white"
                     value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                  <button onClick={addCategory} className="bg-emerald-600 text-white px-4 rounded font-bold">Add</button>
              </div>
              <ul className="divide-y divide-slate-700">
                  {currentCats.map(cat => (
                      <li key={cat} className="py-3 flex justify-between items-center text-slate-300">
                          <span className="font-bold">{cat}</span>
                          {deleteConfirmationCat === cat ? (
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-red-400 font-bold uppercase">Are you sure?</span>
                                <button 
                                  onClick={() => confirmDeleteCategory(cat)} 
                                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase px-3 py-1 rounded shadow"
                                >
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmationCat(null)} 
                                  className="text-slate-400 hover:text-white text-xs uppercase border border-slate-600 px-3 py-1 rounded hover:bg-slate-700"
                                >
                                  Cancel
                                </button>
                             </div>
                          ) : (
                            <button 
                                type="button" 
                                onClick={() => initiateDeleteCategory(cat)} 
                                className="text-red-400 hover:text-white text-xs uppercase border border-slate-600 px-2 py-1 rounded hover:bg-slate-700"
                            >
                                Delete
                            </button>
                          )}
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};