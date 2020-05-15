module.exports = function(app, passport) {
    
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('login')
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
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
    response.render('dashboard', {user: request.user, title: "Inicio"});
  })
  app.get('/festivals', checkAuthenticated, (request, response) => {
    response.render('festivals', {user: request.user, title: "Festivales"});
  })
  app.get('/films', checkAuthenticated, (request, response) => {
    response.render('films', {user: request.user, title: "Películas"});
  })
  app.get('/halls', checkAuthenticated, (request, response) => {
    response.render('halls', {user: request.user, title: "Salas de proyección"});
  })
  app.get('/producers', checkAuthenticated, (request, response) => {
    response.render('producers', {user: request.user, title: "Productores"});
  })
  app.get('/platforms', checkAuthenticated, (request, response) => {
    response.render('platforms', {user: request.user, title: "Plataformas"});
  })
  app.get('/directors', checkAuthenticated, (request, response) => {
    response.render('directors', {user: request.user, title: "Directores"});
  })

  app.get('/profile', checkAuthenticated, (request, response) => {
    response.render('profile', {user: request.user, title: "Perfil de usuario"});
  })

  app.get('/register', checkAuthenticated, (request, response) => {
    response.render('register', {user: request.user, title: "Registro de nuevo usuario"});
  })

  app.get('/settings', checkAuthenticated, (request, response) => {
    response.render('settings', {user: request.user, title: "Ajustes"});
  })
  
  app.get('/prizes', checkAuthenticated, (request, response) => {
    response.render('prizes', {user: request.user, title: "Premio"});
  })

  app.get('/addFilm', checkAuthenticated, (request, response) => {
    response.render('addFilm', {user: request.user, title: "Añadir película"});
  })
  app.get('/addFestival', checkAuthenticated, (request, response) => {
    response.render('addFestival', {user: request.user, title: "Añadir festival"});
  })

  /*app.get('/main', checkAuthenticated, (request, response) => {
    response.render('main');
  })*/

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/logout', (req,res) =>{
    req.logout();
    res.redirect('/');
  })

  app.post('addFilm', )
  
/*app.post("/addFilm", (request, response) => {
  const film = {

  }
  films.newFilm(film, (err) => {
      if (err) {
          request.session.error = err;
          response.redirect("addFilm");
      }
      else {
          response.redirect("films");
      }
  });
});
*/
  app.post('register', async (request, response) => {
    try {
      const hashed = await bcrypt.hash(request.body.password, 10);
      let user = {
          email: request.body.email,
          password: hashed,
          name: request.body.name
      }
      users.newUser(user, (err) => {
          if (!err) {
              response.redirect('/register');
          }
          else {
              console.log(err);
              response.redirect('/register');
          }
      });
    } catch {
        response.redirect('/register');
    }
  })

  app.use((req, res) => {
    res.status(404).render('404'/*, {user: req.user.username}*/);
  });
}