require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport'); // DB 모델 require 전에 추가
require('./app_api/models/db');
require('./app_api/config/passport'); // DB 모델 require 뒤에 추가

const app = express();

const cors = require('cors');

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});


//const indexRouter = require('./app_server/routes/index');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build/browser')));
const usersRouter = require('./app_server/routes/users');
const apiRouter = require('./app_api/routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build/browser')));
app.use(passport.initialize());
//app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.get(/(\/about)|(\/location\/[a-z0-9]{24})/, function (req, res, next) {
  res.sendFile(path.join(__dirname, 'app_public', 'build/browser', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res
      .status(401)
      .json({"message": err.name + ": " + err.message});
  }
});

/* app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, \
      Content-Type, Accept');
    next();
}); */


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
