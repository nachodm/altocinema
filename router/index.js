module.exports = function(app, passport) {
    
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

  app.get('/', (request, response) => {
    response.render('altocinema');
  })

  app.get('/login', checkNotAuthenticated, (request, response) => {
    response.render('login');
  })

  app.get('/dashboard', checkAuthenticated, (request, response) => {
    response.render('dashboard');
  })
  app.get('/festivals', checkAuthenticated, (request, response) => {
    response.render('festivals');
  })
  app.get('/films', checkAuthenticated, (request, response) => {
    response.render('films');
  })
  app.get('/halls', checkAuthenticated, (request, response) => {
    response.render('halls');
  })
  app.get('/producers', checkAuthenticated, (request, response) => {
    response.render('producers');
  })
  app.get('/platforms', checkAuthenticated, (request, response) => {
    response.render('platforms');
  })
  app.get('/directors', checkAuthenticated, (request, response) => {
    response.render('directors');
  })

  app.get('/settings', checkAuthenticated, (request, response) => {
    response.render('settings');
  })

  /*app.get('/main', checkAuthenticated, (request, response) => {
    response.render('main');
  })*/

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/logout', (req,res) =>{
    req.logout();
    res.redirect('/');
  })

  app.post('register', async (request, response) => {
    try {
      const hashed = await bcrypt.hash(request.body.password, 10);
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
    res.status(404).render('404'/*, {user: req.user.username}*/);
  });
}