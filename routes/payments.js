

module.exports = function(app){

    var api = app.api.payments;

    app.get('/payments/:id', api.findTransaction);

    app.post('/payments', api.create);

    app.put('/payments/:id', api.confirm);

    app.delete('/payments/:id', api.cancel);
};
