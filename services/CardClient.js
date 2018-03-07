var restifyClients = require('restify-clients');

function cardClient(){
    this._client = restifyClients.createJsonClient({
        url: 'http://localhost:3001',
        requestTimeout: 5000,
        connectTimeout: 5000
    });
}

cardClient.prototype.authorize = function(card, callback){
    console.log('posting to card auth');
    this._client.post('/cartoes/autoriza', card, callback);
}


module.exports = function(){
    return cardClient;
}
