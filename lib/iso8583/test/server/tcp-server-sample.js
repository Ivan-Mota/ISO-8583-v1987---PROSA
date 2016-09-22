/**
 * Created by phoenix on 22/09/16.
 */
'use strict';

var net = require('net');

var server = net.createServer(function(socket) {
    //console.log('socket', socket);
    socket.write('Echo server\r\n');
    socket.pipe(socket);
});
server.on('error', function (err) {
    console.log('error', err)
});

server.listen(1337, '127.0.0.1');