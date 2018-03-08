var constants = require('../lib/constants');
var logger = require('../lib/logger');

module.exports = function(app){

    app.get('/payments/:id', function(req, res){
        logger.info('search received...');

        var id = req.params.id;
        var cache = app.database.cache.memcachedClient();

        cache.get('payment-' + id, function(cacheErr, cacheResult){
            if(cacheErr || !cacheResult){
                logger.info('MISS - ' + id);
                logger.info('going to database...');

                var connection = app.database.connectionFactory();
                var paymentDao = new app.database.PaymentDAO(connection);

                paymentDao.getById(id, function(err, result){
                    if(err){
                        logger.info(err);
                        res.status(500).send(constants.INTERNAL_ERROR_MSG);
                        return;
                    }
                    if(Object.keys(result).length === 0){
                        logger.info('Could not find this item: ' + id );
                        res.status(404).send();
                        return;
                    }

                    logger.info('search ok!');
                    res.json(result);
                });
            }else{
                logger.info('HIT - ' + id + ' ===>' + JSON.stringify(cacheResult));
                res.json(cacheResult);
                return;
            }
        });
    });


    app.post('/payments', function(req, res){
        logger.info('request received...');

        req.assert('payment.method', 'method is mandatory').notEmpty();
        req.assert('payment.currency', 'currency is mandatory').notEmpty().len(3,3);
        req.assert('payment.value', 'value is mandatory and must be a decimal.').notEmpty().isFloat;

        var errors = req.validationErrors();
        if(errors){
            logger.info(constants.CLIENT_ERROR_LOG + errors);
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
                logger.info(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            payment.id = result.insertId;
            res.location('/payments/' + payment.id);

            var cache = app.database.cache.memcachedClient();
            cache.set('payment-' + payment.id, req.body, 100000, function(cacheError) {
                if(cacheError){
                    logger.info(cacheError);
                }else{
                    logger.info('new key - ' + payment.id);
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
                logger.info('request contains card');

                var card = req.body["card"];
                var cardClient = new app.services.cardClient();

                cardClient.authorize(card, function(cardError, cardReq, cardRes, cardResult){
                    if(cardError){
                        logger.info(cardError);
                        res.status(400).send(cardError);
                        return;
                    }
                    response.card = cardResult;


                });
            }

            logger.info('request saved!');
            res.status(201).json(response);
        });

        connection.end();
    });

    app.put('/payments/:id', function(req, res){

        logger.info('update received');

        var payment = {};
        var id = req.params.id;

        payment.status = constants.STATUS_CONFIRMED;
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                logger.info(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            logger.info('update saved');
            res.json(payment);
        });

        connection.end();

    });

    app.delete('/payments/:id', function(req, res){

        logger.info('delete received...');

        var payment = {};
        var id = req.params.id;

        payment.status = constants.STATUS_CANCELLED;
        payment.id = id;
        payment.update_date = new Date;

        var connection = app.database.connectionFactory();
        var paymentDao = new app.database.PaymentDAO(connection);

        paymentDao.update(payment, function(err, result){
            if(err){
                logger.info(constants.INTERNAL_ERROR_LOG + err);
                res.status(500).send(constants.INTERNAL_ERROR_MSG);
                return;
            }

            logger.info('update saved!');
            res.status(204).json(payment);
        });

        connection.end();

    });
};
