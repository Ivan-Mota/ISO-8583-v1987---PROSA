/**
 * Created by phoenix on 22/09/16.
 */
'use strict';

var net = require('net');
var http = require('http');
var colors = require('colors');
var winston = require('winston');

var c = {
    silent: null,
    debugLevel: 'verbose'
};
var logger = false;

if (c.debugLevel) {
    var transports = [];
    var dateFunc = function () {
        var d = new Date();
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2) + ' ' + ('0' + d.getHours()).substr(-2) + ':' + ('0' + d.getMinutes()).substr(-2) + ':' + ('0' + d.getSeconds()).substr(-2)
    };

    // Set up console logging
    if (!c.silent) {
        transports.push(new (winston.transports.Console)(
            {
                timestamp: dateFunc,
                level: c.debugLevel
            }));
    }

    winston.level = c.debugLevel;
    winston.showLevel = false;

    logger = new (winston.Logger)({
        transports: transports
    });

    logger.exitOnError = false;
}

// c.debugLevel output
var dd = function dd(msg, level)  {
    if (!logger) return;
    if (!msg) return;
    if (!level) level = 'info';

    //msg = helpers.safeLog(msg);

    // Here goes a sort of hidden multiline message delimiter
    msg += "                         ";

    logger.log(level, msg);
};

var initSocket = function (options, parent) {
    dd(('Connecting to upstream server ' + options.upstreamHost + ':' + options.upstreamPort).green);

    var socket = net.createConnection({
            host: options.upstreamHost,
            port: options.upstreamPort
        },

        function () {
            dd(('Connected to upstream ' + socket.remoteAddress + ':' + socket.remotePort + '!').green);
            socket.setNoDelay(true);

            if (socket.options.upstreamTimeout) socket.setTimeout(socket.options.upstreamTimeout * 1000);
        }
    );

    socket.options = options;

    // 'Data' event is triggered when upstream sends us data
    socket.on('data', function (data) {
        dd('Got data from ISO-host (' + data.length + 'b)');
    });

    // 'End' event is triggered when the socket is about to close
    socket.on('end', function () {
        dd('Upstream <end>'.red);
    });

    // 'Close' event is triggered when the socket was closed
    socket.on('close', function () {
        dd('Upstream <close>'.red);

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
        dd(('Upstream socket error ' + err).red);
    });

    // 'Timeout' event is triggered on connection timeout (no data sent or recieved for a given period of time)
    socket.on('timeout', function () {
        dd('Upstream timeout!'.yellow);
    });

    return socket;

};

var initClientSocket = function (upstream, options) {

    var server = net.createServer(function (socket) {

        socket.name = socket.remoteAddress + ':' + socket.remotePort;
        if (options.clientTimeout) socket.setTimeout(options.clientTimeout * 1000);
        dd(('Client ' + socket.name + ' connected').yellow);

        // 'Data' event is triggered when some client sends us data
        socket.on('data', function (data) {
            dd(('Client ' + socket.name + ' sent data (' + data.length + 'b)').yellow);
        });

        // 'End' event is triggered when the socket is about to close
        socket.on('end', function () {
            dd(('Client ' + socket.name + ' <end> event').yellow);
        });

        // 'Close' event is triggered when the socket was closed
        socket.on('close', function() {
            dd(('Client ' + socket.name + ' <close> event').yellow);
        });

        // 'Error' event is triggered on socket errors
        socket.on('error', function(err) {
            dd('Client <error> ' + err);
        });

        // 'Timeout' event is triggered on socket timeout
        socket.on('timeout', function(err) {
            dd('Client ' + socket.name + ' <socket timeout>');
            this.end();
        });
    });

    server.on('error', function(err) {
        dd('Socket server <error> ' + err);
    });

    return server;

};

var initHttpClientSocket = function (upstream, options) {

    var parent = this;

    var server = http.createServer(function (req, res) {
        // This method sends client reply
        req.sendReply = function(msg, code, errors) {
            if (!errors) {
                errors = [];
            } else {
                if (!Array.isArray(errors)) errors = [errors];
            }

            if (!code) code = 200;

            if (!req.isRawMode) {
                msg = JSON.stringify({result: msg, errors: errors});
                msg += '\n';
            }

            res.writeHead(code, {
                "Content-Type": "application/json",
                'Content-Length': msg.length
            });

            res.write(msg);
            res.end();
            req.client.end();
        };

        // This method is triggered by upstream to reply to the sender
        req.reply = function(p) {
            var msg;
            if (!this.isRawMode) {
                msg = prepareDataOut(p.getFields());
            } else {
                msg = p.getRawMessage().toString('hex');
            }

            this.sendReply(msg);

            return true;
        };

        // This method is triggered on queue timeout
        req.queueTimeout = function() {
            dd('Client ' + req.name + ' gateway timeout');
            req.sendReply('', 504, 'Gateway timeout');
        };

        // This method is triggered to say client goodbye
        req.end = function() {
            req.client.end();
        };

        // Checks if req was already closed
        req.isClosed = function() {
            return !this.client.writable;
        };

        req.name = 'http:' + req.connection.remoteAddress + ':' + req.connection.remotePort;
        dd(('Client ' + req.name + ' connected').yellow);

        if (req.method == 'POST') {
            var body = "";
            req.on('data', function (chunk) {
                dd(('Client ' + req.name + ' sent data').yellow);

                body += chunk;

                if (!req.headers.hasOwnProperty('content-length')) {
                    this.sendReply('', 400, 'Bad request');
                }

                if (body.length > 1e6) req.connection.destroy();

                if (body.length >= parseInt(req.headers['content-length'])) {
                    // We Handle JSON at / EG: { "0": "800", "3": "0", "7": "0607161700", "11": "123456", "24": "0", "41": "00123456", "42": "123567890124567" }
                    var data = null;
                    if (req.url == '/') {
                        try {
                            data = JSON.parse(body);
                            //data = preparedataectDataIn(data);
                        } catch (ex) {
                            this.sendReply('', 400, [ex.toString()]);
                            return;
                        }
                        // We handle raw hex data at /raw. EG: 30383030303132333435363030303030313233343536313233353637383930313234353637 (0800...)
                    } else if (req.url == '/raw') {
                        data = new Buffer(body, 'hex');
                        req.isRawMode = true;
                    } else {
                        this.sendReply('', 404, 'Not Found');
                    }

                    var errReturn = [];

                    if (!upstream.sendData(req, data, null, errReturn)) {
                        if (!errReturn.length) {
                            this.sendReply('', 500, 'Failed to queue message');
                        } else {
                            this.sendReply('', 500, errReturn);
                        }
                    }
                } else {
                    this.sendReply('', 400, 'Bad request');
                }
            });
        } else {
            req.sendReply('', 405, 'Method Not Allowed');
        }

        // 'Close' event is triggered on connection close
        req.client.on('close', function() {
            dd(('Client ' + req.name + ' <close> event').yellow);

            if (req.queueMessageId) {
                upstream.hasGone(req.queueMessageId);
            }
        });

        // 'Error' event is triggered on req errors
        req.on('error', function(err) {
            dd('Client <error> ' + err);
        });

        res.on('error', function(err) {
            dd('Client res <error> ' + err);
        });

        req.client.on('error', function(err) {
            dd('Client socket <error> ' + err);
        });

        // 'Timeout' event is triggered on req timeout
        req.on('timeout', function(err) {
            req.sendReply('', 408, 'Request timeout');
        });

        // 'Timeout' event is triggered on req timeout
        res.on('timeout', function(err) {
            req.sendReply('', 504, 'Gateway timeout');
        });

        // If deny mode is on
        if (parent.noMore) {
            req.sendReply('', 503, 'Service Temporarily Unavailable');
        }
    });

    server.deny = function() {
        parent.noMore = true;
    };

    if (options.clientTimeout) {
        server.setTimeout(options.clientTimeout * 1000);
    }

    server.on('connection', function() {
        dd('New HTTP socket');
    });

    server.on('clientError', function(exception, socket) {
        dd('HTTP client error emitted at server dataect: ' + exception);
    });

    return server;
};

global.dd = dd;

var _options = {
    hostConfig: 'localhost',
    listenPort: 1338,
    listenHttpPort: 9080,
    upstreamHost: '127.0.0.1',
    upstreamPort: 1337,
    upstreamTimeout: 5,
    clientTimeout: 5
};

dd('Important: starting...'.green);
dd('Remote host configuration name: ' + _options.hostConfig);

// Start the upstream server
if (_options.upstreamHost) {
    var _socket = initSocket(_options);

    if (_options.listenPort) {
        var _clientSocket = initClientSocket(_socket, _options).listen(_options.listenPort);
        dd("Relay raw ISO-8583 server is now running on port " + _options.listenPort);
    }

    if (_options.listenHttpPort) {
        var _httpClientSocket = initHttpClientSocket(_socket, _options).listen(_options.listenHttpPort);
        dd("Relay HTTP server is now running on port " + _options.listenHttpPort);
    }
} else {
    var _socket = null;
    var _clientSocket = null;
    var _httpClientSocket = null;
}
