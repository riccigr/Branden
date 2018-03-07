var constants = require('../lib/constants');

module.exports = function(app){

    app.get('/payments/:id', function(req, res){
        console.log('search received...');

        var id = req.params.id;
        var cache = app.database.cache.memcachedClient();

        cache.get('payment-' + id, function(cacheErr, cacheResult){
            if(cacheErr || !cacheResult){
                console.log('MISS - ' + id);
                console.log('going to database...');

                var connection = app.database.connectionFactory();
                var paymentDao = new app.database.PaymentDAO(connection);

                paymentDao.getById(id, function(err, result){
                    if(err){
                        console.error(err);
                        res.status(500).send(constants.INTERNAL_ERROR_MSG);
                        return;
                    }
                    if(Object.keys(result).length === 0){
                        console.log('Could not find this item: ' + id );
                        res.status(404).send();
                        return;
                    }

                    console.log('search ok!');
                    res.json(result);
                });
            }else{
                console.log('HIT - ' + id + ' ===>' + JSON.stringify(cacheResult));
                res.json(cacheResult);
                return;
            }
        });
    });


    app.post('/payments', function(req, res){
        console.log('request received...');

        req.assert('payment.method', 'method is mandatory').notEmpty();
        req.assert('payment.currency', 'currency is mandatory').notEmpty().len(3,3);
        req.assert('payment.value', 'value is mandatory and must be a decimal.').notEmpty().isFloat;

        var errors = req.validationErrors();
        if(errors){
            console.error(constants.CLIENT_ERROR_LOG + errors);
            res.status(400).send(errors);
            return;
        }

        var payment = req.body["payment"];

        payment.status = constants.STATUS_CREATED;
        payment.create_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.save(payment, function(err, result){
            if(err){
                console.error(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            payment.id = result.insertId;
            res.location('/payments/' + payment.id);

            var cache = app.database.cache.memcachedClient();
            cache.set('payment-' + payment.id, req.body, 100000, function(cacheError) {
                if(cacheError){
                    console.error(cacheError);
                }else{
                    console.log('new key - ' + payment.id);
                }
            });

            var response = {
                "payment" : payment,
                "links" : [
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

            if(payment.method == "card"){
                console.log('request contains card');

                var card = req.body["card"];
                var cardClient = new app.services.cardClient();

                cardClient.authorize(card, function(cardError, cardReq, cardRes, cardResult){
                    if(cardError){
                        console.log(cardError);
                        res.status(400).send(cardError);
                        return;
                    }
                    response.card = cardResult;

                    res.status(201).json(response);
                });
            }

        });
        console.log('request saved!');
        connection.end();
    });

    app.put('/payments/:id', function(req, res){

        console.log('update received');

        var payment = {};
        var id = req.params.id;

        payment.status = constants.STATUS_CONFIRMED;
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                console.error(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            console.log('update saved');
            res.json(payment);
        });

        connection.end();

    });

    app.delete('/payments/:id', function(req, res){

        console.log('delete received...');

        var payment = {};
        var id = req.params.id;

        payment.status = constants.STATUS_CANCELLED;
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                console.error(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            console.log('update saved!');
            res.status(204).json(payment);
        });

        connection.end();

    });
};
