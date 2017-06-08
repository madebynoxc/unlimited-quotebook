module.exports = {

    addNew : function(name, path, subRequire = true) {
        var parser = require("ass-parser");

        var fs = require('fs');
        fs.readdir('./subs/', function(err, items) {
            var eps = [];
            if(!items){
                if(err)
                    console.log(err);
                else
                    console.log('[ERROR] No suitable items in ' + path);
                return;
            }

            for (var i=0; i<items.length; i++) {
                var data = fs.readFileSync(path + items[i]);
                var cont = parser(data);
                var phrases = getPhrases(cont);
                var ep = {};
                ep.phrases = phrases;
                ep.anim = name;
                ep.sub = subRequire;
                ep.num = i + 1;
                eps.push(ep);
            }
            console.log("Retrieved " + eps.length + " episodes");

            if(eps.length == 0){
                console.log("[ERR!]: Found 0 episodes");
                
            } else pushToDB(eps);
        });
    },

    
}

const url = 'mongodb://localhost:27017/quotebook';

function getPhrases(data) {
        var lodash = require('lodash');
        var ret = [];
        for (var j=0; j<data.length; j++) {
            var sc = data[j];
            
            if(sc['section'] === 'Events') {   
                var filter = lodash.filter(sc['body'], { 'key': 'Dialogue' } );
                for (var i=0; i<filter.length; i++) {
                    var val = filter[i]['value'];
                    if(val.Style == 'Default')
                        ret.push(val);
                }
            }
        }
        return ret;
    }

function pushToDB(episodes) {
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('episodes');
        collection.insert(episodes, (err, res) => {
            console.log("Inserted " + episodes[0].anim + " to DB");
        });
    });
}