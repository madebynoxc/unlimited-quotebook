//https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=66186303

process.title = "unlimited_quotebook";
console.log("[DiscordJS]: Startng...");

const Discord = require("discord.js");
const extend = require('util')._extend;
const bot = new Discord.Client();

defaultArgs = {
    source: 'any',
    type: 'img',
    safe: false,
    id: false
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
    
    var response = getBasicResponse(message);
    var res = getCommand(message.content);
    if(res) {

    }
});

function getBasicResponse(message) {
    var response = '';
    try {
		response = message.guild.name + " : " + message.channel.name + " : " + message.author.username + " : " + message.content;
	} catch(e) {
		response = "PW : " + message.author.username + " : " + message.content;
	}
    return response;
}

function getCommand(m) {
    if(m.startsWith('qb> ')) {
        var sb = m.substring(4);
        switch(sb) {
            case '.help': 
                return showHelp();
            case '.up': 
                return voteResult(true);
            case '.donw': 
                return voteResult(false);
            default:
                return processRequest(sb);
        }
    }
    return undefined;
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

}

function processRequest(command) {
    var regex = new RegExp('/ -[^ ;]+/g');
    var args = regex.exec(command);
    if(args.length > 0) 
        setArgs(args);

    var keywords = command.split(' -')[0].split(' ');
    if(keywords.length < 0)
        return 'Sorry, seems like you did not specify any keywords D:';
    
    
}

function setArgs(args) {

}