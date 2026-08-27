const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const localFile = './old_data.sql';
const remoteFile = '/opt/mona-interior-studio/old_data.sql';

conn.on('ready', () => {
  console.log('SSH connected, uploading old_data.sql...');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Upload complete, restoring database...');
      
      const cmds = `docker exec -i mona_interior_db mysql -u mona_user -pStrongPassword123! mona_interior < ${remoteFile} && docker restart mona_interior_backend`;
      
      conn.exec(cmds, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Database restore complete. Code:', code);
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
