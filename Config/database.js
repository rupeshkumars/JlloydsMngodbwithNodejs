// config/database.js
module.exports = {
    databaseConnection: function(mongoose) {
        var url = "mongodb://localhost:27017/Jloyds";
        mongoose.connect(url, {
            useCreateIndex: true,
            useNewUrlParser: true
        });
        console.log(mongoose.connection.readyState);
        // CONNECTION EVENTS
        mongoose.connection.on('connecting', function() {
            console.log('Mongoose default connection open to ' + url);
        });
        // When successfully connected
        mongoose.connection.on('connected', function() {

            console.log('Mongoose default connected open to ' + url);
        });

        // If the connection throws an error
        mongoose.connection.on('error', function(err) {
            console.log('Mongoose default connection error: ' + err);
        });
        // When the connection is disconnected
        mongoose.connection.on('disconnected', function() {
            console.log('Mongoose default connection disconnected');
        });
    }

};