module.exports = function(app){
    app.get('/payfast/pay', function(req, res){
        res.send('OK');
    });

    app.post('/payfast/pay', function(req, res){

        console.log('request received')

        var payment = req.body;

        payment.status = 'created';
        payment.create_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.save(payment, function(err, result){
            if(err){
                console.log('Error #########' + err);
                res.status(400).send('Error');
            }

            console.log('request saved');
            res.json(payment);
        });

        connection.end();
    });
};
