const fs = require('fs');
const path = 'frontend/src/pages/admin/Overview.jsx';
let content = fs.readFileSync(path, 'utf8');

const beforeReturn = `  const clicksPhone = getStat('click_phone');

  const pieData = [
    { name: 'Recherches', value: searches },
    { name: 'Rech. Vides', value: emptySearches },
    { name: 'WhatsApp', value: clicksWhatsapp },
    { name: 'Téléphone', value: clicksPhone }
  ].filter(d => d.value > 0);

  return (`;

content = content.replace("  const clicksPhone = getStat('click_phone');\r\n\r\n  return (", beforeReturn);
content = content.replace("  const clicksPhone = getStat('click_phone');\n\n  return (", beforeReturn);

content = content.replace(
  '<h4 className="font-black text-gray-900 mb-6 text-lg">Recherches & Tendances</h4>',
  '<h4 className="font-black text-gray-900 mb-6 text-lg">Analytiques & Tendances</h4>'
);

const newPie = `{/* PieChart */}
                <div className="h-[300px] flex flex-col justify-center items-center relative">
                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={\`pie-cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value) => [\`\${value} évènements\`, 'Volume']}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-gray-700 font-medium text-sm ml-1">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-36px' }}>
                         <div className="text-center">
                           <span className="block text-3xl font-black text-gray-900">{pieData.reduce((a,b) => a + b.value, 0)}</span>
                           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Interactions</span>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Aucune donnée</p>
                    </div>
                  )}
                </div>`;

const pieRegex = /\{\/\* PieChart \*\/\}\s*<div className="h-\[300px\] flex flex-col justify-center items-center relative">[\s\S]*?<p className="text-gray-500 font-medium">Aucune donn(?:é|)e<\/p>\s*<\/div>\s*\)\}\s*<\/div>/;

if (pieRegex.test(content)) {
  content = content.replace(pieRegex, newPie);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Success!");
} else {
  console.log("Regex did not match pie section!");
}
