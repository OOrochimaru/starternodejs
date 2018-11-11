const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

//redis configuration
const redisURI = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURI);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;


//query caching depends upon this function
// we are adding a new function on the prototype of Query which can be easily accessible 
// by the every query which needs it 
mongoose.Query.prototype.cache = function(){
    this.enableCaching = true; // this here refers tot he Collection on which it is called upon
    return this; //return this to make our cache function chainable (e.g. find.cache().limit(5).skip(5))

}



mongoose.Query.prototype.exec = async function(){

    // check if The Query need the caching checking before fetching
    if (!this.enableCaching) {
        return exec.apply(this, arguments);
    }

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
         //cachedValue is a json object as json is stored by redis whereas we are expected 
         //to return 
         //mongoose model to the app to run.So converting our result(cachedValue)
         // to the mongoose model.
         console.log(this);
        
         // this just handle the single json object
        //  const docs = new this.model(JSON.parse(cachedValue));

        //but we need to handle where there's an array of json objects
        const docs = JSON.parse(cachedValue);
        return Array.isArray(docs) ? docs.map(d => new this.model(d)) : new this.model(docs);


        //  return JSON.parse(cachedValue);
     }

    console.log('unique key ', uniqueKey);

     const result = await exec.apply(this, arguments);

     client.set(uniqueKey, JSON.stringify(result));
    return result;
}