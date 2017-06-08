//var prompt = require('prompt');
//animIns.addNew("./subs/", "test");
process.title = "uqb";

var animIns = require("./modules/insert.js");
var core = require('./modules/qbcore.js');
var bot = require('./modules/bot.js');
var ins = require('./modules/insert.js');
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

console.log("-----------------");
console.log("Welcome \\('O')/");
console.log("Unlimited Quotebook cmd interface");
console.log("Use 'help' to list all commands");
console.log("Press 'Ctrl + C' to quit");

rl.on('line', function (cmd) {
    var sp = cmd.split(' ');
    switch(sp[0]) {
        case 'stbot':
            console.log('Starting Server...');
            core.connect(() => { bot._init(core); });
            break;
        case 'add':
            tryAddEpisodes(sp);
            break;
        case 'help':
            showHelp();
            break;
        default:
            console.log("[ERROR] Unknow command '" + sp[0] + "'");
    }
});

function tryAddEpisodes(args) {
    if(args.length < 2) {
        console.log('[ERROR] Correct usage: add <anime_name> [path]');
    } else {
        console.log('Locating files...');
        animIns.addNew(args[1], "subs/");
    }
}

function showHelp() {

}