module.exports = function(app){
    app.get('/payments', function(req, res){
        res.send('OK');
    });

    app.post('/payments', function(req, res){

        console.log('request received')

        req.assert('method', 'method is mandatory').notEmpty();
        req.assert('currency', 'currency is mandatory').notEmpty();
        req.assert('value', 'value is mandatory and must be a decimal.').notEmpty().isFloat;

        var errors = req.validationErrors();
        if(errors){
            console.log('Client error ===============>' + errors);
            res.status(400).send(errors);
            return;
        }

        var payment = req.body;

        payment.status = 'created';
        payment.create_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.save(payment, function(err, result){
            if(err){
                console.log('Internal Error #########' + err);
                res.status(500).send('Internal error, please contact support team.');
            }

            console.log('request saved');
            res.location('/payments/' + result.insertId);
            res.status(201).json(payment);
        });

        connection.end();
    });
};
