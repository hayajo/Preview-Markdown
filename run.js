var app = require('app')
, fs = require('fs');

var target = process.argv[2];
if (! target) {
    console.error('usage: ' + process.argv.join(' ') + ' <filename>');
    process.exit(1);
} 

if (! fs.statSync(target).isFile()) {
    console.error(target + ' is not file');
    process.exit(1);
}

app.observe(target);

