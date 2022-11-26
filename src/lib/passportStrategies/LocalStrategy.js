import LocalStrategy from 'passport-local';

const getLocalStrategy = (app) => new LocalStrategy({ usernameField: 'data[email]', passwordField: 'data[password]' }, async (email, password, done) => {
  const user = await app.objection.models.user.query().findOne({ email });
  if (user && user.verifyPassword(password)) {
    return done(null, user);
  }
  return done(null, false);
});

export default getLocalStrategy;
