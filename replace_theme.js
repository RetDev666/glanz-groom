const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        replaceInDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Replace hardcoded reds with emerald
      content = content.replace(/bg-red-/g, 'bg-emerald-');
      content = content.replace(/text-red-/g, 'text-emerald-');
      content = content.replace(/border-red-/g, 'border-emerald-');
      content = content.replace(/ring-red-/g, 'ring-emerald-');
      content = content.replace(/shadow-red-/g, 'shadow-emerald-');
      content = content.replace(/from-red-/g, 'from-emerald-');
      content = content.replace(/via-red-/g, 'via-emerald-');
      content = content.replace(/to-red-/g, 'to-emerald-');
      
      // Replace dark card backgrounds in services.tsx (and elsewhere if present)
      content = content.replace(/bg-gray-900/g, 'bg-[#0f1d18]');
      content = content.replace(/from-gray-900/g, 'from-[#0f1d18]');
      content = content.replace(/via-gray-800/g, 'via-[#163028]');
      content = content.replace(/to-gray-900/g, 'to-[#0f1d18]');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'frontend/pages'));
replaceInDir(path.join(__dirname, 'frontend/components'));
