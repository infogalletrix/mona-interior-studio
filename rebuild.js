const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Rebuilding container...');
  
  const cmd = `cd /opt/mona-interior-studio && docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD:$PWD" -w="$PWD" docker/compose:1.29.2 up -d --build backend`;
  
  // Wait, or just do docker build and docker run. Let's just try `docker compose` or install it
  const cmd2 = `cd /opt/mona-interior-studio && docker-compose up -d --force-recreate backend`;
  
  conn.exec(cmd2, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Rebuild complete. Code:', code);
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
