const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const zipPath = './mona.zip';

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP connected, uploading zip...');
    sftp.fastPut(zipPath, '/opt/mona.zip', (err) => {
      if (err) throw err;
      console.log('Upload complete, extracting and deploying...');
      const deployCmds = [
        `if ! command -v docker &> /dev/null; then apt-get update && apt-get install -y docker.io docker-compose unzip; fi`,
        `rm -rf /opt/mona-interior-studio`,
        `mkdir -p /opt/mona-interior-studio`,
        `apt-get install -y unzip`,
        `unzip -o /opt/mona.zip -d /opt/mona-interior-studio`,
        `cd /opt/mona-interior-studio && docker-compose up -d --build`,
        `cat << 'EOF' > /opt/mona-interior-studio/backup.sh\n#!/bin/bash\nBACKUP_DIR="/opt/mona_backups"\nmkdir -p $BACKUP_DIR\nTIMESTAMP=\\$(date +"%Y%m%d_%H%M%S")\ndocker exec mona_interior_db mysqldump -u mona_user -pStrongPassword123! mona_interior > "\\$BACKUP_DIR/db_backup_\\$TIMESTAMP.sql"\nfind \\$BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete\nEOF`,
        `chmod +x /opt/mona-interior-studio/backup.sh`,
        `(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * /opt/mona-interior-studio/backup.sh") | crontab -`,
        `echo "Deployment and Backup Setup Completed!"`
      ].join(';\n');
      
      conn.exec(deployCmds, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
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
