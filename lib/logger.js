var winston = require('winston');
var fs = require('fs');

if(!fs.existsSync("logs")){
    fs.mkdirSync("logs");
}

module.exports = new winston.Logger({
    transports:[
        new winston.transports.File({
            level: "info",
            filename: "logs/info.log",
            maxsize: 6000,
            maxFiles:10,
            handleExceptions: true,
            humanReadableUnhandleExceptions : true
        }),
        new winston.transports.Console()
    ]
});
