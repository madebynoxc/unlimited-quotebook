//var prompt = require('prompt');
//animIns.addNew("./subs/", "test");
process.title = "unlimited_quotebook";

var animIns = require("./modules/insert.js");
var core = require('./modules/qbcore.js');
var bot = require('./modules/bot.js');

console.log('Starting Server...');

core.connect();
bot._init(core);
