var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var morgan = require('morgan');
var logger = require('../lib/logger')

module.exports = function(){
    var app = express();

    app.use(morgan("common", {
        stream:{
            write : function(message){
                logger.info(message);
            }
        }
    }));

    app.use(bodyParser.json());
    app.use(expressValidator());

    //--TODO review folder structure
    consign()
        .include('api')
        .then('routes')
        .then('database')
        .then('services')
        .into(app);

    return app;
};
