var respawn = require('respawn');
var Winston = require('winston');

var logger = new(Winston.Logger)({
    transports: [
        new(Winston.transports.Console)(),
        new(Winston.transports.File)({
            json: false,
            filename: "monitor.log"
        })
    ]
});

var proc = respawn(['node', 'main.js'], {
    cwd: '.',
    maxRestarts: 10,
    sleep: 1000,
});

proc.on('spawn', function () {
    logger.info('application monitor started...');
});

proc.on('exit', function (code, signal) {
    logger.error("Processes exited! Code: " + code + " Signal: " + signal);
});

proc.on('stdout', function (data) {
    console.log(data.toString());
});

proc.on('stderr', function (data) {
    console.log("Error: " + data);
});

proc.start();