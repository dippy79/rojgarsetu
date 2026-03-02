const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.get('http://127.0.0.1:5000/api/jobs?limit=1');
        console.log('API Response:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
