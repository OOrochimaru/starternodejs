const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin,  async (req, res) => {
    const blogs = await Blog.find({_user: req.user.id}).cache({
      key : req.user.id
    });
    return res.send(blogs);
    
    // const redis =  require('redis');
    // const rediURI = 'redis://127.0.0.1:6379'
    // const client = redis.createClient(rediURI);
    // const util = require('util');
    // client.get = util.promisify(client.get);
    // const redisCheck = await client.get(req.user.id);
    // if (redisCheck) {
    //   console.log('Serving from REDIS');
    //   return res.send(JSON.parse(redisCheck));
    // }
    
    // console.log('Serving from MONODB');
    // const blogs = await Blog.find({ _user: req.user.id });
    // res.send(blogs);
    // client.set(req.user.id, JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res, next) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
      console.log("data saved");
    } catch (err) {
      res.send(400, err);
    }
  });
};
