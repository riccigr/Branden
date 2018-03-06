var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

module.exports = function(){
    var app = express();

    app.use(bodyParser.json());
    app.use(expressValidator());

    consign()
        .include('routes')
        .then('database')
        .then('services')
        .into(app);

    return app;
};
