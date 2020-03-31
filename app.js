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
const userarray = [{email: "antonio@test.es", password: "ejemplo"}];
const initializePassport = require('./passport-config');
initializePassport(
    passport, 
    email => {
        userarray.find(user => user.email === email)
    }
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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



function getUser(email) {
    users.userExists(email, (user) => {
        return user;
    });
}
/*const middlewareSession = session({
    saveUninitialized: false,     
    secret: "foobar34",              
    resave: false 
}); 
app.use(middlewareSession); */


//app.use('/', indexRouter);

// catch 404 and forward to error handler
/*app.use((req, res) => {
  res.status(404).render('error');
});

app.get('/', (request, response) => {
    response.render('login');
});*/

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.get('/login', checkNotAuthenticated, (request, response) => {
    response.render('login');
})

app.get('/', checkAuthenticated, (request, response) => {
    response.render('home');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: 'home',
    failureRedirect: '/',
    failureFlash: true
}))

app.post('register', async (request, response) => {
    try {
        const hashed = await bcrypt.hash(request.body.password, 12);
        let user = {
            email: request.body.email,
            password: hashed,
            name: "Antonio"
        }
        users.newUser(user, (err) => {
            if (!err) {
                response.redirect('/');
            }
            else {
                console.log(err);
                response.redirect('/');
            }
        });
    } catch {
        response.redirect('/');
    }
})

app.use((req, res) => {
    res.status(404).send('error');
});


app.listen(config.port, (err) => {
    if (err) {
        console.log("Error al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});

module.exports = app;
