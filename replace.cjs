const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf-8');
code = code.replace(/process\.env\.API_KEY/g, 'getApiKey()');
fs.writeFileSync('services/geminiService.ts', code);
console.log('done');
