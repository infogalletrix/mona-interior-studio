const https = require('https');

https.get('https://github.com/infogalletrix/mona-interior-studio/releases/latest/download/latest.yml', (res) => {
  console.log('Status Code:', res.statusCode);
  if (res.statusCode === 302) {
    console.log('Redirects to:', res.headers.location);
  }
}).on('error', (e) => {
  console.error(e);
});
