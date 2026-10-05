const fs = require('fs');
const path = 'frontend/src/pages/admin/Overview.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
  "import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';",
  "import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';"
);

// Update colors
content = content.replace(
  "const COLORS = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];",
  "const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];"
);

// We need to replace the charts grid
const newGrid = `<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* BarChart */}
                <div className="h-[300px]">
                  {analytics && analytics.topSearches && analytics.topSearches.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topSearches} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} width={120} />
                        <RechartsTooltip 
                          cursor={{fill: '#f3f4f6'}} 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                          formatter={(value) => [\`\${value} requêtes\`, 'Volume']}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                          {analytics.topSearches.map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Aucune donnée de recherche.</p>
                    </div>
                  )}
                </div>

                {/* PieChart */}
                <div className="h-[300px] flex flex-col justify-center items-center relative">
                  {analytics && analytics.topSearches && analytics.topSearches.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.topSearches}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="query"
                            stroke="none"
                          >
                            {analytics.topSearches.map((entry, index) => (
                              <Cell key={\`pie-cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value) => [\`\${value} fois\`, 'Recherché']}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-gray-700 font-medium text-sm ml-1">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-36px' }}>
                        <span className="text-3xl font-black text-gray-900">
                          {analytics.topSearches.reduce((acc, curr) => acc + curr.count, 0)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recherches</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Aucune donnée</p>
                    </div>
                  )}
                </div>
              </div>`;

const gridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-8">[\s\S]*?\{analytics\.topSearches\.reduce\(\(acc, curr\) => acc \+ curr\.count, 0\)\}\s*<\/span>\s*<span className="text-\[10px\] font-bold text-gray-400 uppercase tracking-widest">Recherches<\/span>\s*<\/div>\s*<\/>\s*\) : \(\s*<div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">\s*<p className="text-gray-500 font-medium">Aucune donn(?:é|)e<\/p>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>/;

if (gridRegex.test(content)) {
  content = content.replace(gridRegex, newGrid);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Success!");
} else {
  console.log("Could not find grid regex!");
}
