module.exports = function(app){

    app.get('/payments/:id', function(req, res){
        console.log('search received...');

        var id = req.params.id;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.getById(id, function(err, result){
            if(err){
                console.error(err);
                res.status(500).send('Internal error, please contact support team.');
                return;
            }
            if(Object.keys(result).length === 0){
                console.log('404 for this search');
                res.status(404).send();
                return;
            }


            console.log('search ok!');
            res.send(result);
        });

    });

    app.post('/payments', function(req, res){

        console.log('request received...');

        req.assert('payment.method', 'method is mandatory').notEmpty();
        req.assert('payment.currency', 'currency is mandatory').notEmpty().len(3,3);
        req.assert('payment.value', 'value is mandatory and must be a decimal.').notEmpty().isFloat;

        var errors = req.validationErrors();
        if(errors){
            console.log('Client error ===============>' + errors);
            res.status(400).send(errors);
            return;
        }

        var payment = req.body["payment"];

        payment.status = 'CREATED';
        payment.create_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.save(payment, function(err, result){
            if(err){
                console.log('Internal Error #########' + err);
                res.status(500).send('Internal error, please contact support team.');
                return;
            }

            payment.id = result.insertId;
            res.location('/payments/' + payment.id);

            console.log('request saved');

            if(payment.method == "card"){
                console.log('request contains card');

                var card = req.body["card"];
                var cardClient = new app.services.CardClient();

                cardClient.authorize(card, function(cardError, cardReq, cardRes, cardResult){
                    if(cardError){
                        console.log(cardError);
                        res.status(400).send(cardError);
                        return;
                    }
                    var response = {
                        "payment" : payment,
                        "card" : cardResult,
                        links : [
                            {
                                "href": "http://localhost:3000/payments/" + payment.id,
                                "rel": "Confirmation",
                                "method": "PUT"
                            },
                            {
                                "href": "http://localhost:3000/payments/" + payment.id,
                                "rel": "Cancellation",
                                "method": "DELETE"
                            }
                        ]
                    };

                    res.status(201).json(response);
                    return;
                });


            }else{
                console.log('commom request');
                var response = {
                    "payment" : payment,
                    links : [
                        {
                            "href": "http://localhost:3000/payments/" + payment.id,
                            "rel": "Confirmation",
                            "method": "PUT"
                        },
                        {
                            "href": "http://localhost:3000/payments/" + payment.id,
                            "rel": "Cancellation",
                            "method": "DELETE"
                        }
                    ]
                };

                res.status(201).json(response);
            }

        });

        connection.end();
    });

    app.put('/payments/:id', function(req, res){

        console.log('update received');

        var payment = {};
        var id = req.params.id;

        payment.status = 'CONFIRMED';
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                console.log('Internal Error #########' + err);
                res.status(500).send('Internal error, please contact support team.');
                return;
            }

            console.log('update saved');
            res.json(payment);
        });

        connection.end();

    });

    app.delete('/payments/:id', function(req, res){

        console.log('delete received');

        var payment = {};
        var id = req.params.id;

        payment.status = 'CANCELED';
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                console.log('Internal Error #########' + err);
                res.status(500).send('Internal error, please contact support team.');
                return;
            }

            console.log('update saved');
            res.status(204).json(payment);
        });

        connection.end();

    });
};
