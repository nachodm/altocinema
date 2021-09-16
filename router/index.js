module.exports = function (app, passport) {
    const config = require('../config/config')
    const mysql = require('mysql')
    const bcrypt = require('bcrypt')
    const schedule = require('node-schedule')
    const nodemailer = require('nodemailer')
    const DAOUsers = require('../DAOs/DAOUsers')
    const DAOFilms = require('../DAOs/DAOFilms')
    const DAOFestivals = require('../DAOs/DAOFestivals')
    const DAODirectors = require('../DAOs/DAODirectors')
    const DAOProducers = require('../DAOs/DAOProducers')
    const DAOPreinsc = require('../DAOs/DAOPreinsc')
    const waiverTemplate = require('../services/waiveremail')
    const pool = mysql.createPool(config.mysqlconfig)
    const users = new DAOUsers.DAOUsers(pool)
    const films = new DAOFilms.DAOFilms(pool)
    const festivals = new DAOFestivals.DAOFestivals(pool)
    const directors = new DAODirectors.DAODirectors(pool)
    const producers = new DAOProducers.DAOProducers(pool)
    const preinscr = new DAOPreinsc.DAOPreinsc(pool)

    let job = schedule.scheduleJob('0 0 1 * *', function () {
        preinscr.handleMonthPreinscriptions((err, preinscriptions) => {
            var datetime = new Date()
            if (err) {
                console.log('RUNTIME ERROR AT ' + datetime)
            } else {
                console.log(datetime + ' correct. Preinscriptions: ' + preinscriptions)
            }
        })
    })

    let duplicity = schedule.scheduleJob({ hour: 23, minute: 00 }, function () {
        festivals.handleDuplicities((err, festivals) => {
            var datetime = new Date()
            if (err) {
                console.log('RUNTIME ERROR AT ' + datetime)
            } else {
                console.log(datetime + ' correct. Duplicities: ' + festivals)
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
            return res.redirect('/dashboard')
        }
        next()
    }

    app.post('/preinscription', (request, response) => {
        preinscr.handleMonthPreinscriptions((err, preinscriptions) => {
            var datetime = new Date()
            if (err) {
                console.log(err)
                request.flash('error', 'RUNTIME ERROR AT ' + datetime + ':' + '\n' + err)
                response.redirect('dashboard')
            } else {
                console.log(preinscriptions)
                request.flash(
                    'success',
                    'Preinscripción realizada correctamente.' + JSON.stringify(preinscriptions)
                )
                response.redirect('dashboard')
            }
        })
    })

    app.post('/handleDuplicities', (request, response) => {
        festivals.handleDuplicities((err, festivals) => {
            var datetime = new Date()
            if (err) {
                console.log(err)
                request.flash('error', 'RUNTIME ERROR AT ' + datetime + ':' + '\n' + err)
                response.redirect('dashboard')
            } else {
                console.log(festivals)
                request.flash('success', 'Duplicidades generadas correctamente: ' + JSON.stringify(festivals))
                response.redirect('dashboard')
            }
        })
    })

    app.post('/sendMonthlyEmails', async (request, response) => {
        const Excel = require('exceljs')
        const filename = 'Debtors.xlsx'
        let workbook = new Excel.Workbook()
        let worksheet = workbook.addWorksheet('Debtors')
        worksheet.columns = [
            { header: 'Festival', key: 'festival' },
            { header: 'Entry fee', key: 'entryFee' },
            { header: 'Website', key: 'web' },
            { header: 'Payments Made', key: 'paymentsMade' },
        ]
        let data = [
            {
                festival: 'Cannes',
                entryFee: '70€',
                web: 'www.cannes.com',
                paymentsMade: 0,
            },
            {
                festival: 'San Sebastián',
                entryFee: '30€',
                web: 'wwww.donosti.com',
                paymentsMade: 15,
            },
        ]
        data.forEach((e) => {
            worksheet.addRow(e)
        })
        const buffer = await workbook.xlsx.writeBuffer()
        const transporter = nodemailer.createTransport({
            host: 'altocinema.com',
            port: 465,
            secure: true,
            auth: {
                user: 'contact@altocinema.com',
                pass: 'Altocine2020',
            },
        })
        const mailOptions = {
            from: 'info@altocinema.com',
            to: ['acjdistribucion@gmail.com'],
            subject: 'TEST EMAIL',
            html: 'content',
            attachments: [
                {
                    filename,
                    content: buffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            ],
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
                request.flash('error', 'Mierda, algo ha fallado.')
                response.redirect('dashboard')
            } else {
                console.log(info)
                request.flash('success', 'Correos enviados satisfactoriamente')
                response.redirect('dashboard')
            }
        })
    })

    app.post('/sendEmail', (request, response) => {
        let transporter = nodemailer.createTransport({
            host: 'altocinema.com',
            port: 465,
            secure: true,
            auth: {
                user: 'contact@altocinema.com',
                pass: 'Altocine2020',
            },
        })
        let mailOptions = {
            from: 'contact@altocinema.com',
            to: 'info@altocinema.com',
            subject: request.body.name + ': ' + request.body.email,
            text: request.body.text,
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
                console.log(info)
                request.flash(
                    'error',
                    'Ups, parece que ahora mismo estamos teniendo un problema. Por favor, vuelva a intentarlo más tarde.'
                )
                response.redirect('contact')
            } else {
                request.flash(
                    'success',
                    'Muchas gracias por tu correo, te responderemos lo más rápidamente posible.'
                )
                response.redirect('contact')
            }
        })
    })

    app.get('/', (request, response) => {
        response.render('altocinema')
    })

    app.get('/services', (request, response) => {
        response.render('services')
    })

    app.get('/catalogue', (request, response) => {
        films.getAltoCinema((err, films) => {
            if (err) {
                console.log(err)
                response.render('catalogue', { films: [] })
            } else {
                response.render('catalogue', { films: films })
            }
        })
    })

    app.get('/comingOutCinema', (request, response) => {
        films.getComingOutCinema((err, films) => {
            if (err) {
                console.log(err)
                response.render('comingOutCinema', { films: [] })
            } else {
                response.render('comingOutCinema', { films: films })
            }
        })
    })

    app.get('/nouvelleCinema', (request, response) => {
        films.getNouvelleCinema((err, films) => {
            if (err) {
                console.log(err)
                response.render('nouvelleCinema', { films: [] })
            } else {
                response.render('nouvelleCinema', { films: films })
            }
        })
    })

    app.get('/contact', (request, response) => {
        response.render('contact', {
            success: request.flash('success'),
            error: request.flash('error'),
        })
    })

    app.get('/login', checkNotAuthenticated, (request, response) => {
        response.render('login')
    })

    app.get('/dashboard', checkAuthenticated, (request, response) => {
        preinscr.getPreinsc((err, preinscriptions) => {
            if (err) {
                request.flash('error', err.message)
                response.render('dashboard', {
                    user: request.user,
                    title: 'Inicio',
                    success: request.flash('success'),
                    error: request.flash('error'),
                    preinscr: undefined,
                })
            } else {
                response.render('dashboard', {
                    user: request.user,
                    title: 'Inicio',
                    success: request.flash('success'),
                    error: request.flash('error'),
                    preinscr: preinscriptions,
                })
            }
        })
    })

    app.get('/festivals', checkAuthenticated, (request, response) => {
        festivals.getFestivals((err, festivalList) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('festivals', {
                    user: request.user,
                    title: 'Festivales',
                    festivals: festivalList,
                    success: request.flash('success'),
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/festival:=:id', checkAuthenticated, (request, response) => {
        festivals.getFestival(request.params.id, (err, festival, categories) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('festival', {
                    user: request.user,
                    name: festival.name,
                    festival: festival,
                    categories: JSON.stringify(categories),
                })
            }
        })
    })

    app.get('/films', checkAuthenticated, (request, response) => {
        films.getFilmList((err, filmsList) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('films', {
                    user: request.user,
                    title: 'Películas',
                    films: filmsList,
                    success: request.flash('success'),
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/film:=:id', checkAuthenticated, (request, response) => {
        films.getFilm(request.params.id, (err, film, categories) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('film', {
                    user: request.user,
                    title: film.title,
                    film: film,
                    categories: JSON.stringify(categories),
                })
            }
        })
    })

    app.get('/producers', checkAuthenticated, (request, response) => {
        producers.getProducers((err, producers) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('producers', {
                    user: request.user,
                    title: 'Productores',
                    producers: producers,
                })
            }
        })
    })

    app.get('/producer:=:id', checkAuthenticated, (request, response) => {
        producers.getProducer(request.params.id, (err, producer) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('producer', {
                    user: request.user,
                    title: producer.fullname,
                    producer: producer,
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/platforms', checkAuthenticated, (request, response) => {
        response.render('platforms', { user: request.user, title: 'Plataformas' })
    })

    app.get('/directors', checkAuthenticated, (request, response) => {
        directors.getDirectors((err, directors) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('directors', {
                    user: request.user,
                    title: 'Directores',
                    directors: directors,
                    success: request.flash('success'),
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/director:=:id', checkAuthenticated, (request, response) => {
        directors.getDirector(request.params.id, (err, director) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('director', {
                    user: request.user,
                    title: director.fullname,
                    director: director,
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/profile', checkAuthenticated, (request, response) => {
        response.render('profile', { user: request.user, title: 'Perfil de usuario' })
    })

    app.get('/register', checkAuthenticated, (request, response) => {
        response.render('register', { user: request.user, title: 'Registro de nuevo usuario', error: null })
    })

    app.get('/settings', checkAuthenticated, (request, response) => {
        response.render('settings', { user: request.user, title: 'Ajustes' })
    })

    app.get('/prizes', checkAuthenticated, (request, response) => {
        response.render('prizes', { user: request.user, title: 'Premio' })
    })

    app.get('/addFilm', checkAuthenticated, (request, response) => {
        response.render('addFilm', {
            user: request.user,
            title: 'Añadir película',
            error: request.flash('error'),
        })
    })

    app.get('/addFestival', checkAuthenticated, (request, response) => {
        festivals.getLastId((err, auto_increment) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('/dashboard')
            } else {
                response.render('addFestival', {
                    user: request.user,
                    title: 'Añadir festival',
                    fest_id: auto_increment,
                    error: request.flash('error'),
                })
            }
        })
    })

    app.get('/addDirector', checkAuthenticated, (request, response) => {
        response.render('addDirector', {
            user: request.user,
            title: 'Añadir direcror',
            error: request.flash('error'),
        })
    })

    app.get('/addProducer', checkAuthenticated, (request, response) => {
        response.render('addProducer', {
            user: request.user,
            title: 'Añadir Productor',
            error: request.flash('error'),
        })
    })

    app.post(
        '/login',
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true,
        })
    )

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.post('/addFilm', checkAuthenticated, (request, response) => {
        const film = [
            [
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
                request.body.esp_sinopsis,
                request.body.materialslink,
                request.body.link,
                request.body.originalvimeo,
                request.body.originalvimeopass,
                request.body.englishvimeo,
                request.body.englishvimeopass,
                request.body.frenchvimeo,
                request.body.frenchvimeopass,
                request.body.italianvimeo,
                request.body.italianvimeopass,
                request.body.spavimeo,
                request.body.spavimeopass,
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
                request.body.NIF,
                request.body.copiestel,
                request.body.copiescity,
                request.body.copiesprovince,
                request.body.copiescountry,
                request.body.addcatalogue,
                request.body.picture,
            ],
        ]

        const categories = request.body.categories

        films.newFilm(film, categories, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('addFilm')
            } else {
                response.redirect('films')
            }
        })
    })

    app.post('/updateFilm', checkAuthenticated, (request, response) => {
        const film = request.body

        films.updateFilm(film, request.body.categories, request.body.id, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('films')
            } else {
                request.flash('success', 'Película actualizada')
                response.redirect('films')
            }
        })
    })

    app.post('/addFestival', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const festival = [
            [
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
                request.body.copies_header,
                request.body.copies_street,
                request.body.copies_cp,
                request.body.copies_tel,
                request.body.copies_city,
                request.body.copies_province,
                request.body.copies_country,
                modif,
            ],
        ]

        const categories = request.body.categories

        festivals.newFestival(festival, categories, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('addFestival')
            } else {
                response.redirect('festivals')
            }
        })
    })

    app.post('/updateFestival', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const festival = {
            festival_id: request.body.festival_id,
            name: request.body.name,
            ok: request.body.ok,
            init_date: request.body.init_date,
            end_date: request.body.end_date,
            edition: request.body.edition,
            year: request.body.year,
            deadline: request.body.deadline,
            type: request.body.type,
            entryfee: request.body.entryfee,
            fee: request.body.fee,
            currency: request.body.currency,
            euros: request.body.euros,
            platform: request.body.platform,
            prize: request.body.prize,
            waiver: request.body.waiver,
            disc: request.body.disc,
            final: request.body.final,
            contactname: request.body.contactname,
            contact_email: request.body.contact_email,
            programmer: request.body.programmer,
            prog_email: request.body.prog_email,
            contact_tel: request.body.contact_tel,
            contact_web: request.body.contact_web,
            platformurl: request.body.platformurl,
            state: request.body.state,
            contactcountry: request.body.contactcountry,
            language: request.body.language,
            notes: request.body.notes,
            confirmed: request.body.confirmed,
            sheet: request.body.sheet,
            shortname: request.body.shortname,
            copies_header: request.body.copies_header,
            copies_street: request.body.copies_street,
            copies_cp: request.body.copies_cp,
            copies_tel: request.body.copies_tel,
            copies_city: request.body.copies_city,
            copies_province: request.body.copies_province,
            copies_country: request.body.copies_country,
            modif: modif,
        }

        festivals.updateFestival(festival, request.body.categories, request.body.id, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('festivals')
            } else {
                request.flash('success', 'Festival actualizado')
                response.redirect('festivals')
            }
        })
    })

    app.post('/sendWaiverEmail', (request, response) => {
        let transporter = nodemailer.createTransport({
            host: 'altocinema.com',
            port: 465,
            secure: true,
            auth: {
                user: 'info@altocinema.com',
                pass: 'Altocine2020',
            },
        })
        let mailOptions = {
            from: 'info@altocinema.com',
            to: request.body.wemail,
            subject: "Festival Waivers",
            text: waiverTemplate(request.body.wlang, request.body.wcontact, request.body.wwaiver),
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
                console.log(info)
                request.flash('error', 'No se ha podido enviar el correo.')
                response.redirect('festivals')
            } else {
                request.flash('success', 'Correo enviado.')
                response.redirect('festivals')
            }
        })
    })

    app.post('/addDirector', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const director = [
            [
                request.body.fullname,
                request.body.name,
                request.body.surname,
                request.body.email,
                request.body.phone,
                request.body.nationality,
                request.body.birth_city,
                request.body.home_city,
                request.body.DNI,
                request.body.birthdate,
                request.body.age,
                request.body.esp_bio,
                request.body.eng_bio,
                request.body.address,
                request.body.street,
                request.body.postalcode,
                request.body.city,
                request.body.country,
                request.body.web,
                request.body.notes,
                modif,
            ],
        ]

        directors.newDirector(director, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('addDirector')
            } else {
                request.flash('success', 'Guardado.')
                response.redirect('/directors')
            }
        })
    })

    app.post('/updateDirector', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const director = {
            fullname: request.body.fullname,
            name: request.body.name,
            surname: request.body.surname,
            email: request.body.email,
            phone: request.body.phone,
            nationality: request.body.nationality,
            birth_city: request.body.birth_city,
            home_city: request.body.home_city,
            DNI: request.body.DNI,
            birthdate: request.body.birthdate,
            age: request.body.age,
            esp_bio: request.body.esp_bio,
            eng_bio: request.body.eng_bio,
            address: request.body.address,
            street: request.body.street,
            postalcode: request.body.postalcode,
            city: request.body.city,
            country: request.body.country,
            web: request.body.web,
            notes: request.body.notes,
            modif: modif,
        }

        directors.updateDirector(director, request.body.id, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('directors')
            } else {
                request.flash('success', 'Director modificado correctamente en la base de datos.')
                response.redirect('directors')
            }
        })
    })

    app.post('/addProducer', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const producer = [
            [
                request.body.fullname,
                request.body.name,
                request.body.surname,
                request.body.email,
                request.body.phone,
                request.body.nationality,
                request.body.home_city,
                request.body.birthdate,
                request.body.age,
                request.body.notes,
                modif,
            ],
        ]

        producers.newProducer(producer, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('addProducer')
            } else {
                request.flash('success', 'Guardado.')
                response.redirect('producers')
            }
        })
    })

    app.post('/updateProducer', checkAuthenticated, (request, response) => {
        let auxdate = new Date()
        let modif = 'Modificado el ' + auxdate + ' por ' + request.user.name
        const producer = {
            fullname: request.body.fullname,
            name: request.body.name,
            surname: request.body.surname,
            email: request.body.email,
            phone: request.body.phone,
            nationality: request.body.nationality,
            home_city: request.body.home_city,
            birthdate: request.body.birthdate,
            age: request.body.age,
            notes: request.body.notes,
            modif: modif,
        }

        producers.updateProducer(producer, request.body.id, (err) => {
            if (err) {
                request.flash('error', err.message)
                response.redirect('producers')
            } else {
                request.flash('success', 'Productor modificado correctamente en la base de datos.')
                response.redirect('producers')
            }
        })
    })

    app.post('/register_user', (request, response) => {
        bcrypt.hash(request.body.password, 10, (err, hashed) => {
            if (err) {
                response.render('register', {
                    user: request.user,
                    title: 'Registro de nuevo usuario',
                    error: err,
                })
            } else {
                let user = {
                    email: request.body.email,
                    password: hashed,
                    name: request.body.name,
                }
                users.newUser(user, (err) => {
                    if (!err) {
                        response.redirect('dashboard')
                    } else {
                        response.redirect('register')
                    }
                })
            }
        })
    })

    app.use(function (req, res, next) {
        res.locals.success = req.flash('success')
        res.locals.error = req.flash('error')
        next()
    })

    app.use((req, res) => {
        res.status(404).render('404')
    })
}
