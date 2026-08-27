const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected, fetching docker logs...');
  
  // Get the last 100 lines of logs from the backend container
  conn.exec('docker logs --tail 200 mona_interior_backend', (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
