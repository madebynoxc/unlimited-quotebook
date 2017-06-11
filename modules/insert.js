module.exports = {

    addNew : function(name, inc, path) {
        var parser = require("ass-parser");

        var fs = require('fs');
        fs.readdir(path, function(err, items) {
            var eps = [];

            if(!items){
                if(err) console.log(err);
                return;
            }

            checkDirsSync(name);

            let epCounter = 1;
            for (var i=0; i<items.length; i++) {
                console.log(items[i] + '-' + pathlib.extname(items[i]));
                if(pathlib.extname(items[i]) === '.ass') {
                    var sub = items[i];
                    var vid = items[i].replace('.ass', '.mp4');
                    var data = fs.readFileSync(path + sub);
                    var ep = {};
                    ep.phrases = getPhrases(parser(data), inc);
                    ep.anim = name;
                    ep.num = epCounter;
                    eps.push(ep);

                    fs.renameSync(path + sub, settings.subtitles + name + '/' + items[i]);
                    fs.renameSync(path + vid, settings.media.episodes + name + '/' + vid);
                    epCounter++;
                }
            }
            console.log("Found " + eps.length + " episodes");

            if(eps.length == 0){
                console.log("[ERROR]: Found 0 episodes");
            } else pushToDB(eps);
        });
    },

    
}

const settings = require('../settings/general.json');
const pathlib = require('path');

function getPhrases(data, include) {
        var lodash = require('lodash');
        var ret = [];
        for (var j=0; j<data.length; j++) {
            var sc = data[j];
            
            if(sc['section'] === 'Events') {   
                var filter = lodash.filter(sc['body'], { 'key': 'Dialogue' } );
                for (var i=0; i<filter.length; i++) {
                    var val = filter[i]['value'];
                    if(!include || val.Style == include){
                        let regex = new RegExp('\\\\N|{[^}]+}', 'ig');
                        val.Text = val.Text.replace(regex, ' ');
                        ret.push(val);
                    }
                }
            }
        }
        return ret;
    }

function pushToDB(episodes) {
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    MongoClient.connect(settings.database, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('episodes');
        collection.insert(episodes, (err, res) => {
            console.log("Inserted " + episodes[0].anim + " to DB");
        });
    });
}

function checkDirsSync(name) {
    mkdirp = require('mkdirp');
    mkdirp.sync(settings.media.episodes + name);
    mkdirp.sync(settings.subtitles + name);
}