module.exports = {

    addNew : function(path, name, subRequire = true) {
        var parser = require("ass-parser");

        var fs = require('fs');
        fs.readdir(path, function(err, items) {
            var eps = [];
            for (var i=0; i<items.length; i++) {
                var data = fs.readFileSync(path + items[i]);
                var cont = parser(data);
                var phrases = module.exports.getPhrases(cont);
                var ep = {};
                ep.phrases = phrases;
                ep.anim = name;
                ep.sub = subRequire;
                ep.num = i + 1;
                eps.push(ep);
            }
            console.log("Retrieved " + ep.length + " episodes");

            if(eps.length == 0){
                console.log("[ERR!]: Found 0 episodes");
                
            } else module.exports.pushToDB(eps);
        });
    },

    getPhrases : function(data) {
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
    },

    pushToDB : function(episodes) {
        var MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

        // Connection URL
        var url = 'mongodb://localhost:27017/quotebook';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");

            var collection = db.collection('episodes');
            collection.insert(episodes, (err, res) => {
                console.log("Inserted " + episodes[0].anim + " to DB");
                db.close();
            });
        });
    }
}