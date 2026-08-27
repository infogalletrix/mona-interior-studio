const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Dropping and recreating database...');
  
  const cmd = `docker exec -i mona_interior_db mysql -u root -pStrongPassword123! -e "DROP DATABASE mona_interior; CREATE DATABASE mona_interior;" && docker restart mona_interior_backend`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Wipe complete. Code:', code);
      conn.end();
    }).on('data', data => console.log(data.toString()))
      .stderr.on('data', data => console.error(data.toString()));
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
