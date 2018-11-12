var crypto = require('crypto');
var http = require('https');
var fs = require('fs');
var express = require('express');
var app = express();

var now = Date.now();
//with the use of threadpool size 
//we can allocate each task to each thread in the thread pool
// process.env.UV_THREADPOOL_SIZE =  6;
function doRequest(){
http.request('https://www.google.com', res => {
    res.on('data',()=> {});
    res.on('end', () => {
        console.log("doRequest: ", Date.now() - now);
    });
}).end();
}

function Hash(){
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512',(data) => {
    console.log( 'Hashing: ', Date.now()- now);
});
}

doRequest();
fs.readFile('exercise5.js', 'utf8', ()=>{
    console.log('FS: ', Date.now()-now);
});

Hash();
Hash();
Hash();
Hash();
Hash();

