express-elastic-transcoder
==========================

an express app that will expose aws elastic transcoder jobs (for a specified pipeline), which you can navigate by status. Not much to look at, but certainly easier to just mount this than to try to navigate the aws console. Mount it on your existing express app (preferably behind some sort of authentication).

Usage: 

```js
app.use('/transcoder', require('express-elastic-transcoder')({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS
    region: process.env.AWS_REGION
}, process.env.AWS_TRANSCODE_PIPELINE_ID));
```
