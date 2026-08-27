const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker logs --tail 50 mona_interior_backend', (err, stream) => {
    if (err) throw err;
    let logData = '';
    stream.on('close', (code, signal) => {
      fs.writeFileSync('logs.txt', logData);
      conn.end();
    }).on('data', (data) => {
      logData += data.toString();
    }).stderr.on('data', (data) => {
      logData += data.toString();
    });
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
