const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');
const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    useAccelerateEndpoint: true

})

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        const signedUrlExpireSeconds = 60 * 60000;
        const key = `${req.user.id}/${uuid()}.png`;
        // const key = `s3-blog-bucket/messis.jpeg`;
        s3.getSignedUrl('putObject',
            {
                Bucket: 's3-blog-bucket',
                Key: key,
                Expires: signedUrlExpireSeconds,
                ACL: 'public-read-write',
                ContentType: 'image/*',
            }, (err, url) => {
                res.send({key,url });
                console.log("GetSignedURL COMPLETE");
            }
        );
    });
};