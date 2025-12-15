import React, { useState } from 'react';
import { Country, StatDefinition } from '../types';
import { analyzeComparison } from '../services/geminiService';

interface ComparisonToolProps {
  countries: Country[];
  statDefinitions: StatDefinition[];
}

interface StatRowProps {
  def: StatDefinition;
  leftVal?: number;
  rightVal?: number;
}

const StatRow: React.FC<StatRowProps> = ({ def, leftVal, rightVal }) => {
  const l = leftVal || 0;
  const r = rightVal || 0;
  const leftWin = l > r;
  const rightWin = r > l;
  
  const format = (n: number) => {
      const str = n.toLocaleString();
      return def.format === 'currency' ? `$${str}` : str;
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 hover:bg-slate-800 transition-colors px-2">
      <div className={`w-1/3 text-right font-mono text-sm sm:text-base ${leftWin ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
        {def.format === 'slider' ? (
            <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-slate-500">/10</span>
                <span>{l.toFixed(2)}</span>
            </div>
        ) : format(l)}
      </div>
      <div className="w-1/3 text-center text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-semibold px-2 truncate">
        {def.label}
      </div>
      <div className={`w-1/3 text-left font-mono text-sm sm:text-base ${rightWin ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
        {def.format === 'slider' ? (
            <div className="flex items-center justify-start gap-2">
                <span>{r.toFixed(2)}</span>
                <span className="text-xs text-slate-500">/10</span>
            </div>
        ) : format(r)}
      </div>
    </div>
  );
};

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ countries, statDefinitions }) => {
  const [leftId, setLeftId] = useState<string>(countries[0]?.id || '');
  const [rightId, setRightId] = useState<string>(countries[1]?.id || '');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ analysis: string, winner: string, factors: string[] } | null>(null);

  const leftCountry = countries.find(c => c.id === leftId);
  const rightCountry = countries.find(c => c.id === rightId);

  const handleAnalyze = async () => {
    if (!leftCountry || !rightCountry) return;
    setLoading(true);
    const result = await analyzeComparison(leftCountry, rightCountry);
    setAiResult(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        
        {/* Left Selector */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Primary Nation</label>
          <select 
            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
          >
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {leftCountry && (
             <div className="mt-4 text-center">
                 <img 
                  src={`https://flagcdn.com/w160/${leftCountry.flagCode}.png`} 
                  alt={leftCountry.name} 
                  className="mx-auto h-20 w-auto shadow-md rounded my-2 opacity-90"
                />
                <h2 className="text-2xl font-black text-white">{leftCountry.name}</h2>
                <div className="text-amber-500 font-mono text-xl">Score: {leftCountry.score}</div>
             </div>
          )}
        </div>

        {/* VS Badge */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-black text-white shadow-lg border-4 border-slate-800 z-10">
            VS
          </div>
        </div>

        {/* Right Selector */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Secondary Nation</label>
          <select 
            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
          >
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {rightCountry && (
             <div className="mt-4 text-center">
                 <img 
                  src={`https://flagcdn.com/w160/${rightCountry.flagCode}.png`} 
                  alt={rightCountry.name} 
                  className="mx-auto h-20 w-auto shadow-md rounded my-2 opacity-90"
                />
                <h2 className="text-2xl font-black text-white">{rightCountry.name}</h2>
                <div className="text-amber-500 font-mono text-xl">Score: {rightCountry.score}</div>
             </div>
          )}
        </div>
      </div>

      {leftCountry && rightCountry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stats Table */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700">
            <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-600 pb-2">Direct Comparison</h3>
            {statDefinitions.map(def => (
               <StatRow 
                 key={def.id} 
                 def={def} 
                 leftVal={leftCountry.stats[def.id]} 
                 rightVal={rightCountry.stats[def.id]} 
                />
            ))}
          </div>

          {/* AI Analysis Section */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
              <h3 className="text-lg font-bold text-slate-100">
                <i className="fas fa-robot text-indigo-400 mr-2"></i>Strategic AI Analysis
              </h3>
              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className={`px-4 py-1 rounded text-sm font-bold uppercase tracking-wide transition-all ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/30'}`}
              >
                {loading ? 'Analyzing...' : 'Run Simulation'}
              </button>
            </div>
            
            <div className="flex-1 bg-slate-900 rounded p-4 text-slate-300 font-light leading-relaxed min-h-[300px]">
              {aiResult ? (
                <div className="space-y-4 animate-pulse-short">
                  <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded">
                    <span className="text-indigo-400 font-bold block mb-1 uppercase text-xs">Projected Outcome</span>
                    <span className="text-white font-medium">{aiResult.winner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1 uppercase text-xs">Tactical Assessment</span>
                    <p className="text-sm">{aiResult.analysis}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1 uppercase text-xs">Key Factors</span>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {aiResult.factors.map((f, i) => <li key={i} className="text-slate-400">{f}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 flex-col gap-2">
                  <i className="fas fa-chess-knight text-4xl mb-2"></i>
                  <p>Initiate simulation to view strategic breakdown.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};