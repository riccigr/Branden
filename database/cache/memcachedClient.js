var memcached = require('memcached');

module.exports = function(){
    return memcachedClient;
}

function memcachedClient(){
    var url = "localhost:11211"
    var client = new memcached(url, {
        retries:10,
        retry: 100000,
        remove: true
    });

    return client;
}
