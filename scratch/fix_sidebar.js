const fs = require('fs');
const path = 'frontend/src/pages/admin/OperatorDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the main container
content = content.replace(
  'className={`bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 transition-all duration-300 relative`} style={{ width: isSidebarOpen ? "256px" : "80px", minWidth: isSidebarOpen ? "256px" : "80px", maxWidth: isSidebarOpen ? "256px" : "80px" }}',
  'className={`bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 transition-all duration-300 relative overflow-x-hidden`} style={{ width: isSidebarOpen ? "256px" : "80px" }}'
);

// 2. Fix the Profile section
content = content.replace(
  /<div className=\{`mt-auto \$\{isSidebarOpen \? "p-6" : "p-4"\} border-t border-gray-100 shrink-0 bg-white z-10 overflow-hidden`\}>([\s\S]*?)<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/m,
  `<div className="mt-auto p-4 border-t border-gray-100 shrink-0 bg-white z-10 overflow-hidden transition-all duration-300">
          <div className="flex items-center w-full">
            <div className="w-10 h-10 shrink-0 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold" title={user.email}>
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={\`overflow-hidden transition-all duration-300 flex-1 flex items-center justify-between \${isSidebarOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"}\`}>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-gray-900 truncate" title={user.email}>{user.email || 'Utilisateur'}</h4>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors shrink-0 ml-2" title="Se déconnecter">
                🚪
              </button>
            </div>
          </div>
        </div>`
);

// 3. Fix the Administration title
content = content.replace(
  /\{isSidebarOpen && <div className="pt-6 pb-2"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administration<\/p><\/div>\}/g,
  `<div className={\`pt-6 pb-2 transition-all duration-300 \${isSidebarOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}\`}><p className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Administration</p></div>`
);

// 4. Fix ALL buttons
const buttonRegex = /className=\{`w-full flex items-center \$\{isSidebarOpen \? "gap-3 px-4" : "justify-center px-0"\} (py-3[^`]+)`\}>\s*<span className="text-xl flex-shrink-0">(.*?)<\/span>\s*\{isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">(.*?)<\/span>\}/g;

content = content.replace(buttonRegex, (match, classes, icon, text) => {
  return `className={\`w-full flex items-center px-4 ${classes}\`}>
                  <span className="text-xl flex-shrink-0">${icon}</span>
                  <span className={\`whitespace-nowrap overflow-hidden transition-all duration-300 \${isSidebarOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"}\`}>${text}</span>`;
});

// Also replace parametres button which has mt-8
const paramRegex = /className=\{`w-full flex items-center \$\{isSidebarOpen \? "gap-3 px-4" : "justify-center px-0"\} (py-3[^`]+ mt-8 [^`]+)`\}>\s*<span className="text-xl flex-shrink-0">(.*?)<\/span>\s*\{isSidebarOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">(.*?)<\/span>\}/g;
content = content.replace(paramRegex, (match, classes, icon, text) => {
  return `className={\`w-full flex items-center px-4 ${classes}\`}>
                  <span className="text-xl flex-shrink-0">${icon}</span>
                  <span className={\`whitespace-nowrap overflow-hidden transition-all duration-300 \${isSidebarOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"}\`}>${text}</span>`;
});


fs.writeFileSync(path, content, 'utf8');
console.log("Fixed!");
