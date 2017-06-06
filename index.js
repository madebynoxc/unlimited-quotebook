//var prompt = require('prompt');
//animIns.addNew("./subs/", "test");
var animIns = require("./modules/insert.js");
var _ = require("lodash");
var ffmpeg = require("fluent-ffmpeg");

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var url = 'mongodb://localhost:27017/quotebook';

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    var test = ["rum", "raisin?"];
    var collection = db.collection('episodes');
    collection.find({
        "phrases.Text" : {$regex : getRegexString(test), $options : 'i'}
    }).toArray((err, res) => {
        var rand_ep = _.sample(res);
        var ph = getPhraseList(rand_ep, test);
        var p = _.sample(ph);
        var text = getFrame(p, rand_ep.num - 1, (file) => {
            printText(p.Text, file);
        });
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

function getFrame(phrase, ep, callback) {
    var fs = require('fs');
    fs.readdir('./vids/', function(err, items) {
        console.log(items[ep]);

        try {
            var process = ffmpeg('./vids/' + items[ep])
                .takeScreenshots({
                    count: 1,
                    filename: 'temp.png',
                    timemarks: [ getAverageTime(phrase.Start, phrase.End) ]
                }, './')
                .on('end', function(stdout, stderr) {
                    console.log('Transcoding succeeded !');
                    callback(stdout);
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

function printText(text, file) {
    Jimp = require('jimp');
    Jimp.read('./temp.png', function (err, image) {
        console.log(image);
        if(text.length > 20) {
            var words = text.split(' ');
            var tx1 = '', tx2 = '';
            var half = Math.floor(words.length/2);
            for(var i=0; i<half; i++) {
                tx1 += words[i] + ' ';
            }
            for(var i=half; i<words.length; i++) {
                tx2 += words[i] + ' ';
            }
            writeTwoLines(tx1, tx2, image);
        } else {
            writeSingleLine(text, image);
        }
    });
}

function writeSingleLine(text, image, callback) {
    Jimp.loadFont('./fonts/segoe_rst.fnt', function (err, font) {
        var distX = getTextXMargin(text);
        image.print(font, distX, 280, text, function(err, image){
            image.write("./temp2.png");
            if(callback) callback();
        });
    });
}

function writeTwoLines(text1, text2, image, callback) {
    Jimp.loadFont('./fonts/segoe_rst.fnt', function (err, font) {
        var distX1 = getTextXMargin(text1);
        var distX2 = getTextXMargin(text2);
        image.print(font, distX1, 10, text1, function(err, image){
            image.print(font, distX2, 280, text2, function(err, image){
                image.write("./temp2.png");
                if(callback) callback();
            });
        });
    });
}

function getTextXMargin(text) {
    return 300 - ((text.length * 18) / 2);
}