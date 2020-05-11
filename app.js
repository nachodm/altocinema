"use strict"

const config = require ("./config/config");
const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
//const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const indexRouter = require('./router/index');
const DAOUsers = require('./DAOs/DAOUsers');
const flash = require('express-flash');
const pool = mysql.createPool(config.mysqlconfig);
const users = new DAOUsers.DAOUsers(pool);
const initializePassport = require('./passport-config');
initializePassport(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser());
app.use(session({
    saveUninitialized: false,    
    secret: "sup3rs4f3",         
    resave: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

require('./router/index.js')(app, passport);

app.listen(config.port, (err) => {
    if (err) {
        console.log("Error al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});

module.exports = app;