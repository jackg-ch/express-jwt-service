var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');
    dotenv = require('dotenv').config();
    cors = require('cors');

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

// initialize passport
app.use(passport.initialize());

var corsOption = {
  origin: [process.env.FRONTEND_SERVER, process.env.GITHUB_CALLBACK_URL],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['Content-type', 'Authorization']
};
app.use(cors(corsOption));

// app.use(session({ secret: 'userdatasecret', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(`${process.env.MONGODB_URI}/authcollection`)
  .catch(error => {
    console.log(`Mongoose failed to connect to ${process.env.MONGODB_URI}`);
    console.log(error);
  });
} else {
  mongoose.connect(`${process.env.MONGODB_URI}/authcollection`)
  .catch(error => {
    console.log(`Mongoose failed to connect to ${process.env.MONGODB_URI}`);
    console.log(error);
  });;  // 'mongodb://localhost/authcollection'
  mongoose.set('debug', true);
}


// Routes and Models
require('./models/user-model');
require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 4000, function(){
  console.log('Listening on port ' + server.address().port);
});
