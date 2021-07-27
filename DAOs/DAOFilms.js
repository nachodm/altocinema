'use strict'

const e = require('express')

/**
 * Proporciona operaciones para la gestión de películas
 * en la base de datos.
 */
class DAOFilms {
    /**
     * Inicializa el DAO películas.
     *
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool
    }

    /**
     * Añade una determinada película a la base de datos
     *
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando el objeto Error (si se produce, o null en caso contrario)
     *
     * @param {string} user Identificador del usuario a buscar
     * @param {string} categories Categorías a las que corresponde la película.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newFilm(film, categories, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(null)
            } else {
                connection.query(
                    'INSERT INTO FILMS (title, engtitle, year, date, color, animationtechnique, originalv, genre, duration, country, screen, shootingplace, catalogue, sinopsis, eng_sinopsis, esp_sinopsis, materialslink, link, originalvimeo, originalvimeopass, englishvimeo, englishvimeopass, frenchvimeo, frenchvimeopass, italianvimeo, italianvimeopass, spavimeo, spavimeopass, trailer, trailereng, director, script, photography, artistic, soundtrack, montage, producer, animation, sound, interpreter, copiesheader, copiesstreet, copiescp, NIF, copiestel, copiescity, copiesprovince, copiescountry, addcatalogue, picture) VALUES ?',
                    [film],
                    (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            let filmcategories = []
                            categories.forEach((c) => {
                                filmcategories.push({ id: result.insertId, category: c })
                            })
                            if (filmcategories.length > 0) {
                                connection.query(
                                    'INSERT INTO FILMCATEGORIES (id, category) VALUES ?',
                                    [filmcategories.map((film) => [film.id, film.category])],
                                    (err) => {
                                        connection.release()
                                        if (err) {
                                            callback(err)
                                        } else {
                                            callback(null)
                                        }
                                    }
                                )
                            } else {
                                callback(null)
                            }
                        }
                    }
                )
            }
        })
    }

    /**
     * Modifica en base de datos el id de película pasado por parámetro.
     * @param {*} data
     * @param {*} categories
     * @param {*} id
     * @param {*} callback
     */
    updateFilm(data, categories, id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback('Error de conexión a la BBDD', undefined)
            }
            connection.query(
                'UPDATE FILMS SET title = ?, engtitle = ?, year = ?,   date = ?,  color = ?, animationtechnique = ?, originalv = ?, genre = ?, duration = ?, country = ?, screen = ?, shootingplace = ?, catalogue = ?, sinopsis = ?, eng_sinopsis = ?, esp_sinopsis = ?, materialslink = ?, link = ?, originalvimeo = ?, originalvimeopass = ?, englishvimeo = ?, englishvimeopass = ?, frenchvimeo = ?, frenchvimeopass = ?, italianvimeo = ?, italianvimeopass = ?,  spavimeo = ?, spavimeopass = ?, trailer = ?, trailereng = ?, director = ?,  script = ?, photography = ?, artistic = ?, soundtrack = ?, montage = ?, producer = ?, animation = ?, sound = ?,  interpreter = ?, copiesheader = ?, copiesstreet = ?,  copiescp = ?, NIF = ?, copiestel = ?,  copiescity = ?, copiesprovince = ?, copiescountry = ?, addcatalogue = ?, picture = ? WHERE id = ?',
                [
                    data.title,
                    data.engtitle,
                    data.year,
                    data.date,
                    data.color,
                    data.animationtechnique,
                    data.originalv,
                    data.genre,
                    data.duration,
                    data.country,
                    data.screen,
                    data.shootingplace,
                    data.catalogue,
                    data.sinopsis,
                    data.eng_sinopsis,
                    data.esp_sinopsis,
                    data.materialslink,
                    data.link,
                    data.originalvimeo,
                    data.originalvimeopass,
                    data.englishvimeo,
                    data.englishvimeopass,
                    data.frenchvimeo,
                    data.frenchvimeopass,
                    data.italianvimeo,
                    data.italianvimeopass,
                    data.spavimeo,
                    data.spavimeopass,
                    data.trailer,
                    data.trailereng,
                    data.director,
                    data.script,
                    data.photography,
                    data.artistic,
                    data.soundtrack,
                    data.montage,
                    data.producer,
                    data.animation,
                    data.sound,
                    data.interpreter,
                    data.copiesheader,
                    data.copiesstreet,
                    data.copiescp,
                    data.NIF,
                    data.copiestel,
                    data.copiescity,
                    data.copiesprovince,
                    data.copiescountry,
                    data.addcatalogue,
                    data.picture,
                    id,
                ],
                (err) => {
                    if (err) {
                        callback(err, undefined)
                    } else {
                        let filmcategories = []
                        categories.forEach((c) => {
                            filmcategories.push({ id: id, category: c })
                        })
                        if (filmcategories.length > 0) {
                            connection.query('DELETE FROM FILMCATEGORIES WHERE id = ?', [id], (err) => {
                                if (err) {
                                    callback(err, undefined)
                                } else {
                                    connection.query(
                                        'INSERT INTO FILMCATEGORIES (id, category) VALUES ?',
                                        [filmcategories.map((film) => [film.id, film.category])],
                                        (err) => {
                                            connection.release()
                                            if (err) {
                                                callback(err, undefined)
                                            } else {
                                                callback(null, true)
                                            }
                                        }
                                    )
                                }
                            })
                        } else {
                            callback(null, true)
                        }
                    }
                }
            )
        })
    }

    /**
     * Devuelve un objeto user que contiene la información de la película  que se desea buscar.
     * @param {String} id Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilm(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, undefined, undefined)
            }
            connection.query('SELECT * FROM FILMS WHERE id = ?', [id], (err, film) => {
                if (err) {
                    callback(err, undefined, undefined)
                }
                connection.query(
                    'SELECT category from FILMCATEGORIES WHERE id = ?',
                    [id],
                    (err, categories) => {
                        connection.release()
                        if (err) {
                            callback(err, undefined, undefined)
                        } else {
                            let categoriesArray = []
                            categories.forEach((c) => {
                                categoriesArray.push(c.category)
                            })
                            callback(null, film[0], categoriesArray)
                        }
                    }
                )
            })
        })
    }

    /**
     * Devuelve un objeto que contiene el listado de películas de la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilmList(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null)
            }
            connection.query('SELECT * FROM FILMS', (err, films) => {
                connection.release()
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, films)
                }
            })
        })
    }

    /**
     * Obtiene aquellas películas del catálogo AltoCinema marcadas para incluir en la web pública.
     * @param {function} callback Función que devolverá el objeto error o el listado de películas.
     */
    getAltoCinema(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null)
            } else {
                connection.query(
                    'SELECT title, year, country, sinopsis, picture FROM FILMS WHERE addcatalogue = ? AND catalogue = ?',
                    [1, 'AltoCinema'],
                    (err, films) => {
                        connection.release()
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, films)
                        }
                    }
                )
            }
        })
    }
    /**
     * Obtiene aquellas películas del catálogo ComingOutCinema marcadas para incluir en la web pública.
     * @param {function} callback Función que devolverá el objeto error o el listado de películas.
     */
    getComingOutCinema(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null)
            } else {
                connection.query(
                    'SELECT title, year, country, sinopsis, picture FROM FILMS WHERE addcatalogue = ? AND catalogue = ?',
                    [1, 'ComingOutCinema'],
                    (err, films) => {
                        connection.release()
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, films)
                        }
                    }
                )
            }
        })
    }
    /**
     * Obtiene aquellas películas del catálogo NouvelleCinema marcadas para incluir en la web pública.
     * @param {function} callback Función que devolverá el objeto error o el listado de películas.
     */
    getNouvelleCinema(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null)
            } else {
                connection.query(
                    'SELECT title, year, country, sinopsis, picture FROM FILMS WHERE addcatalogue = ? AND catalogue = ?',
                    [1, 'NouvelleCinema'],
                    (err, films) => {
                        connection.release()
                        if (err) {
                            callback(err, null)
                        } else {
                            callback(null, films)
                        }
                    }
                )
            }
        })
    }
}

module.exports = {
    DAOFilms: DAOFilms,
}
