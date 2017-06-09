module.exports = {
    getFrame,
    printText
}

const ffmpeg = require("fluent-ffmpeg");
const utils = require('./localutils.js');
const settings = require('../settings/general.json');
const media = settings.media;
const Jimp = require('jimp');
const guid = require('guid');
var fs = require('fs');

function getFrame(phrase, ep, callback) {
    fs.readdir(media.episodes, function(err, items) {
        console.log('Media: ' + items[ep]);

        try {
            let name = guid.raw() + '.png';
            let process = ffmpeg(media.episodes + items[ep])
                .takeScreenshots({
                    count: 1,
                    filename: name,
                    timemarks: [ getAverageTime(phrase.Start, phrase.End) ]
                }, media.temp)
                .on('end', function(stdout, stderr) {
                    console.log('Media: Transcoding succeeded !');
                    removeTempImage(name);
                    callback(name);
                });
                console.log(media.temp + name);
        } catch (e) {
            console.log('[ERROR:Media]' + e.code);
            console.log('[ERROR:Media]' + e.msg);
        }
    });
}

function removeTempImage(n) {
    setTimeout(() => {fs.unlink(media.temp + n)}, media.temptimeout);
}

function getAverageTime(time1, time2) {
    return utils.msToTime(((utils.parseToSeconds(time1) + utils.parseToSeconds(time2))/ 2) * 1000) ;
}

function printText(text, file, callback) {
    Jimp.read(media.temp + file, function (err, image) {
        if(text.length > 20) {
            var words = text.split(' ');
            var tx1 = '', tx2 = '';
            var half = Math.floor(words.length/2);
            for(var i=0; i<half; i++) {
                tx1 += words[i] + ' ';
            }
            for(var i=half; i<words.length; i++) {
                tx2 += words[i] + ' ';
            }
            writeTwoLines(tx1, tx2, image, (f) => {
                console.log('Media: Text added, sent back');
                removeTempImage(f);
                callback(media.temp + f);
            });
        } else {
            writeSingleLine(text, image, (f) => {
                console.log('Media: Text added, sent back');
                removeTempImage(f);
                callback(media.temp + f);
            });
        }
        console.log('Media: Started text print...');
    });
}

function writeSingleLine(text, image, callback) {
    Jimp.loadFont(media.font, function (err, font) {
        let distX = getTextXMargin(text);
        image.print(font, distX, 280, text, function(err, image){
            let filename = guid.raw() + '.png';
            image.write(media.temp + filename, () =>{
                if(callback) callback(filename);
            });
        });
    });
}

function writeTwoLines(text1, text2, image, callback) {
    Jimp.loadFont(media.font, function (err, font) {
        let distX1 = getTextXMargin(text1);
        let distX2 = getTextXMargin(text2);
        image.print(font, distX1, 10, text1, function(err, image){
            image.print(font, distX2, 280, text2, function(err, image){
                let filename = guid.raw() + '.png';
                image.write(media.temp + filename, () => {
                    if(callback) callback(filename);
                });
            });
        });
    });
}

function getTextXMargin(text) {
    return 300 - ((text.length * 18) / 2);
}