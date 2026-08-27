const https = require('https');

https.get('https://github.com/infogalletrix/mona-interior-studio/releases/download/v1.2.0/latest.yml', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
