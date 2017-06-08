
const invite = 'https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=125952';
const Discord = require("discord.js");
const token = 'MzIxNTIyMzU2MTcyNjE5Nzc3.DBjOMg.iiD9cs81JcmOluFY7XBE2wy7z7M';
const extend = require('util')._extend;
var bot, core;

module.exports = {
    _init: function(c) { _init(c); }
}

defaultArgs = {
    source: 'any',
    type: 'img',
    safe: false,
    id: false
}

function _init(c) {
    core = c;
    bot = new Discord.Client();

    bot.on("ready", () => {
        console.log("Bot:DiscordJS: Connected!");
        bot.user.setGame("qb> .help");
        console.log("Bot:DiscordJS: Ready!");
    });

    bot.on("disconnected", () => {
        if(core) core.disconnect();
        console.log("Bot:DiscordJS: Disconnected!");
    });

    bot.on("message", (message) => {
        if(message.author.bot, !message.content.startsWith('qb> ')) 
            return false;
        
        log(message);
        getCommand(message, (res, obj) => {
            if(obj){
                message.channel.send(res, obj);
            } else if(res) {
                message.channel.send(res);
            }
        });
    });

    bot.login(token);
}

function _stop() {
    //bot.st
}

function log(message) {
    var response = '';
    try {
		response = message.guild.name + " : " + message.channel.name + " : " + message.author.username + " : " + message.content;
	} catch(e) {
		response = "PW : " + message.author.username + " : " + message.content;
	}
    console.log(response);
}

function getCommand(m, callback) {
    if(m.content.startsWith('qb> ')) {
        var sb = m.content.substring(4);
        switch(sb) {
            case '.help': 
                callback(showHelp(m));
                break;
            case '.up': 
                callback(voteResult(true));
                break;
            case '.down': 
                callback(voteResult(false));
                break;
            default:
                processRequest(sb, (res, obj) => {
                    callback(res, obj);
                });
        }
    }
    callback(undefined);
}

function showHelp(message) {
    let embed = {
		author: {
			name: "Unlimited Quotebook usage guide \n",
		},
		color: 0x45e8a4,
		fields: [{
			name:"qb> [keywords] [-params]",
			value:"Request a quote (see params section)",
			inline: false
		}, {
			name: "qb> .up",
			value: "Upvotes last result",
			inline: false
		}, {
			name: "qb> .down",
			value: "Downvotes last result",
			inline: false
		}]
    }
    message.author.sendMessage("", { embed });
    return undefined;
}

function voteResult(id) {
    return "[Bot:ERROR] Voting will be impemented soon!";
}

function processRequest(command, callback) {
    var regex = new RegExp(' -[^ ;]+', 'g');
    var args = regex.exec(command);
    if(args && args.length > 0) 
        setArgs(args);

    var keywords = command.split(' -')[0].split(' ');
    if(keywords.length < 0)
        callback('[Bot:ERROR] Sorry, seems like you did not specify any keywords D:');
    
    if(core)
        core.startRequest(keywords, defaultArgs, (resp, img) => {
            callback(resp, { file: img });
        });
    else {
        console.log('[Bot:ERROR] Core component is not defined!');
    }
}

function setArgs(args) {

}