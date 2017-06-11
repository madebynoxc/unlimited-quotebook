module.exports = {
    connect, disconnect,  
    startRequest, getEpisodeList
}

var _ = require("lodash");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var media = require('./media.js');
var fs = require('fs');
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

            if (!fs.existsSync(settings.media.temp)){
                fs.mkdirSync(settings.media.temp);
            }
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
            let text = media.getFrame(p, rand_ep, (file) => {
                
                media.printText(modifyText(p.Text, params), file, (result) => {
                    callback(params.message? params.message : '', result);
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
        let men = params.mention.split('#')[0].replace('@', '');
        return txt.replace(match, men + match[match.length - 1]);
    }

    let regex = new RegExp('\\\\N|{[^}]+}', 'ig');
    txt = txt.replace(regex, ' ');
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

function getEpisodeList(callback) {
    let anims = '';
    let collection = mongodb.collection('episodes');
    collection.find({ }).toArray((err, res) => { 
        for(var i=0; i<res.length; i++){
            if(!anims.includes(res[i].anim)) {
                anims += res[i].anim + ', ';
            }
        }
        callback(anims.slice(0, -2));
    });
}