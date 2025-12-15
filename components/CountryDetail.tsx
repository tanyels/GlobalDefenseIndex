import React from 'react';
import { Country, StatDefinition } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CountryDetailProps {
  country: Country;
  statDefinitions: StatDefinition[];
  onBack: () => void;
}

export const CountryDetail: React.FC<CountryDetailProps> = ({ country, statDefinitions, onBack }) => {
  
  // Categorize stats for display
  const categories = Array.from(new Set(statDefinitions.map(s => s.category || 'Other')));

  // Normalize data for Radar Chart
  // Prefer slider stats for radar if available, else standard logic
  const sliderStats = statDefinitions.filter(s => s.format === 'slider');
  const otherStats = statDefinitions.filter(s => s.format !== 'slider').slice(0, 6);
  
  // Mix slider and top normal stats for the chart (max 6-8 vars)
  const chartDefs = [...sliderStats, ...otherStats].slice(0, 8);

  const radarData = chartDefs.map(def => {
    const val = country.stats[def.id] || 0;
    let normalized = 0;
    
    if (def.format === 'slider') {
        normalized = val * 10; // 1-10 -> 10-100
    } else {
        // Logarithmic scale normalization for large numbers
        normalized = val > 0 ? (Math.log10(val) / 10) * 100 : 0; 
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
        className="mb-6 flex items-center text-amber-500 hover:text-amber-400 transition-colors font-bold uppercase text-sm tracking-widest"
      >
        <i className="fas fa-chevron-left mr-2"></i> Back to Global Ranking
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Header Card */}
        <div className="lg:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-8 border-l-4 border-amber-500 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="fas fa-crosshairs text-9xl"></i>
          </div>
          <img 
            src={`https://flagcdn.com/w320/${country.flagCode}.png`} 
            alt={country.name}
            className="w-48 h-auto shadow-2xl rounded"
          />
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase">{country.name}</h1>
              <span className="bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded text-lg">Rank #{country.rank}</span>
            </div>
            <p className="text-slate-400 text-lg mb-4 max-w-2xl">{country.description}</p>
            <div className="inline-block bg-slate-900/50 backdrop-blur px-6 py-2 rounded border border-slate-700">
              <span className="text-slate-500 uppercase text-xs font-bold block">Combat Score</span>
              <span className="text-3xl font-mono text-emerald-400 font-bold">{country.score}</span>
              <span className="text-slate-600 text-xs ml-2">/ 100</span>
            </div>
            {country.isGenerated && (
               <span className="ml-4 inline-block bg-indigo-900/50 px-3 py-1 rounded text-xs text-indigo-300 border border-indigo-500/30">
                 <i className="fas fa-bolt mr-1"></i> AI Generated
               </span>
            )}
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const catStats = statDefinitions.filter(s => s.category === cat);
            if (catStats.length === 0) return null;
            return (
              <div key={cat} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="bg-slate-900/50 p-3 border-b border-slate-700">
                  <h4 className="text-amber-500 font-bold uppercase text-sm tracking-wider"><i className="fas fa-caret-right mr-2"></i>{cat} Capabilities</h4>
                </div>
                <div className="p-4 space-y-4">
                  {catStats.map(stat => (
                    <div key={stat.id} className="flex justify-between items-end border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-400 text-xs font-bold uppercase">{stat.label}</span>
                      
                      {stat.format === 'slider' ? (
                        <div className="flex flex-col items-end w-1/2">
                             <div className="flex items-baseline gap-1">
                                <span className="text-white font-mono font-bold text-lg">{(country.stats[stat.id] || 0).toFixed(2)}</span>
                                <span className="text-slate-500 text-xs">/ 10</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${((country.stats[stat.id] || 0) / 10) * 100}%` }}
                                ></div>
                             </div>
                        </div>
                      ) : (
                        <span className="text-white font-mono font-bold text-lg">
                            {stat.format === 'currency' ? '$' : ''}
                            {(country.stats[stat.id] || 0).toLocaleString()}
                            {stat.format === 'currency' && (country.stats[stat.id] || 0) > 1000000000 ? ' ' : ''}
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
            <h3 className="text-slate-400 font-bold uppercase text-sm mb-4">Power Distribution</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={country.name}
                    dataKey="A"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="#f59e0b"
                    fillOpacity={0.4}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">Relative capability comparison based on metrics.</p>
        </div>
      </div>
    </div>
  );
};