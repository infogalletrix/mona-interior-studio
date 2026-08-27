const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker ps -a', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', data => console.log(data.toString()));
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
