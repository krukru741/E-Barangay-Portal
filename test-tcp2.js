const net = require('net');
const dns = require('dns');

const host = 'aws-0-ap-southeast-2.pooler.supabase.com';

console.log(`Resolving DNS for ${host}...`);
dns.lookup(host, { all: true }, (err, addresses) => {
  if (err) console.error('DNS Error:', err);
  else console.log('Resolved Addresses:', addresses);
});

[5432, 6543].forEach(port => {
  console.log(`Attempting TCP connection to ${host}:${port}...`);
  const socket = net.createConnection(port, host, () => {
    console.log(`TCP Connection to ${port} SUCCESSFUL!`);
    socket.end();
  });

  socket.setTimeout(3000);
  socket.on('timeout', () => {
    console.log(`TCP Connection to ${port} TIMEOUT`);
    socket.destroy();
  });
  socket.on('error', (err) => {
    console.error(`TCP Connection to ${port} ERROR:`, err.message);
  });
})
