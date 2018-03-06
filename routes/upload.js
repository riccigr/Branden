var fs = require('fs');

module.exports = function(app){

    app.post('/upload/receipt', function(req, res) {
        console.log('upload received');

        var filename = req.headers.filename;

        console.log(filename);

        req.pipe(fs.createWriteStream('files/' + filename))
            .on('finish', function(){
                res.status(201).send();
                console.log('upload ok');
            })

    });
}
