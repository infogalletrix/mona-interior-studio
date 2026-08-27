const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const localFile = './server/Mona_Interior/Program.cs';
const remoteFile = '/opt/mona-interior-studio/server/Mona_Interior/Program.cs';

conn.on('ready', () => {
  console.log('SSH connected, uploading Program.cs...');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Upload complete, rebuilding backend container...');
      
      const cmds = `cd /opt/mona-interior-studio && docker-compose build backend && docker rm -f $(docker ps -aq --filter "name=mona_interior_backend") && docker-compose up -d backend`;
      
      conn.exec(cmds, (err, stream) => {
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
    });
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
