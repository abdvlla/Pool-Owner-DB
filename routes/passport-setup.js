const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);

            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (isPasswordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password Incorrect' });
            }
        } catch (error) {
            console.error('Error:', error);
            return done(error);
        }
    };

    passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
}

module.exports = initialize;