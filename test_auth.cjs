const axios = require('axios');
const http = require('http');

async function testAuth() {
  try {
    // 1. Login to get access token and refresh cookie
    const loginRes = await axios.post('http://localhost:3000/api/auth/asisten/login', {
      identifier: 'atminLempkom@gmail.com',
      password: 'anggadictator123.'
    });
    
    console.log('Login success');
    const accessToken = loginRes.data.data.accessToken;
    const cookies = loginRes.headers['set-cookie'];
    console.log('Cookies received:', cookies);

    if (!cookies) throw new Error("No cookies returned from login");

    // Extract just the cookie value for sending
    const refreshCookie = cookies[0].split(';')[0];
    
    // 2. Wait 6 seconds for token to expire
    console.log('Waiting 6 seconds for token to expire...');
    await new Promise(r => setTimeout(r, 6000));
    
    // 3. Try calling refresh
    console.log('Calling refresh...');
    const refreshRes = await axios.post('http://localhost:3000/api/auth/asisten/refresh', {}, {
      headers: {
        Cookie: refreshCookie
      }
    });
    
    console.log('Refresh success!', refreshRes.data);
    
    // 4. Try calling refresh AGAIN using the same cookie (to test the non-rotation)
    console.log('Calling refresh AGAIN...');
    const refreshRes2 = await axios.post('http://localhost:3000/api/auth/asisten/refresh', {}, {
      headers: {
        Cookie: refreshCookie
      }
    });
    console.log('Refresh 2 success!', refreshRes2.data);
    
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

testAuth();
