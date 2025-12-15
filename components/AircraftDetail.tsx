import React from 'react';
import { Aircraft, StatDefinition } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AircraftDetailProps {
  aircraft: Aircraft;
  statDefinitions: StatDefinition[];
  onBack: () => void;
}

export const AircraftDetail: React.FC<AircraftDetailProps> = ({ aircraft, statDefinitions, onBack }) => {
  
  const categories = Array.from(new Set(statDefinitions.map(s => s.category || 'Other')));

  const sliderStats = statDefinitions.filter(s => s.format === 'slider');
  const otherStats = statDefinitions.filter(s => s.format !== 'slider').slice(0, 6);
  const chartDefs = [...sliderStats, ...otherStats].slice(0, 8);

  const radarData = chartDefs.map(def => {
    const val = aircraft.stats[def.id] || 0;
    let normalized = 0;
    if (def.format === 'slider') {
        normalized = val * 10; 
    } else {
        // Simple linear normalization for display purposes on chart or log
        normalized = val > 0 ? (Math.log10(val) / 8) * 100 : 0; 
    }
    return {
      subject: def.label,
      A: Math.min(normalized, 100),
      fullMark: 100
    };
  });

  return (
    <div className="animate-slide-up">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sky-500 hover:text-sky-400 transition-colors font-bold uppercase text-sm tracking-widest"
      >
        <i className="fas fa-chevron-left mr-2"></i> Back to Aircraft Database
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Header */}
        <div className="lg:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-8 border-l-4 border-sky-500 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="fas fa-fighter-jet text-9xl"></i>
          </div>
          
          {/* Placeholder for Aircraft Image if we had one, or a generic icon */}
          <div className="w-48 h-32 bg-slate-900 rounded flex items-center justify-center border border-slate-700 shadow-2xl">
              <i className="fas fa-plane-up text-6xl text-slate-600"></i>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase">{aircraft.name}</h1>
              <span className="bg-sky-600 text-white font-bold px-3 py-1 rounded text-lg">Rank #{aircraft.rank}</span>
            </div>
            <p className="text-slate-400 text-lg mb-4 max-w-2xl">{aircraft.description}</p>
            
            <div className="flex gap-4 justify-center md:justify-start">
                <div className="inline-block bg-slate-900/50 backdrop-blur px-4 py-2 rounded border border-slate-700">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">Rating</span>
                <span className="text-2xl font-mono text-emerald-400 font-bold">{aircraft.score}</span>
                </div>
                <div className="inline-block bg-slate-900/50 backdrop-blur px-4 py-2 rounded border border-slate-700">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">Origin</span>
                <span className="text-xl font-bold text-white">{aircraft.origin}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const catStats = statDefinitions.filter(s => s.category === cat);
            if (catStats.length === 0) return null;
            return (
              <div key={cat} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="bg-slate-900/50 p-3 border-b border-slate-700">
                  <h4 className="text-sky-500 font-bold uppercase text-sm tracking-wider"><i className="fas fa-caret-right mr-2"></i>{cat} Specs</h4>
                </div>
                <div className="p-4 space-y-4">
                  {catStats.map(stat => (
                    <div key={stat.id} className="flex justify-between items-end border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-400 text-xs font-bold uppercase">{stat.label}</span>
                      
                      {stat.format === 'slider' ? (
                        <div className="flex flex-col items-end w-1/2">
                             <div className="flex items-baseline gap-1">
                                <span className="text-white font-mono font-bold text-lg">{(aircraft.stats[stat.id] || 0).toFixed(1)}</span>
                                <span className="text-slate-500 text-xs">/ 10</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div 
                                    className="h-full bg-sky-500" 
                                    style={{ width: `${((aircraft.stats[stat.id] || 0) / 10) * 100}%` }}
                                ></div>
                             </div>
                        </div>
                      ) : (
                        <span className="text-white font-mono font-bold text-lg">
                            {stat.format === 'currency' ? '$' : ''}
                            {(aircraft.stats[stat.id] || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-slate-400 font-bold uppercase text-sm mb-4">Capabilities Profile</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={aircraft.name}
                    dataKey="A"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};