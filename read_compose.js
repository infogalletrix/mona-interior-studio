const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /opt/mona-interior-studio/docker-compose.yml', (err, stream) => {
    if (err) throw err;
    let dataOut = '';
    stream.on('close', (code) => {
      console.log(dataOut);
      conn.end();
    }).on('data', data => dataOut += data.toString());
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
