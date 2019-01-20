var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var path = require('path');
mongoose.Promise = global.Promise;
global.constants = require('./Config/constants');
global.middleware = require('./Middlewares/CommonMiddlewares');

var db = require('./Config/database');
db.databaseConnection(mongoose);

var app = express();
// get our request parameters

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: false, parameterLimit: 50000 }));
app.use(function(err, req, res, next) {
    // error handling logic
    res.send({
        status: false,
        message: "Something went wrong : " + err,
        data: {}
    });
});


app.use("/public", express.static(path.join(__dirname, 'public')));
var apiRoutes = express.Router();

// pass passport for configuration
require('./Config/passport')(passport);
app.use(passport.initialize());
require('./routes/routes')(apiRoutes);
app.use('/api', apiRoutes);
app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000));
});