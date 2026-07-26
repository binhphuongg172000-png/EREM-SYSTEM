const net = require('net');

const socket = net.createConnection({ host: 'aws-0-ap-southeast-2.pooler.supabase.com', port: 5432 }, () => {
  console.log('PORT 5432 CONNECTED!');
  socket.end();
});

socket.on('error', (err) => {
  console.error('PORT 5432 ERROR:', err.message);
});
