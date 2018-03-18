module.exports = (app) => {

    var api = app.api.correios;
    
    app.post('/correios/deadline', api.deadline);
}
