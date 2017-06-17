module.exports = {
    getFrame,
    printText,
    clearTemp,
    removeTempImage,
    writeImage
}

const ffmpeg = require("fluent-ffmpeg");
const utils = require('./localutils.js');
const settings = require('../settings/general.json');
const media = settings.media;
const Jimp = require('jimp');
const guid = require('guid');
var fs = require('fs');

function getFrame(phrase, ep, callback) {
    fs.readdir(media.episodes + ep.anim, function(err, items) {
        let index = ep.num - 1;
        console.log('Media: ' + media.episodes + ep.anim + '/' + items[index]);

        try {
            let name = guid.raw() + '.png';
            let process = ffmpeg(media.episodes + ep.anim + '/' + items[index])
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
    if(media.temptimeout < 0) return;
    if(media.temptimeout < 5){
        media.temptimeout = 5;
        console.log('[Media:WARN] The minimal temp autoclear timeout is 5sec');
    }

    setTimeout(() => {fs.unlink(media.temp + n, (err) => {
        if(err) console.log('[Media:ERROR] Clear temp: ' + err);
    })}, media.temptimeout);
}

function clearTemp(callback) {
    fs.readdir(media.temp, (err, files) => {
        if(err) {
            console.log('[Media:ERROR] Clear temp: ' + err);
        } else {
            for (var i = 0; i < files.length; i++) {
                fs.unlink(media.temp + files[i], (err) => {
                    if(err) console.log(err);
                });
            }
            console.log("Removed " + files.length + " items");
            if(callback) callback(files.length);
        }
    });
}

function getAverageTime(time1, time2) {
    return utils.msToTime(((utils.parseToSeconds(time1) + utils.parseToSeconds(time2))/ 2) * 1000) ;
}

function printText(text, file, callback) {
    Jimp.read(media.temp + file, function (err, image) {
        let words = text.split(/ |-/g);
        let wordsInLine = Math.floor(words.length/Math.fround(text.length / 27));
        let promises = [], lines = [], ln = 0;
        lines[ln] = '';

        for (var i = 0; i < words.length; i++) { 
            if(i != 0 && i % wordsInLine == 0) {
                ln++;
                lines[ln] = '';
            } 
            lines[ln] += words[i] + ' ';
        }
        
        Jimp.loadFont(media.font, function (err, font) {
            switch(lines.length) {
                case 0:
                    console.log('Media: Parsing text error');
                case 1:
                    image.print(font, getTextXMargin(lines[0]), 280, lines[0], () => {
                            writeImage(image, (f) => callback(f));
                        });
                    break;
                case 2:
                    image.print(font, getTextXMargin(lines[0]), 10, lines[0])
                        .print(font, getTextXMargin(lines[1]), 280, lines[1], () => {
                            writeImage(image, (f) => callback(f));
                        });
                    break;
                case 3:
                    image.print(font, getTextXMargin(lines[0]), 10, lines[0])
                        .print(font, getTextXMargin(lines[1]), 240, lines[1])
                        .print(font, getTextXMargin(lines[2]), 280, lines[2], () => {
                            writeImage(image, (f) => callback(f));
                        });
                    break;
                default:
                    image.print(font, getTextXMargin(lines[0]), 10, lines[0])
                        .print(font, getTextXMargin(lines[1]), 50, lines[1])
                        .print(font, getTextXMargin(lines[2]), 240, lines[2])
                        .print(font, getTextXMargin(lines[3]), 280, lines[3], () => {
                            writeImage(image, (f) => callback(f));
                        });
                    break;
            }
        });

        console.log('Media: Started text print...');
    });
}

function renderTextLine(text, image, font, offsetY) {
    let distX = getTextXMargin(text);
    return image.print(font, distX, offsetY, text);
}

function writeImage(image, callback) {
    let filename = guid.raw() + '.png';
    image.write(media.temp + filename, () => {
        console.log('Media: Text added, sent back');
        removeTempImage(filename);
        callback(media.temp + filename);
    });
}

function getTextXMargin(text) {
    return 300 - ((text.length * 18) / 2);
}