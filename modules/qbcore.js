module.exports = {
    connect, disconnect,  
    startRequest
}

var _ = require("lodash");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var media = require('./media.js');
var utils = require('./localutils.js');

var mongodb, settings;
var isConnected = false;

function disconnect() {
    isConnected = false;
    media.clearTemp();
    mongodb.close();
}

function connect(sett, callback) {
    settings = sett;
    MongoClient.connect(sett.database, function(err, db) {
            assert.equal(null, err);
            mongodb = db;
            isConnected = true;
            console.log("Core: Connected correctly to database");   
            if(callback) callback();   
    });
}

function startRequest(keywords, params, callback) {
    if(!isConnected)
        return "[Core:ERROR] Not connected to databese D:";

    let req = { "phrases.Text" : {$regex : utils.getRegexString(keywords), $options : 'i'} };
    if(params.source) {
        req = { 
            "anim" : {$regex : utils.getSourceFormat(params.source), $options : 'i'},
            "phrases.Text" : {$regex : utils.getRegexString(keywords), $options : 'i'} 
        }
    }

    let collection = mongodb.collection('episodes');
    collection.find(req).toArray((err, res) => {
        if(res.length != 0) {
            let rand_ep = _.sample(res);
            let ph = getPhraseList(rand_ep, keywords);
            let p = _.sample(ph);
            let text = media.getFrame(p, rand_ep.num - 1, (file) => {
                
                media.printText(modifyText(p.Text, params), file, (result) => {
                    callback('', result);
                });
            });
        } else {
            console.log('Core: {' + keywords + "} \n Nothing found");
            callback("Nothing found ._.");
        }
    });
}

function modifyText(txt, params) {
    if(params.custom_text) 
        return params.custom_text;
        
    if(params.mention) {
        let reg = (new RegExp('[A-Z][a-z]*[-,]')).exec(txt);
        if(!reg) return txt;

        let match = reg[0];
        return txt.replace(match, params.mention + match[match.length - 1]);
    }
    return txt;
}

function getPhraseList(episode, match) {
    let res = [];
    let ph = episode.phrases;
    let re = new RegExp(utils.getRegexString(match), 'i');

    for(let i=0; i<ph.length; i++){
        if(re.exec(ph[i].Text)){
            res.push(ph[i]);
        }
    }
    console.log('Core: Found phrases ' + res.length);
    return res;
}