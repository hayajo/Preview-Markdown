var fs      = require('fs');
var express = require('express');
var md      = require('markdown');

var target = process.argv[2];
if (! target) {
    console.error('usage: ' + process.argv.join(' ') + ' <filename>');
    process.exit(1);
}
if (! fs.statSync(target).isFile()) {
    console.error(target + ' is not file');
    process.exit(1);
}
var html = md.parse(fs.readFileSync(target, 'utf8'));

var server = express.createServer();
server.configure(function() {
    server.use(express.logger());
    server.use('/css', express.static(__dirname + '/css'));
});
server.get('/', function(req, res) {
    res.send(
        '<!DOCTYPE html><html><head>' +
        '<link rel="stylesheet" href="css/gh-buttons.css" type="text/css"/>' + 
        '<link rel="stylesheet" href="css/main.css" type="text/css"/>' + 
        '<script type="text/javascript" src="/socket.io/socket.io.js"></script>' + 
        '<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>' +
        '<script type="text/javascript">' +
        'var socket = io.connect();socket.on("change", function (html) { document.getElementById("preview").innerHTML = html; });' + 
        '$(function($){$("#raw").click(function(){$("#dummy").attr("src","/raw");return false;})});' +
        '</script>' +
        '</head><body><div><iframe frameborder="0" width="0" height="0" id="dummy"></iframe><a href="#" class="button" id="raw">raw</a></div><div id="preview">' +
        html +
        '</div></body></html>'
    );
});
server.get('/raw', function(req, res) {
    res.download(target);
});
server.listen(3000);

var io = require('socket.io').listen(server);
fs.watchFile(target, { interval: 500 }, function(curr, prev) {
    fs.readFile(target, 'utf8', function(err, text) {
        if (err) { throw err; }
        io.sockets.emit('change', md.parse(text));
    });
});
