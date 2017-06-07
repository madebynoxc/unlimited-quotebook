
const invite = 'https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=66186303';
const Discord = require("discord.js");
const extend = require('util')._extend;
var bot, core;

defaultArgs = {
    source: 'any',
    type: 'img',
    safe: false,
    id: false
}

function _init(c) {
    core = c;
    bot = new Discord.Client();
}

bot.on("ready", () => {
	console.log("[DiscordJS]: Connected!");
	bot.user.setGame("qb> .help");
	console.log("[DiscordJS]: Ready!");
});

bot.on("disconnected", () => {
	console.log("[DiscordJS]: Disconnected!");
});

bot.on("message", (message) => {
    if(message.author.bot) 
        return false;
    
    log(message);
    getCommand(message.content, (res, obj) => {
        if(res && obj){
            message.channel.sendMessage(res, obj);
        } else if(res) {
            message.channel.sendMessage(res);
        }
    });
});

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
    if(m.startsWith('qb> ')) {
        var sb = m.substring(4);
        switch(sb) {
            case '.help': 
                callback(showHelp());
                break;
            case '.up': 
                callback(voteResult(true));
                break;
            case '.down': 
                callback(voteResult(false));
                break;
            default:
                processRequest(sb, (res) => {
                    callback(res);
                });
        }
    }
    callback(undefined);
}

function showHelp() {
    let embed = {
		author: {
			name: "Unlimited Quotebook :tm: usage guide",
		},
		color: 0x4DD0D9,
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
    return "Check DM";
}

function voteResult(id) {
    return "[Bot:ERROR] Voting will be impemented soon!";
}

function processRequest(command, callback) {
    var regex = new RegExp(' -[^ ;]+', 'g');
    var args = regex.exec(command);
    if(args.length > 0) 
        setArgs(args);

    var keywords = command.split(' -')[0].split(' ');
    if(keywords.length < 0)
        callback('[Bot:ERROR] Sorry, seems like you did not specify any keywords D:');
    
    if(core)
        core.startRequest(keywords, defaultArgs, (resp, img) => {
            callback(resp, { img });
        });
    else {
        console.log('[Bot:ERROR] Core component is not defined!');
    }
    callback('[Internal error]');
}

function setArgs(args) {

}