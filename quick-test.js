// Quick test
const http = require('http');

console.log('Testing servers...\n');

// Test backend
http.get('http://localhost:5000/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Backend (5000):', res.statusCode === 200 ? 'OK' : 'ERROR');
    try {
      const json = JSON.parse(data);
      console.log('   Stats:', json.stats);
    } catch(e) {}
  });
}).on('error', () => console.log('❌ Backend (5000): DOWN'));

// Test frontend
setTimeout(() => {
  http.get('http://localhost:3000', (res) => {
    console.log('✅ Frontend (3000):', res.statusCode === 200 ? 'OK' : 'ERROR');
  }).on('error', () => console.log('❌ Frontend (3000): DOWN'));
}, 1000);
