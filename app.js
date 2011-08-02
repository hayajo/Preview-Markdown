
/**
 * Module dependencies.
*/

var express = require('express')
, md = require('markdown')
, fs = require('fs')
, path = require('path');

var app = module.exports = express.createServer();
app.set('target', __dirname + '/app.md');

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
    res.render('index', {
        title: 'Preview Markdown'
        , file: path.basename(app.set('target'))
        , html: md.parse(fs.readFileSync(app.set('target'), 'utf8'))
    });
});
app.get('/raw', function(req, res) {
    res.download(app.set('target'));
});

var io = require('socket.io').listen(app);

// TODO
var unobserve = module.exports.unobserve = function() {
    fs.unwatchFile(app.set('target'));
};
var observe = module.exports.observe = function(file) {
    //var old = app.set('target'); 
    //if (old) {
        //fs.unwatchFile(old);
    //}
    unobserve();
    if (file) {
        app.set('target', file);
    }
    fs.watchFile(app.set('target'), { interval: 500 }, function(curr, prev) {
        fs.readFile(app.set('target'), 'utf8', function(err, text) {
            if (err) { throw err; }
            io.sockets.emit('change', md.parse(text));
        });
    });
};
observe();

// TODO
//var unobserve = module.exports.unobserve = function() {
    //fs.unwatchFile(app.set('target'));
//};

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
