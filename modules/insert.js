module.exports = {

    addNew : function(path, name, subRequire = true) {
        var parser = require("ass-parser");

        var fs = require('fs');
        fs.readdir(path, function(err, items) {
            var ep = [];
            for (var i=0; i<items.length; i++) {
                var data = fs.readFileSync(path + items[i]);
                var cont = parser(data);
                var phrases = module.exports.getPhrases(cont);
                ep[i] = phrases;
            }
            console.log("Retrieved " + ep.length + " episodes");

            var anim = {
                name : name,
                subRequire : subRequire,
                episodes : ep
            };

            if(ep.length == 0){
                console.log("[ERR!]: Found 0 episodes");
                
            } else module.exports.pushToDB(anim);
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

    pushToDB : function(animation) {
        var MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

        // Connection URL
        var url = 'mongodb://localhost:27017/quotebook';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");

            var collection = db.collection('animations');
            collection.insert(animation, (err, res) => {
                console.log("Inserted " + animation.name + " to DB");
                db.close();
            });
        });
    }
}