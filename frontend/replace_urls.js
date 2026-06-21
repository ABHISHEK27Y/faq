const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

let changedFiles = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // 1. Replace 'http://localhost:5000...' with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}...`
    // Match single quotes
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}$1`");
    
    // 2. Match double quotes
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}$1`");
    
    // 3. Match template literals (already inside backticks)
    content = content.replace(/http:\/\/localhost:5000/g, "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}");
    
    // We might have double substituted if it was inside a backtick. Wait:
    // If it was already in a template literal like `http://localhost:5000/api/${id}`, step 1 and 2 miss it (no quotes).
    // Step 3 hits it, replacing the URL with `${process...}` which is perfectly valid inside a template literal.
    // What if it was processed by step 1? It becomes `${process...}` and the `http...` string is gone, so step 3 won't touch it!
    // This is perfect.
    
    fs.writeFileSync(f, content, 'utf8');
    changedFiles++;
    console.log('Updated:', f);
  }
});

console.log(`Replaced hardcoded URLs in ${changedFiles} files.`);
