module.exports = {
    disconnect: function() {
        mongodb.close();
    },

    connect: function(callback) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            mongodb = db;
            isConnected = true;
            console.log("Core: Connected correctly to database");   
            if(callback) callback();      
        });
    },
    
    startRequest
}

var _ = require("lodash");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var media = require('./media.js');
var utils = require('./localutils.js');

const url = 'mongodb://localhost:27017/quotebook';
var mongodb;
var isConnected = false;

function startRequest(keywords, params, callback) {
    if(!isConnected)
        return "[Core:ERROR] Not connected to databese D:";

    //var test = ["Toshinou", "Kyoko"];
    var collection = mongodb.collection('episodes');
    collection.find({
        "phrases.Text" : {$regex : utils.getRegexString(keywords), $options : 'i'}
    }).toArray((err, res) => {
        if(res.length != 0) {
            var rand_ep = _.sample(res);
            var ph = getPhraseList(rand_ep, keywords);
            var p = _.sample(ph);
            var text = media.getFrame(p, rand_ep.num - 1, (file) => {
                media.printText(p.Text, file, () => {
                    callback('', './temp2.png');
                });
            });
        } else {
            console.log('Core: {' + keywords + "} \n Nothing found");
            callback("[Core:ERROR] Nothing found /._.\\");
        }
    });
}

function getPhraseList(episode, match) {
    var res = [];
    var ph = episode.phrases;
    var re = new RegExp(utils.getRegexString(match), 'i');

    for(var i=0; i<ph.length; i++){
        if(re.exec(ph[i].Text)){
            res.push(ph[i]);
        }
    }
    console.log('Core: Found phrases ${res.length}');
    return res;
}