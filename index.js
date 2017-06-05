//var prompt = require('prompt');
//animIns.addNew("./subs/", "test");
var animIns = require("./modules/insert.js");
var _ = require("lodash");
var ffmpeg = require("ffmpeg");

var MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

        var url = 'mongodb://localhost:27017/quotebook';

        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");

            var test = ["have", "some", "juice"];
            var collection = db.collection('episodes');
            collection.find({
                "phrases.Text" : {$regex : getRegexString(test), $options : 'i'}
            }).toArray((err, res) => {
                var rand_ep = _.sample(res);
                var ph = getPhraseList(rand_ep, test);
                var p = _.sample(ph);
                var text = getFrame(_.sample(ph), rand_ep.num - 1);
                //console.log(ph);
                db.close();
            });
            
        });

function getPhraseList(episode, match) {
    var res = [];
    var ph = episode.phrases;
    var re = new RegExp(getRegexString(match), 'i');

    for(var i=0; i<ph.length; i++){
        if(re.exec(ph[i].Text)){
            res.push(ph[i]);
        }
    }
    console.log(res);
    return res;
}

function getRegexString(arr) {
    var ln = arr[0];
    for(var j=1; j<arr.length; j++) {
        ln += '.*' + arr[j];
    }
    return ln;
}

function getFrame(phrase, ep) {
    var fs = require('fs');
    fs.readdir('./vids/', function(err, items) {
        console.log(items[ep]);

        try {
            var process = new ffmpeg('./vids/' + items[ep]);
            process.then(function (video) {
                video.addCommand('-y', '');
                video.addCommand('-ss', getAverageTime(phrase.Start, phrase.End));
                video.addCommand('-vframes', '1');
                video.save('./oq.jpg', (err, file) => {
                    if (!err)
                        console.log("Extracted frame");
                });
            });
        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }
    });
}

function getAverageTime(time1, time2) {
    return msToTime(((parseToSeconds(time1) + parseToSeconds(time2))/ 2) * 1000) ;
}

function parseToSeconds(inp) {
    var c = inp.split(':');
    return parseInt(c[0]) * 3600 
    + parseInt(c[1]) * 60
    + parseFloat(c[2]);
}

function msToTime(s) {

  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}