"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);

var tsdb = require('./server/TimeSquaredDB');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.post('/db', function(req, res) {
    var query = req.body.query;
    console.log("Executing database query:\n\t" + query);
    tsdb.rawQuery(query)
        .then(function(result) {
            // Brute force with existing implementation: Format the output
            // to ressemble the current text-file format
            var resultStr = "",
                i;
            for (i = 0; i < result.data.length; i++) {
                resultStr += result.data[i].join(" ");
                resultStr += "\n";
            }
            res.send(resultStr);
            console.log("Sent " + result.data.length + " tuples");
        })
        .catch(function(err) {
            res.sendStatus(500);
            console.log(err);
        });
});

app.post('/db/metadata', function(req, res) {
    tsdb.getMetadata()
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            res.sendStatus(500);
            console.log(err);
        });
});

app.post('/db/events', function(req, res) {
    tsdb.getEvents()
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            res.sendStatus(500);
            console.log(err);
        });
});

var server = http.listen(3000, function () {
    var host = server.address().address,
        port = server.address().port;

    console.log('TimeSquared server hosted on http://%s:%s', host, port);
});
