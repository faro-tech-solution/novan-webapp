const fs = require('fs');
const path = require('path');

// Find all TypeScript/JavaScript files in the app directory
function findFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const appFiles = findFiles('app');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update imports from @/pages to @/components/pages
  if (content.includes('from "@/pages"')) {
    content = content.replace(/from "@\/pages"/g, 'from "@/components/pages"');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

appFiles.forEach(updateFile);
console.log('All pages imports updated successfully!'); 