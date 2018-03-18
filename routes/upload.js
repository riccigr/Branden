module.exports = function(app){

    var api = app.api.upload;
    app.post('/upload/receipt', api.upload);
}
