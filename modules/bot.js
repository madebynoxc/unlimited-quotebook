
const invite = 'https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=125952';
const Discord = require("discord.js");
const extend = require('util')._extend;
var bot, core, queue;

const settings = require('../settings/general.json');
const defaultArgs = require('../settings/default_args.json');

module.exports = {
    _init, _stop
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
        if(queue > settings.maxreq) {
            message.channel.send("Experiencing request overflow, sorry");
        }

        log(message);
        queue++;
        message.channel.startTyping();
        getCommand(message, (res, obj = {}) => {
            message.channel.send(res, obj);
            queue--;
            message.channel.stopTyping(true);
        });
    });

    bot.login(settings.token);
}

function _stop() {
    console.log("Bot: Shutting down...");
    return bot.destroy();
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
        let sb = m.content.substring(4);
        switch(sb) {
            case '.help': 
                callback(showHelp(m));
                return;
            case '.up': 
                callback(voteResult(true));
                return;
            case '.down': 
                callback(voteResult(false));
                return;
            case '.kill': 
                if(isAdmin(m.sender)) {
                    callback("Shutting down now. I said with a posed look");
                    _stop();
                }
                return;
            default:
                processRequest(sb, (res, obj) => {
                    callback(res, obj);
                });
                return;
        }
    }
    callback(undefined);
}

function isAdmin(sender) {
    return settings.admins.includes(sender);
}

function showHelp(message) {
    let embed = {
		author: {
			name: "Unlimited Quotebook usage guide \n",
		},
		color: '0x' + settings.botcolor,
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
    let regex = new RegExp(' -[^ ;]+', 'g', 'i');
    let args = regex.exec(command);
    if(args && args.length > 0) 
        setArgs(args);

    let keywords = command.split(' -')[0].split(' ');
    if(keywords.length < 0)
        callback('[Bot:ERROR] Sorry, seems like you did not specify any keywords D:');
    
    if(core)
        core.startRequest(keywords, defaultArgs, (resp, img) => {
            callback(resp, {color: '0x' + settings.botcolor, file: img });
        });
    else {
        console.log('[Bot:ERROR] Core component is not defined!');
    }
}

function setArgs(args) {

}