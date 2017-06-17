module.exports = {
    generateImage, startRequest
}

const guid = require('guid');
const settings = require('../settings/general.json');
const fs = require('fs');
const media = require('./media.js');
const request = require('request');
const Jimp = require('jimp');

function startRequest(line, callback) {
    console.log(line);
    let regex = new RegExp(`[<'"][^'">]+['">]`, 'g');
    let args = [], r;
    while((r = regex.exec(line)) !== null) {
        args.push(r[0].slice(1, -1));
    }

    try {
        console.log(args);
        generateImage(args[0], args[1], args[2], (img) => {
            if(img) callback('', img);
            else callback("Error. Failed to download image");
        });
    } catch (err) {
        console.log('[Aces:ERROR] ' + err);
        callback("Error. Make sure you match pattern \n 'first line' 'second line' <image link>");
    }
}

function generateImage(line1, line2, uri, callback) {
    downloadImage(uri, (file) => {
        Jimp.read(settings.media.temp + file, function (err, image) {
            Jimp.loadFont('./fonts/bauhaus_65.fnt', function (err, bauhaus) {
                Jimp.loadFont('./fonts/pricedown_95.fnt', function (err, pricedown) {
                    if(image) {
                        image.resize(600, Jimp.AUTO)
                            .cover(600, 337)
                            .print(bauhaus, getTextXMargin(line1, 30), 90, line1)
                            .print(pricedown, getTextXMargin(line2, 39), 120, line2, () => {
                                media.writeImage(image, (f) => callback(f));
                            });
                    } else {
                        callback(undefined);
                    }
                });
            });
        }).catch(function (err) {
            callback(undefined);
        });
    });
}

function downloadImage(uri, callback) {
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        let filename = guid.raw() + ".png";
        request(uri).pipe(fs.createWriteStream(settings.media.temp + filename)).on('close', () => callback(filename));
        media.removeTempImage(filename);
    });
}


function getTextXMargin(text, size) {
    return 300 - ((text.length * size) / 2);
}