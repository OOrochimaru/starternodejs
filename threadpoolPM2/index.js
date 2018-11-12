
var cluster = require('cluster');
var express = require('express');
var crypto = require('crypto');
var app = express();

process.env.UV_THREADPOOL_SIZE = 1; //child node will have threadpool size of one

// first index.js will run and create a cluster which will be a master
if (cluster.isMaster) {
    // here it will create a child mode and run the index.js again but as a child 
    cluster.fork();
    // cluster.fork();
    //here each child will have their threadpool(4 by default) can be manipulated as above
    //forking too much child will reduce the performace
    //best way: child should be the same number as physical or logical processor on the system
} else {

    function toDO(duration) {
        var start = Date.now();
        while (Date.now() - start < duration) {

        }
    }
    app.get('/', (req, res) => {
        crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', (data) => {
            res.send('HI THere')
        });
    });

    app.get('/fast', (req, res) => {
        res.send('HI THere')
    });

    app.listen(3000);
}