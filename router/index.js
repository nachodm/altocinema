module.exports = function(app, passport) {

const config = require ("../config/config");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule')
const DAOUsers = require('../DAOs/DAOUsers');
const DAOFilms = require('../DAOs/DAOFilms');
const DAOFestivals = require('../DAOs/DAOFestivals');
const pool = mysql.createPool(config.mysqlconfig);
const users = new DAOUsers.DAOUsers(pool);
const films = new DAOFilms.DAOFilms(pool);
const festivals = new DAOFestivals.DAOFestivals(pool);

let job = schedule.scheduleJob("Preinscription", {minute:30, hour:0, date:1}, function(){
  films.getFilmList((err, films) => {
    if (err) {  
      var datetime = new Date();
      console.log("HUGE ERROR AT " + datetime);
    }
    else {
      festivals.handleMonthPrescriptions(films, (err) => {
        if (err) {
          var datetime = new Date();
          console.log("HUGE ERROR AT " + datetime);
        }
      });
    }
  })
})

    
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
app.get('/services', (request, response) => {
  response.render('services');
})
app.get('/catalogue', (request, response) => {
  response.render('catalogue');
})
app.get('/contact', (request, response) => {
  response.render('contact');
})

app.get('/login', checkNotAuthenticated, (request, response) => {
  response.render('login');
})

app.get('/dashboard', checkAuthenticated, (request, response) => {
  response.render('dashboard', {user: request.user, title: "Inicio"});
})

app.get('/festivals', checkAuthenticated, (request, response) => {
    festivals.getFestivals((err, festivalList) => {
        if (err) {
          request.flash('error', err);
          response.redirect("/dashboard");
        }
        else {
          response.render('festivals', {user: request.user, title: "Festivales", festivals: festivalList});
        }
    });
})

app.get("/festival:=:id", checkAuthenticated, (request, response) => {   
  festivals.getFestival(request.params.id, (err, festival) => {
    if (err) {
      request.flash('error', err);
      response.redirect("/dashboard");
    }
    else {
      response.render('festival', {user: request.user, name: festival.name, festival: festival});
    }
  });
});
 
app.get('/films', checkAuthenticated, (request, response) => {
  films.getFilmList((err, filmsList) => {
    if (err) {
        request.flash('error', err);
        response.redirect("/dashboard");
    }
    else {
      response.render('films', {user: request.user, title: "Películas", films: filmsList});
    }
  });
})

app.get("/film:=:id", checkAuthenticated, (request, response) => {   
  films.getFilm(request.params.id, (err, film) => {
    if (err) {
      request.flash('error', err);
      response.redirect("/dashboard");
    }
    else {
      response.render('film', {user: request.user, title: film.title, film: film});
    }
  });
});


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
  response.render('register', {user: request.user, title: "Registro de nuevo usuario", error:null});
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


app.post("/addFilm", checkAuthenticated, (request, response) => {
const film = [[
    request.body.title,
    request.body.engtitle,
    parseInt(request.body.year),
    request.body.date,
    request.body.color,
    request.body.animationtechnique,
    request.body.originalv,
    request.body.genre,
    parseInt(request.body.duration),
    request.body.country,
    request.body.screen,
    request.body.shootingplace,
    request.body.catalogue,
    request.body.sinopsis,
    request.body.eng_sinopsis,
    request.body.materialslink,
    request.body.link,
    request.body.originalvimeo,
    request.body.englishvimeo,
    request.body.frenchvimeo,
    request.body.italianvimeo,
    request.body.spavimeo,
    request.body.trailer,
    request.body.trailereng,
    request.body.director,
    request.body.script,
    request.body.photography,
    request.body.artistic,
    request.body.soundtrack,
    request.body.montage,
    request.body.producer,
    request.body.animation,
    request.body.sound,
    request.body.interpreter,
    request.body.copiesheader,
    request.body.copiesstreet,
    request.body.copiescp,
    request.body.copiestel,
    request.body.copiescity,
    request.body.copiesprovince,
    request.body.copiescountry
]];

const categories = request.body.categories;

films.newFilm(film, categories, (err) => {
    if (err) {
        request.flash('error', err);
        response.redirect("addFilm");
    }
    else {
        response.redirect("films");
    }
});
});

app.post("/updateFilm", checkAuthenticated, (request, response) => {
  const film = [[
      request.body.title,
      request.body.engtitle,
      parseInt(request.body.year),
      request.body.date,
      request.body.color,
      request.body.animationtechnique,
      request.body.originalv,
      request.body.genre,
      parseInt(request.body.duration),
      request.body.country,
      request.body.screen,
      request.body.shootingplace,
      request.body.catalogue,
      request.body.sinopsis,
      request.body.eng_sinopsis,
      request.body.materialslink,
      request.body.link,
      request.body.originalvimeo,
      request.body.englishvimeo,
      request.body.frenchvimeo,
      request.body.italianvimeo,
      request.body.spavimeo,
      request.body.trailer,
      request.body.trailereng,
      request.body.director,
      request.body.script,
      request.body.photography,
      request.body.artistic,
      request.body.soundtrack,
      request.body.montage,
      request.body.producer,
      request.body.animation,
      request.body.sound,
      request.body.interpreter,
      request.body.copiesheader,
      request.body.copiesstreet,
      request.body.copiescp,
      request.body.copiestel,
      request.body.copiescity,
      request.body.copiesprovince,
      request.body.copiescountry
  ]];

  films.updateFilm(film, request.body.categories, request.body.id, (err) => {
      if (err) {
          request.flash('error', err);
          response.redirect("films");
      }
      else {
          response.redirect("films");
      }
  });
});

app.post("/addFestival", checkAuthenticated, (request, response) => {
  const festival = [[
      request.body.name,
      request.body.ok,
      request.body.init_date,
      request.body.end_date,
      request.body.edition,
      request.body.deadline,
      request.body.type,
      request.body.entryfee,
      request.body.fee,
      request.body.currency,
      request.body.euros,
      request.body.platform,
      request.body.print,
      request.body.prize,
      request.body.contactname,
      request.body.contact_email,
      request.body.programmer,
      request.body.prog_email,
      request.body.contact_tel,
      request.body.contact_web,
      request.body.platformurl,
      request.body.state,
      request.body.contactcountry,
      request.body.language,
      request.body.notes,
      request.body.confirmed,
      request.body.sheet,
      request.body.shortname,
      request.body.header,
      request.body.street,
      request.body.postalcode,
      request.body.city,
      request.body.province,
      request.body.copies_header,
      request.body.copies_street,
      request.body.copies_cp,
      request.body.copies_tel,
      request.body.copies_city,
      request.body.copies_province,
      request.body.copies_country
  ]];

  const categories = request.body.categories;

  festivals.newFestival(festival, categories, (err) => {
      if (err) {
          request.flash('error', err);
          response.redirect("addFestival");
      }
      else {
          response.redirect("festivals");
      }
  });
});

  app.post("/updateFestival", checkAuthenticated, (request, response) => {
  const festival = [[
    request.body.name,
    request.body.ok,
    request.body.init_date,
    request.body.end_date,
    request.body.edition,
    request.body.deadline,
    request.body.type,
    request.body.entryfee,
    request.body.fee,
    request.body.currency,
    request.body.euros,
    request.body.platform,
    request.body.print,
    request.body.prize,
    request.body.contactname,
    request.body.contact_email,
    request.body.programmer,
    request.body.prog_email,
    request.body.contact_tel,
    request.body.contact_web,
    request.body.platformurl,
    request.body.state,
    request.body.contactcountry,
    request.body.language,
    request.body.notes,
    request.body.confirmed,
    request.body.sheet,
    request.body.shortname,
    request.body.header,
    request.body.street,
    request.body.postalcode,
    request.body.city,
    request.body.province,
    request.body.copies_header,
    request.body.copies_street,
    request.body.copies_cp,
    request.body.copies_tel,
    request.body.copies_city,
    request.body.copies_province,
    request.body.copies_country
  ]];

  festivals.updateFestival(festival, request.body.categories, request.body.id, (err) => {
      if (err) {
          request.flash('error', err);
          response.redirect("festivals");
      }
      else {
          response.redirect("festivals");
      }
  });
});

app. post("/register_user", (request, response) => {
    bcrypt.hash(request.body.password, 10, (err, hashed) => {
      if (err) {
        response.render('register', {user: request.user, title: "Registro de nuevo usuario", error: err});
      }
      else {
        let user = {
          email: request.body.email,
          password: hashed,
          name: request.body.name
        }
        users.newUser(user, (err) => {
            if (!err) {
                response.redirect('dashboard');
            }
            else {
              response.redirect('register');
            }
        });
      }
    });
})

app.use((req, res) => {
  res.status(404).render('404');
});
}