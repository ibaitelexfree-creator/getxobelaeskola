const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec(`mkdir -p /root/evolution-api && cd /root/evolution-api

echo "services:
  evolution-api:
    image: atendai/evolution-api:v2.2.3
    container_name: evolution_api
    restart: always
    ports:
      - \\"8080:8080\\"
    environment:
      - SERVER_TYPE=http
      - SERVER_PORT=8080
      - AUTH_TYPE=apikey
      - API_KEY=N8N_MISSIONCONTROL_2026_SECRET
      - REDIS_ENABLED=true
      - REDIS_URI=redis://redis-evolution:6379/1
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://user:pass@postgres-evolution:5432/evolution?schema=public

  redis-evolution:
    image: redis:alpine
    container_name: redis_evolution
    restart: always

  postgres-evolution:
    image: postgres:15-alpine
    container_name: postgres_evolution
    restart: always
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=evolution
" > docker-compose.yml

docker compose up -d || docker-compose up -d`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: '76.13.52.6',
    port: 22,
    username: 'root',
    password: 'Ab794146352303-'
});
