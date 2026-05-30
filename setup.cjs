const fs = require('fs');
const path = 'services/geminiService.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/model: 'gemini-2.5-flash',/g, "model: 'gemini-3.5-flash',");
fs.writeFileSync(path, content);
console.log('done');
