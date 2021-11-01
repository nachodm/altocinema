'use strict'

const config = require('./config/config')
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const flash = require('express-flash')
const initializePassport = require('./passport-config')
const i18n = require('./i18n')
initializePassport(passport)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))
app.use(i18n)

require('./router/index.js')(app, passport)

app.listen(config.port, (err) => {
    if (err) {
        console.log('Error al iniciar el servidor')
    } else {
        console.log(`Servidor arrancado en el puerto ${config.port}`)
    }
})

module.exports = app
