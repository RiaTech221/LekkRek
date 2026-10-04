const fs = require('fs');
const path = 'frontend/src/pages/admin/Overview.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add title to BarChart
content = content.replace(
  '{/* BarChart */}\n                <div className="h-[300px]">',
  `{/* BarChart */}\n                <div className="flex flex-col">\n                  <h5 className="font-bold text-gray-700 mb-4 text-sm text-center">Plats les plus recherchés</h5>\n                  <div className="h-[300px]">`
);

// We need to close the added div for BarChart
content = content.replace(
  '                  )}\n                </div>\n\n                {/* PieChart */}',
  '                  )}\n                </div>\n                </div>\n\n                {/* PieChart */}'
);

// Add title to PieChart
content = content.replace(
  '{/* PieChart */}\n                <div className="h-[300px] flex flex-col justify-center items-center relative">',
  `{/* PieChart */}\n                <div className="flex flex-col">\n                  <h5 className="font-bold text-gray-700 mb-4 text-sm text-center">Répartition des intéractions</h5>\n                  <div className="h-[300px] flex flex-col justify-center items-center relative">`
);

// We need to close the added div for PieChart
content = content.replace(
  '                  )}\n                </div>\n              </div>\n            </>',
  '                  )}\n                </div>\n                </div>\n              </div>\n            </>'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed!");
