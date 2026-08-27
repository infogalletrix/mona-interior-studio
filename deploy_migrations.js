const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const localMigrationsDir = './server/Mona_Interior/Migrations';
const remoteMigrationsDir = '/opt/mona-interior-studio/server/Mona_Interior/Migrations';

conn.on('ready', () => {
  console.log('SSH connected. Uploading migrations...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    // Create Migrations dir (might fail if it exists, so ignore error)
    sftp.mkdir(remoteMigrationsDir, (err) => {
      const files = fs.readdirSync(localMigrationsDir);
      let uploaded = 0;
      
      files.forEach(file => {
        sftp.fastPut(path.join(localMigrationsDir, file), `${remoteMigrationsDir}/${file}`, (err) => {
          if (err) throw err;
          uploaded++;
          if (uploaded === files.length) {
            console.log('All migrations uploaded. Rebuilding backend...');
            // Also delete the old migrations to be safe
            conn.exec(`cd /opt/mona-interior-studio/server/Mona_Interior/Migrations && rm -f 20260808* && cd /opt/mona-interior-studio && docker-compose up -d --build backend`, (err, stream) => {
              if (err) throw err;
              stream.on('close', (code, signal) => {
                console.log('Rebuild complete. Code:', code);
                conn.end();
              }).on('data', (data) => {
                console.log(data.toString());
              }).stderr.on('data', (data) => {
                console.error(data.toString());
              });
            });
          }
        });
      });
    });
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
