var mysql = require('mysql');

function createDbConnection(){

    if(process.env.NODE_ENV === 'production'){
        var url = process.env.CLEARDB_DATABASE_URL;
        var groups = url.match(/mysql:\/\/(.*):(.*)@(.*)\/(.*)\?/);
        return mysql.createConnection({
            host : groups[3],
            user : groups[1],
            password : groups[2],
            database : groups[4]
        });
    }

    if(!process.env.NODE_ENV || process.env.NODE_ENV === 'dev'){
        return mysql.createConnection({
            host : "localhost",
            user : "root",
            password : "root",
            database : "payfast"
        });
    }

    if(process.env.NODE_ENV === 'test'){
        return mysql.createConnection({
            host : "localhost",
            user : "root",
            password : "root",
            database : "payfast_test"
        });
    }

}

//wrapper
module.exports = function(){
    return createDbConnection;
}
