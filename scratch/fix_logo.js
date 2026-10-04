const fs = require('fs');
const path = 'frontend/src/pages/admin/OperatorDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const logoRegex = /<div className="p-6 shrink-0">\s*<div className="flex items-center justify-center h-12 overflow-hidden">\s*<img src="\/logo-square\.png" alt="Logo LekkRek" className=\{`object-contain transition-all duration-300 cursor-default \$\{isSidebarOpen \? "h-12 w-auto" : "h-10 w-10"\}`\} \/>\s*<\/div>\s*<\/div>/;

const newLogo = `<div className="px-5 pt-8 pb-4 shrink-0">
            <div className={\`flex items-center h-16 overflow-hidden transition-all duration-300 \${isSidebarOpen ? "justify-start" : "justify-center"}\`}>
              <img src="/logo-square.png" alt="Logo LekkRek" className={\`object-contain transition-all duration-300 cursor-default \${isSidebarOpen ? "h-16 w-auto" : "h-10 w-10"}\`} />
            </div>
          </div>`;

content = content.replace(logoRegex, newLogo);
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed!");
