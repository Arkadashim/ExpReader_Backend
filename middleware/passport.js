const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('../config/config.json').jwt;
var models = require('../models'); 
var User = models.User; 


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys,
}

module.exports = passport => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                const _user = await User.findByPk(payload.userId);

                if (_user) {
                    done(null, _user);
                } else {
                    done(null, false);
                }
            } catch(e) {
                console.log(e);
            }
        })
    )
}