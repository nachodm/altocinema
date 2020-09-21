"use strict";

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
        this.pool = pool;
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
            if(err){
                callback(null);
            }
            else{
                connection.query("INSERT INTO FILMS (title, engtitle, year, date, color, animationtechnique, originalv, genre, duration, country, screen, shootingplace, catalogue, sinopsis, eng_sinopsis, materialslink, link, originalvimeo, englishvimeo, frenchvimeo, italianvimeo, spavimeo, trailer, trailereng, director, script, photography, artistic, soundtrack, montage, producer, animation, sound, interpreter, copiesheader, copiesstreet, copiescp, copiestel, copiescity, copiesprovince, copiescountry, addcatalogue) VALUES ?",
                [film],
                (err, result) => {
                    if (err) { callback(err);}
                    else {
                        let filmcategories = [];
                        categories.forEach(c => {
                            filmcategories.push({id: result.insertId, category: c});
                        });
                        if (filmcategories.length > 0) {
                            connection.query("INSERT INTO filmcategories (id, category) VALUES ?",
                            [filmcategories.map(film => [film.id, film.category])],
                            (err) => {
                                connection.release();
                                if (err) { callback(err); }
                                
                                else {
                                    callback(null);
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    /**
     * Modifica en base de datos el id de película pasado por parámetro.
     * @param {*} data 
     * @param {*} categories 
     * @param {*} id 
     * @param {*} callback 
     */
    updateFilm(data, categories, id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback("Error de conexion a la BBDD", undefined); return;
            }
            connection.query("UPDATE films SET = ? WHERE id = ?",
            [data, id],
            (err) => {
                connection.release();
                if (err) {callback(err, undefined); return;}
                else {
                    callback(null, true);
                }
            })
        });
    }


    /**
     * Devuelve un objeto user que contiene la información de la película  que se desea buscar.
     * @param {String} id Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilm(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, undefined);
            }
            connection.query("SELECT * FROM films WHERE id = ?",
            [id],
            (err, film) => {
                connection.release();
                if (err) {callback(err, undefined);}
                else {
                    callback(null, film[0]);
                }
            })
        });
    }

    /**
     * Devuelve un objeto que contiene el listado de películas de la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilmList(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            }
            connection.query("SELECT * FROM FILMS",
            (err, films) => {
                connection.release();
                if (err) {callback(err, null);}
                else {
                    callback(null, films);
                }
            })
        });
    }

    /**
     * Devuelve el nombre de todos los productores junto con sus datos personales
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getProducerList(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            }
            connection.query("SELECT DISTINCT producer, copiestel, copiescountry FROM FILMS",
            (err, films) => {
                connection.release();
                if (err) {callback(err, null);}
                else {
                    callback(null, films);
                }
            })
        });
    }

}

module.exports = {
    DAOFilms: DAOFilms
}