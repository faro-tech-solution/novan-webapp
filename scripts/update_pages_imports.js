const fs = require('fs');
const path = require('path');

// Find all page files in the app directory
function findPageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findPageFiles(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

const pageFiles = findPageFiles('app');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update imports from @/pages to @/components/pages
  if (content.includes('from "@/pages"')) {
    content = content.replace(/from "\.\.\/\.\.\/pages"/g, 'from "@/components/pages"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/pages"/g, 'from "@/components/pages"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/pages"/g, 'from "@/components/pages"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/pages"/g, 'from "@/components/pages"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/pages"/g, 'from "@/components/pages"');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

pageFiles.forEach(updateFile);
console.log('Pages imports updated successfully!'); 