module.exports = function (app) {

    app.get('/', (request, response) => {
        response.render('altocinema');
    })
        
    app.get('/services', (request, response) => {
        response.render('services');
    })
  
    app.get('/catalogue', (request, response) => {
        films.getAltoCinema((err, films) => {
        if (err) {
            response.redirect('altocinema');
        }
        else {
            response.render('catalogue', {films: films});
        }
        })
    })
    
    app.get('/comingOutCinema', (request, response) => {
        films.getComingOutCinema((err, films) => {
        if (err) {
            response.redirect('altocinema');
        }
        else {
            response.render('comingOutCinema', {films: films});
        }
        })
    })
    
    app.get('/nouvelleCinema', (request, response) => {
        films.getNouvelleCinema((err, films) => {
        if (err) {
            response.redirect('altocinema');
        }
        else {
            response.render('nouvelleCinema', {films: films});
        }
        })
    })
    app.get('/contact', (request, response) => {
        response.render('contact', {success: request.flash('success'), error: request.flash('error') });
    })
}