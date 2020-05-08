const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

const config = require ("./config/config");
const mysql = require('mysql');
const DAOUsers = require('./DAOs/DAOUsers');
const pool = mysql.createPool(config.mysqlconfig);
const users = new DAOUsers.DAOUsers(pool);
function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        let user;
        const connection = mysql.createConnection(config.mysqlconfig);

        connection.query("SELECT * FROM users WHERE email = ?",
        [email],
        (err, rows) => {
            if (err) {return null;}
            else {
                if (rows.length > 0) {
                    user = {
                        email: rows[0].email, 
                        name: rows[0].name, 
                        password: rows[0].pass,
                    }
                }
            }
            if (user == null) {
                return done(null, false, {message: "Error: Usuario no encontrado."})
            }
    
            try {
                if (bcrypt.compareSync(password, user.password)) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {message: "Error: Contraseña incorrecta."});
                }
            } catch (e){
                return done(e);
            }
        });
        connection.end();
    }
    passport.use(new LocalStrategy({usernameField:'email'}, authenticateUser))
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser((email, done) => {
        const connection = mysql.createConnection(config.mysqlconfig);

        connection.query("SELECT * FROM users WHERE email = ? ", 
        [email],
            (err, rows) => {
            done(err, rows[0]);
        });
        connection.end();
    })
}
module.exports = initialize