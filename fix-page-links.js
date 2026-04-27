const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/href="\/"/g, 'href="../index.html"');
  content = content.replace(/href="\/pages\//g, 'href="');
  content = content.replace(/src="\/assets\//g, 'src="../assets/');
  content = content.replace(/src: "\/assets\//g, 'src: "../assets/');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
});
