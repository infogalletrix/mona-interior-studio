const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected, finding latest backup...');
  
  const findCmd = `ls -t /opt/mona_backups/*.sql | head -n 1`;
  
  conn.exec(findCmd, (err, stream) => {
    if (err) throw err;
    let latestBackup = '';
    stream.on('data', (data) => {
      latestBackup += data.toString();
    }).on('close', () => {
      latestBackup = latestBackup.trim();
      console.log('Latest backup found:', latestBackup);
      
      if (!latestBackup) {
          console.log("No backup found!");
          conn.end();
          return;
      }

      const restoreCmd = `docker exec -i mona_interior_db mysql -u mona_user -pStrongPassword123! mona_interior < ${latestBackup} && docker restart mona_interior_backend`;
      console.log('Executing restore...');
      
      conn.exec(restoreCmd, (err, rStream) => {
        if (err) throw err;
        rStream.on('close', (code) => {
          console.log('Restore complete! Code:', code);
          conn.end();
        }).on('data', data => console.log(data.toString()))
          .stderr.on('data', data => console.error(data.toString()));
      });
    });
  });
}).connect({
  host: '72.61.241.138',
  port: 22,
  username: 'root',
  password: 'Suppu123456#'
});
