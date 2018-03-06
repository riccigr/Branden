var soap = require('soap');

function CorreiosSoapClient(){
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}

CorreiosSoapClient.prototype.calcDeadline = function(args, callback){
    soap.createClient(this._url, function(err, client) {
        console.log('post to soap correios dealine');
        client.CalcPrazo(args, callback);
    });
}


module.exports = function(){
    return CorreiosSoapClient;
}
