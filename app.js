var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const dotenv = require('dotenv')
dotenv.config({ path: './env/holo.env' })

var indexRouter = require('./routes/index');
var ttsRouter = require('./routes/tts');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tts', ttsRouter);

module.exports = app;
