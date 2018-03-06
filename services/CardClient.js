var restifyClients = require('restify-clients');

function CardClient(){
    this._client = restifyClients.createJsonClient({
        url: 'http://localhost:3001',
        version: '~1.0'
    });
}

CardClient.prototype.authorize = function(card, callback){
    console.log('posting to card auth');
    this._client.post('/cartoes/autoriza', card, callback);
}


module.exports = function(){
    return CardClient;
}
