const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) {
            return done(null, false, {message: "Error: User not found."})
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            }
            else {
                return done(null, false, {message: "Error: Password incorrect."});
            }
        } catch (e){
            return done(e);
        }
    }
    passport.use(new LocalStrategy({usernameField:'email'}, authenticateUser))
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser((email, done) => {
        return done(null, getUserByEmail(email))
    })
}
module.exports = initialize