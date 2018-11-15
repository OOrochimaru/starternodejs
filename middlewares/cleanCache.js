const { clearHash } = require('../services/caching');

module.exports = async (req, res, next) => {
    await next();
    clearHash(req.user.id);
}