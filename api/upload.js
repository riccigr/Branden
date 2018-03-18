var fs = require('fs');

module.exports = (app) => {

    var api = {};

    api.upload = (req, res) => {
        console.log('upload received');

        var filename = req.headers.filename;

        console.log(filename);

        req.pipe(fs.createWriteStream('files/' + filename))
            .on('finish', function(){
                res.status(201).send();
                console.log('upload ok');
            });
    };

    return api;
}
