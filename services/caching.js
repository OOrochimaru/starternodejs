const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

//redis configuration
const redisURI = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURI);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;



mongoose.Query.prototype.exec = async function(){
    console.log('About to Patch exec fxn in our app');
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);

    //make a key with both query as well as the collection
    // for this use Object.assign to copy one object to another object
    // as other method will change the underlying properties of our query

    const uniqueKey =JSON.stringify(Object.assign({}, this.getQuery(),
     {collection: this.mongooseCollection.name}));

     const cachedValue = await client.get(uniqueKey);

     if (cachedValue) {
         console.log(cachedValue);
     }

    console.log('unique key ', uniqueKey);

     console.log(await exec.apply(this, arguments));
    return exec.apply(this, arguments);
    
}