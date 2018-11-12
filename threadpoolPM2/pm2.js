
var express = require('express');
var crypto = require('crypto');
var app = express();
var Worker = require('webworker-threads').Worker;



function toDO(duration) {
    var start = Date.now();
    while (Date.now() - start < duration) {

    }
}
app.get('/', (req, res) => {
    // crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', (data) => {
    //     res.send('HI THere')
    // });
    var worker = new Worker(function(){
        this.onmessage = function(){
            count = 0;
            while(count < 19){
                count++;
            }
            postMessage(count);
        };
    });

    worker.onmessage = function(count){
        res.send(''+count.data);
    };
    worker.postMessage();
});

app.get('/fast', (req, res) => {
    res.send('HI THere')
});

app.listen(3000);