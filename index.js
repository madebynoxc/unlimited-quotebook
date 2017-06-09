process.title = "uqb";

const settings = require('./settings/general.json');

if(!settings){
    console.log("[ERROR] The default settings file was not found");
    return;
}

var animIns = require("./modules/insert.js");
var core = require('./modules/qbcore.js');
var bot = require('./modules/bot.js');
var ins = require('./modules/insert.js');
var readline = require('readline');

let rl = readline.createInterface({
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
    let sp = cmd.split(' ');
    switch(sp[0]) {
        case 'startb':
            console.log('Starting Server...');
            core.connect(settings, () => { bot._init(core); });
            break;
        case 'stopb':
            console.log('Shutting down Server...');
            bot._stop();
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
        console.log('[ERROR] Correct usage: add <anime_name> optional: subs_path]');
    } else {
        console.log('Locating files...');
        animIns.addNew(args[1], args.length > 2? args[2] : settings.subtitles);
    }
}

function showHelp() {
    console.log("--------HELP--------");
    console.log("startb - starts the bot");
    console.log("stopb - stops the bot");
    console.log("add <anime_name> optional: [subs_path]");
}