const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

//redis configuration
const redisURI = require('../config/ci').redisURI;
const client = redis.createClient(redisURI);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;


//query caching depends upon this function
// we are adding a new function on the prototype of Query which can be easily accessible 
// by the every query which needs it 
mongoose.Query.prototype.cache = function( options = {}){
    this.enableCaching = true; // this here refers tot he Collection on which it is called upon
    this.hashKey = JSON.stringify(options.key || '') ;
    return this; //return this to make our cache function chainable (e.g. find.cache().limit(5).skip(5))

}



mongoose.Query.prototype.exec = async function(){

    // check if The Query need the caching checking before fetching
    if (!this.enableCaching) {
        console.log('About to Patch without caching');
        
        return exec.apply(this, arguments);
    }
    console.log('About to Patch exec with caching');


    //make a key with both query as well as the collection
    // for this use Object.assign to copy one object to another object
    // as other method will change the underlying properties of our query

    const uniqueKey = JSON.stringify(Object.assign({}, this.getQuery(),
     {collection: this.mongooseCollection.name}));

     //to use single hash value
     //const cachedValue = await client.get(uniqueKey);
    
     //to user nasted hash key-value pairs
    const cachedValue = await client.hget(this.hashKey ,uniqueKey)
     if (cachedValue) {
         console.log('cachedValue **************')
         //cachedValue is a json object as json is stored by redis whereas we are expected 
         //to return 
         //mongoose model to the app to run.So converting our result(cachedValue)
         // to the mongoose model.
        //  console.log(this);
        
         // this just handle the single json object
        //  const docs = new this.model(JSON.parse(cachedValue));

        //but we need to handle where there's an array of json objects
        const docs = JSON.parse(cachedValue);
        return Array.isArray(docs) ? docs.map(d => new this.model(d)) : new this.model(docs);


        //  return JSON.parse(cachedValue);
     }
     
    // console.log('unique key ', uniqueKey);

     const result = await exec.apply(this, arguments);

     client.hset(this.hashKey, uniqueKey, JSON.stringify(result));
     console.log("saved into cache")
    return result;
}
module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
        console.log('data flushed from redis')
    }
}