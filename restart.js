const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `docker rm -f $(docker ps -aq --filter "name=mona_interior_backend") && cd /opt/mona-interior-studio && docker-compose up -d backend`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Update & Up Code:', code);
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
