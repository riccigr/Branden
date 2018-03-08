var memcached = require('memcached');

module.exports = function(){
    return memcachedClient;
}

function memcachedClient(){
    var url = "localhost:11211"
    var client = new memcached(url, {
        retries:1,
        retry: 500,
        timeout: 500,
        remove: true
    });

    return client;
}
