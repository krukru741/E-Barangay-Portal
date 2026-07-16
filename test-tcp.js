const net = require('net');
const dns = require('dns');

const host = 'db.urhzfsulwkxvspuivqfn.supabase.co';
const port = 5432;

console.log(`Resolving DNS for ${host}...`);
dns.lookup(host, { all: true }, (err, addresses) => {
  if (err) console.error('DNS Error:', err);
  else console.log('Resolved Addresses:', addresses);
});

console.log(`Attempting TCP connection to ${host}:${port}...`);
const socket = net.createConnection(port, host, () => {
  console.log('TCP Connection SUCCESSFUL!');
  socket.end();
});

socket.setTimeout(3000);
socket.on('timeout', () => {
  console.log('TCP Connection TIMEOUT');
  socket.destroy();
});
socket.on('error', (err) => {
  console.error('TCP Connection ERROR:', err.message);
});
