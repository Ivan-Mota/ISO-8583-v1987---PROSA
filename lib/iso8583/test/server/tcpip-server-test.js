/**
 * Created by phoenix on 22/09/16.
 */
'use strict';
var net = require('net');

var initSocket = function (options, parent) {
    //dd(('Connecting to upstream server ' + options.upstreamHost + ':' + options.upstreamPort).green);

    var socket = net.createConnection({
            host: options.upstreamHost,
            port: options.upstreamPort
        },

        function () {
            //dd(('Connected to upstream ' + socket.remoteAddress + ':' + socket.remotePort + '!').green);
            socket.setNoDelay(true);

            if (socket.options.upstreamTimeout) socket.setTimeout(socket.options.upstreamTimeout * 1000);
        }
    );

    socket.options = options;

// 'Data' event is triggered when upstream sends us data
    socket.on('data', function (data) {
        //dd('Got data from ISO-host (' + data.length + 'b)');
    });

// 'End' event is triggered when the socket is about to close
    socket.on('end', function () {
        //dd('Upstream <end>'.red);
    });

// 'Close' event is triggered when the socket was closed
    socket.on('close', function () {
        //dd('Upstream <close>'.red);

        var recover = function() {
            socket = initSocket(options, parent);
        };

        // Refreshing socket object
        if (!socket.retryDelay) {
            recover();
        } else {
            setTimeout(recover, socket.retryDelay);
        }
    });

// 'Error' event is triggered on socket errors
    socket.on('error', function (err) {
        //dd(('Upstream socket error ' + err).red);
    });

// 'Timeout' event is triggered on connection timeout (no data sent or recieved for a given period of time)
    socket.on('timeout', function () {
        //dd('Upstream timeout!'.yellow);
    });

    return socket;
};

var initClientSocket = function (upstream, options) {

    var server = net.createServer(function (socket) {

        socket.name = socket.remoteAddress + ':' + socket.remotePort;
        if (options.clientTimeout) socket.setTimeout(options.clientTimeout * 1000);
        //dd(('Client ' + socket.name + ' connected').yellow);

        // 'Data' event is triggered when some client sends us data
        socket.on('data', function (data) {
            //dd(('Client ' + socket.name + ' sent data (' + data.length + 'b)').yellow);
        });

        // 'End' event is triggered when the socket is about to close
        socket.on('end', function () {
            //dd(('Client ' + socket.name + ' <end> event').yellow);
        });

        // 'Close' event is triggered when the socket was closed
        socket.on('close', function() {
            //dd(('Client ' + socket.name + ' <close> event').yellow);
        });

        // 'Error' event is triggered on socket errors
        socket.on('error', function(err) {
            //dd('Client <error> ' + err);
        });

        // 'Timeout' event is triggered on socket timeout
        socket.on('timeout', function(err) {
            //dd('Client ' + socket.name + ' <socket timeout>');
            this.end();
        });
    });

    server.on('error', function(err) {
        //dd('Socket server <error> ' + err);
    });

    return server;
};

var _options = {
    upstreamHost: '127.0.0.1',
    upstreamPort: 1337,
    upstreamTimeout: 5,
    clientTimeout: 5
};
var _socket = initSocket(_options);
var _clientSocket = initClientSocket(_socket, _options);