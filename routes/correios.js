module.exports = (app) => {
    app.post('/correios/deadline', (req, res) => {
        var data = req.body;

        var correiosSoapClient = new app.services.CorreiosSoapClient();
        correiosSoapClient.calcDeadline(data, (err, result) => {
            if(err){
                console.log(err);
                res.status(500).send(err);
                return;
            }

            console.log('deadline calculated');
            res.json(result);
        });
    });
}
