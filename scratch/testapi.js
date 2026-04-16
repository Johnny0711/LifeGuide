const https = require('https');

async function endToEndTest() {
  console.log("1. Logging in...");
  const loginData = JSON.stringify({ email: "st198739@stud.uni-stuttgart.de", password: "admin" });

  const token = await new Promise((resolve, reject) => {
    const req = https.request('https://lg.johnnyco.tech/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject("Login failed: " + res.statusCode + " " + data);
        }
        const json = JSON.parse(data);
        resolve(json.token);
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  }).catch(e => {
    console.log(e);
    return null;
  });

  if (!token) return;

  console.log("Got token!", token.substring(0, 20) + "...");

  console.log("2. Fetching /users/me");
  await new Promise(r => {
    https.get('https://lg.johnnyco.tech/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      console.log('/users/me STATUS:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('/users/me BODY:', data);
        r();
      });
    });
  });

  console.log("3. Fetching /workouts");
  await new Promise(r => {
    https.get('https://lg.johnnyco.tech/api/workouts', { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      console.log('/workouts STATUS:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('/workouts BODY (first 100 chars):', data.substring(0, 100));
        r();
      });
    });
  });
}
endToEndTest();
