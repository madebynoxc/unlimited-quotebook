
const invite = 'https://discordapp.com/oauth2/authorize?&client_id=321522356172619777&scope=bot&permissions=125952';
const Discord = require("discord.js");
const extend = require('util')._extend;
var bot, core, queue = 0;

const settings = require('../settings/general.json');
const utils = require('./localutils.js');
const media = require('./media.js');
const aces = require('./aces.js');
const logger = require('./log.js');
const defaultArgs = require('../settings/default_args.json');

module.exports = {
    _init, _stop
}

function _init(c) {
    core = c;
    bot = new Discord.Client();

    bot.on("ready", () => {
        console.log("Bot:DiscordJS: Connected!");
        bot.user.setGame(settings.botgame);
        console.log("Bot:DiscordJS: Ready!");
    });

    bot.on("disconnected", () => {
        if(core) core.disconnect();
        console.log("Bot:DiscordJS: Disconnected!");
    });

    bot.on("message", (message) => {
        if(message.author.bot, !message.content.startsWith('qb> ')) 
            return false;
        console.log("Bot Queue: " + queue);
        if(queue > settings.maxreq) {
            message.channel.send("Experiencing request overflow, sorry");
            return false;
        }

        log(message);
        queue++;  
        getCommand(message, (res, obj) => {
            queue--;
            if(!res && !obj) 
                return false;
                
            message.channel.send(res, obj);
        });
    });

    bot.login(settings.token).catch((reason) => {
        console.log(reason);
    });
}

function _stop() {
    logger.message("Bot: Shutting down...");
    return bot.destroy();
}

function log(message) {
    var msg = '';
    try {
		msg = message.guild.name + " : " + message.channel.name + " : " + message.author.username + " : " + message.content;
	} catch(e) {
		msg = "PW : " + message.author.username + " : " + message.content;
	}
    logger.message(msg);
}

function getCommand(m, callback) {
    if(m.content.startsWith('qb> ')) {
        let cnt = m.content.substring(4).split(' ');
        let sb = cnt.shift();
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
            case '.list':
                m.channel.startTyping(); 
                showList((res, obj) => {
                    m.channel.stopTyping(true);
                    callback(res, obj);
                });
                return;
            case '.clrtmp': 
                if(isAdmin(m.author.id)) {
                    media.clearTemp((num) => {
                        callback('Cleared ' + num + ' objects in temp');
                    });
                }
                return;
            case '.kill': 
                if(isAdmin(m.author.id)) {
                    callback("Shutting down now. I said with a posed look");
                    setTimeout(() => { _stop(); }, 2000); 
                }
                return;
            case '.aces':
                let subargs = cnt.join(' ');
                if(subargs) {
                    m.channel.startTyping();
                    aces.startRequest(subargs, (resp, img) => { 
                        callback(resp, {file: img }, false);
                        m.channel.stopTyping(true);
                    });
                } else {
                    callback("**Match pattern:** 'first line' 'second line' <image link>");
                }
                return;
            default:
                m.channel.startTyping();
                processRequest(sb + ' ' + cnt.join(' '), (res, obj, r) => {
                    if(r) m.delete();

                    callback(res, obj);
                    m.channel.stopTyping(true);
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
        color: utils.HEXToVBColor(settings.botcolor),
		fields: [{
			name:"qb> [keywords] [-params]",
			value:"Request a quote (see params section)",
			inline: false
        }, /*{
			name: "qb> .up",
			value: "Upvotes last result",
			inline: false
		}, {
			name: "qb> .down",
			value: "Downvotes last result",
			inline: false
		}*/
        {
			name: "qb> .list",
			value: "Shows the list of hosted episodes",
			inline: false
		}, {
			name: "qb> .aces",
			value: "AcesToAces in < 3 minutes \n "
            + "'first line' 'second line' <image link>",
			inline: false
		}, {
			name:"Parameters (-param)",
			value:
            "-s <name> | source name, default any \n"
            + "-men <any user> | tries to replace mention in quote with your text \n"
            + "-ctxt <text> | replaces phrase with your custom text \n"
            + "-msg <text> | puts custom message to image \n"
            + "-rmsg | removes your message with command, default false",
			inline: false
        }, {
			name: "For more detailed information",
			value: "https://github.com/NoxCaos/unlimited-quotebook",
			inline: false
		}
        ]
    }
    message.author.send("", { embed });
    return undefined;
}

function showStats(callback) {
    let embed = {
		author: {
			name: "Unlimited Quotebook stats",
		},
        color: utils.HEXToVBColor(settings.botcolor),
		fields: [{
			name:"qb> [keywords] [-params]",
			value:"Request a quote (see params section)",
			inline: false
        }]
    }
    callback("", { embed });
}

function showList(callback) {
    core.getEpisodeList((anim) => {
        console.log('Bot:Host: ' + anim);
        let embed = {
            color: utils.HEXToVBColor(settings.botcolor),
            fields: [{
                name: "Now hosting:",
                value: anim,
                inline: false
            }]
        }
        callback("", { embed });
    });
}

function voteResult(id) {
    return "Voting success! Now has: 0 votes";
}

function processRequest(command, callback) {
    let args = setArgs(command);
    console.log(args);

    let keywords = command.split(' -')[0].split(' ');
    if(keywords.length < 0)
        callback('[Bot:ERROR] Sorry, seems like you did not specify any keywords D:');
    
    if(core)
        core.startRequest(keywords, args, (resp, img) => { 
            callback(resp, {file: img }, args.remove_message);
        });
    else {
        console.log('[Bot:ERROR] Core component is not defined!');
    }
}

function setArgs(comm) {
    let regex = new RegExp(' -[^ ;]+', 'ig');
    let args = extend({}, defaultArgs);
    console.log('Arg start: ' + comm);
    while ((a = regex.exec(comm)) !== null) {
        let par = comm.slice(regex.lastIndex).split(' -')[0].trim();
        console.log('Bot:Arg: ' + a + ' = ' + par);
        switch(a[0].trim()) {
            case '-s':
                args.source = par;
                break;
            case '-gif':
                args.type = 'gif';
                break;
            case '-r':
                let p = parseInt(par);
                args.min_rating = p? p : args.min_rating;
                break;
            case '-id':
                args.return_id = true;
                break;
            case '-men':
                args.mention = par;
                break;
            case '-msg':
                args.message = par;
                break;
            case '-rmsg':
                args.remove_message = true;
                break;
            case '-ctxt':
                args.custom_text = par;
                break;
        }
    }
    return args;
}