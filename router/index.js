const { request } = require("express");
const flash = require("express-flash");
const DAODirectors = require("../DAOs/DAODirectors");

module.exports = function(app, passport) {

const config = require ("../config/config");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const DAOUsers = require('../DAOs/DAOUsers');
const DAOFilms = require('../DAOs/DAOFilms');
const DAOFestivals = require('../DAOs/DAOFestivals');
const DAODirectors = require('../DAOs/DAODirectors');
const pool = mysql.createPool(config.mysqlconfig);
const users = new DAOUsers.DAOUsers(pool);
const films = new DAOFilms.DAOFilms(pool);
const festivals = new DAOFestivals.DAOFestivals(pool);
const directors = new DAODirectors.DAODirectors(pool);

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

app.post('/sendEmail', (request, response) => {
  let transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 465,
    auth: {
      user: 'info@altocinema.com',
      pass: 'Altocine2020'
    }
  });
  let mailOptions = {
    from: request.body.email,
    to: 'info@altocinema.com',
    subject: request.body.name,
    text: request.body.text
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      request.flash('error', 'En estos momentos estamos teniendo problemas. Por favor, vuelva a intentarlo más tarde.');
      response.redirect('/contact');
    }
    else {
      request.flash('succcess', "Muchas gracias por tu correo, te responderemos lo más rápidamente posible.");
      response.redirect('/contact');
    }
  })
})

app.get('/', (request, response) => {
  response.render('altocinema');
})
app.get('/services', (request, response) => {
  response.render('services');
})
app.get('/catalogue', (request, response) => {
  response.render('catalogue');
})
app.get('/comingOutCinema', (request, response) => {
  response.render('comingOutCinema');
})
app.get('/nouvelleCinema', (request, response) => {
  response.render('nouvelleCinema');
})
app.get('/contact', (request, response) => {
  response.render('contact', {success: request.flash('success'), error: request.flash('error') });
})

app.get('/login', checkNotAuthenticated, (request, response) => {
  response.render('login');
})

app.get('/dashboard', checkAuthenticated, (request, response) => {
  response.render('dashboard', {user: request.user, title: "Inicio", success: request.flash('success'), error: request.flash('error')});
})

app.get('/festivals', checkAuthenticated, (request, response) => {
    festivals.getFestivals((err, festivalList) => {
        if (err) {
          request.flash('error', err.message);
          response.redirect("/dashboard");
        }
        else {
          response.render('festivals', {user: request.user, title: "Festivales", festivals: festivalList, error: request.flash('error')});
        }
    });
})

app.get("/festival:=:id", checkAuthenticated, (request, response) => {   
  festivals.getFestival(request.params.id, (err, festival) => {
    if (err) {
      request.flash('error', err.message);
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
        request.flash('error', err.message);
        response.redirect("/dashboard");
    }
    else {
      response.render('films', {user: request.user, title: "Películas", films: filmsList, error: request.flash('error')});
    }
  });
})

app.get("/film:=:id", checkAuthenticated, (request, response) => {   
  films.getFilm(request.params.id, (err, film) => {
    if (err) {
      request.flash('error', err.message);
      response.redirect("/dashboard");
    }
    else {
      response.render('film', {user: request.user, title: film.title, film: film});
    }
  });
});

app.get('/producers', checkAuthenticated, (request, response) => {
  films.getProducerList((err, producers) => {
    if (err) {
        request.flash('error', err.message);
        response.redirect("/dashboard");
    }
    else {
      response.render('producers', {user: request.user, title: "Productores", producers: producers});
    }
  });
})
  
app.get('/platforms', checkAuthenticated, (request, response) => {
  response.render('platforms', {user: request.user, title: "Plataformas"});
})

app.get('/directors', checkAuthenticated, (request, response) => {
  directors.getDirectors((err, directors) => {
    if (err) {
      request.flash('error', err.message);
      response.redirect('/dashboard');
    }
    else {
      response.render('directors', {user: request.user, title: "Directores", directors: directors, success: request.flash('success'), error: request.flash('error')});
    }
  })
})

app.get("/director:=:id", checkAuthenticated, (request, response) => {   
  directors.getDirector(request.params.id, (err, director) => {
    if (err) {
      request.flash('error', err.message);
      response.redirect("/dashboard");
    }
    else {
      response.render('director', {user: request.user, title: director.fullname, director: director, error: request.flash('error')});
    }
  });
});

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
  response.render('addFilm', {user: request.user, title: "Añadir película", error: request.flash('error')});
})

app.get('/addFestival', checkAuthenticated, (request, response) => {
  response.render('addFestival', {user: request.user, title: "Añadir festival", error: request.flash('error')});
})

app.get('/addDirector', checkAuthenticated, (request, response) => {
  response.render('addDirector', {user: request.user, title: "Añadir direcror", error: request.flash('error') })
})

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
    request.body.copiescountry,
    request.body.addcatalogue
]];

const categories = request.body.categories;

films.newFilm(film, categories, (err) => {
    if (err) {
        request.flash('error', err.message);
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
      request.body.copiescountry,
      request.body.catalogue
  ]];

  films.updateFilm(film, request.body.categories, request.body.id, (err) => {
      if (err) {
          request.flash('error', err.message);
          response.redirect("films");
      }
      else {
          response.redirect("films");
      }
  });
});

app.post("/addFestival", checkAuthenticated, (request, response) => {
  let auxdate = new Date();
  let modif = "Modificado el " + auxdate + " por " +  request.user.name;
  const festival = [[
      request.body.festival_id,
      request.body.name,
      request.body.ok,
      request.body.init_date,
      request.body.end_date,
      request.body.edition,
      request.body.year,
      request.body.deadline,
      request.body.type,
      request.body.entryfee,
      request.body.fee,
      request.body.currency,
      request.body.euros,
      request.body.platform,
      request.body.prize,
      request.body.waiver,
      request.body.disc,
      request.body.final,
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
      request.body.copies_country,
      modif
  ]];

  const categories = request.body.categories;

  festivals.newFestival(festival, categories, (err) => {
      if (err) {
          request.flash('error', err.message);
          response.redirect("addFestival");
      }
      else {
          response.redirect("festivals");
      }
  });
});

app.post("/updateFestival", checkAuthenticated, (request, response) => {
  let auxdate = new Date();
  let modif = "Modificado el " + auxdate + " por " +  request.user.name;
  const festival = [[
      request.body.festival_id,
      request.body.name,
      request.body.ok,
      request.body.init_date,
      request.body.end_date,
      request.body.edition,
      request.body.year,
      request.body.deadline,
      request.body.type,
      request.body.entryfee,
      request.body.fee,
      request.body.currency,
      request.body.euros,
      request.body.platform,
      request.body.prize,
      request.body.waiver,
      request.body.disc,
      request.body.final,
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
      request.body.copies_country,
      modif
  ]];

  festivals.updateFestival(festival, request.body.categories, request.body.id, (err) => {
      if (err) {
          request.flash('error', err.message);
          response.redirect("festivals");
      }
      else {
          response.redirect("festivals");
      }
  });
});

app.post("/addDirector", checkAuthenticated, (request, response) => {
  let auxdate = new Date();
  let modif = "Modificado el " + auxdate + " por " +  request.user.name;
  const director = [[
      request.body.fullname,
      request.body.name,
      request.body.surname,
      request.body.email,
      request.body.phone,
      request.body.birth_city,
      request.body.home_city,
      request.body.DNI,
      request.body.birthdate,
      request.body.age,
      request.body.esp_bio,
      request.body.eng_bio,
      modif
  ]];
  
  directors.newDirector(director, (err) => {
      if (err) {
          request.flash('error', err.message);
          response.redirect("addDirector");
      }
      else {
          request.flash('success', "Guardado.");
          response.redirect("/directors");
      }
  });
});
  
app.post("/updateDirector", checkAuthenticated, (request, response) => {
  let auxdate = new Date();
  let modif = "Modificado el " + auxdate + " por " +  request.user.name;
  const director = [[
      request.body.fullname,
      request.body.name,
      request.body.surname,
      request.body.email,
      request.body.phone,
      request.body.birth_city,
      request.body.home_city,
      request.body.DNI,
      request.body.birthdate,
      request.body.age,
      request.body.esp_bio,
      request.body.eng_bio,
      modif
  ]];
  
    directors.updateDirector(director, request.body.id, (err) => {
        if (err) {
            request.flash('error', err.message);
            response.redirect("directors");
        }
        else {
            request.flash('success', "Director modificado correctamente en la base de datos.");
            response.redirect("directors");
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

app.use(function(req, res, next){
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res) => {
  res.status(404).render('404');
});
}