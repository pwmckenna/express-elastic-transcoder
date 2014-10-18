'use strict';

var path = require('path');
var AWS = require('aws-sdk');
var _ = require('lodash');
var expressHandlebars = require('express-handlebars');

var STATUS = {
    SUBMITTED: 'Submitted',
    PROGRESSING: 'Progressing',
    COMPLETE: 'Complete',
    CANCELED: 'Canceled',
    ERROR: 'Error'
};

var STATUS_SORT_ORDER = [
    STATUS.ERROR,
    STATUS.CANCELED,
    STATUS.PROGRESSING,
    STATUS.SUBMITTED,
    STATUS.COMPLETE
];

var STATUS_CLASSES = {};
STATUS_CLASSES[STATUS.SUBMITTED] = '';
STATUS_CLASSES[STATUS.PROGRESSING] = 'info';
STATUS_CLASSES[STATUS.COMPLETE] = 'success';
STATUS_CLASSES[STATUS.CANCELED] = 'warning';
STATUS_CLASSES[STATUS.ERROR] = 'danger';

module.exports = function (awsOptions, pipelineId) {
    var transcoder = new AWS.ElasticTranscoder(awsOptions);

    var listJobsByPipeline = function (pageToken, cb) {
        transcoder.listJobsByPipeline({
            PipelineId: pipelineId,
            Ascending: 'true',
            PageToken: pageToken
        }, function (err, data) {
            if (err) { return cb(err); }
            if (data.NextPageToken) {
                listJobsByPipeline(data.NextPageToken, function (err, nextJobs) {
                    if (err) { return cb(err); }
                    cb(null, data.Jobs.concat(nextJobs));
                });
            } else {
                cb(null, data.Jobs);
            }
        });
    };

    var express = require('express');
    var app = express();
    app.set('views', path.resolve(__dirname, 'views'));
    var handlebars = expressHandlebars.create({
        defaultLayout: 'default',
        layoutsDir: path.resolve(__dirname, 'views', 'layouts'),
        helpers: {
            statusClass: function (status) {
                return STATUS_CLASSES[status];
            }
        }
    });
    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');

    app.get('/', function (req, res) {
        res.redirect(req.baseUrl + STATUS.PROGRESSING);
    });

    app.locals.status = _.values(STATUS);
    _.each(STATUS, function (status) {
        app.get('/' + status, function (req, res) {
            listJobsByPipeline(void 0, function (err, jobs) {
                if (err) {
                    return next(err);
                }
                res.render('index', {
                    jobs: _.where(jobs, {
                        Status: status
                    })
                });
            });
        });
    });

    return app;
};
