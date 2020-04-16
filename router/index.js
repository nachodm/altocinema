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

  app.get('/home', checkAuthenticated, (request, response) => {
    response.render('home');
  })

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
    res.status(404).render('dashboard');
  });
}