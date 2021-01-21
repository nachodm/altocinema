"use strict";

/**
 * Proporciona operaciones para la gestión de preinscripciones
 * en la base de datos.
 */
class DAOPreinsc {
    /**
     * Inicializa el DAO preinscripciones.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Devuelve un objeto que contiene el listado de películas de la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getPreinsc(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            }
            connection.query("SELECT B.name, C.title FROM PREINSCR AS A JOIN FESTIVALS AS B ON A.festival_id = B.id JOIN FILMS AS C ON A.film_id = C.id",
            (err, preinscr) => {
                connection.release();
                if (err) {callback(err, null);}
                else {
                    callback(null, preinscr);
                }
            })
        });
    }

  

    /**
     * Realiza las preinscripciones a los festivales de todas las películas que recibe por parámetro.
     * @param {*} films 
     * @param {*} callback 
     */
    handleMonthPreinscriptions(films, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
            }
            let currentmonth = new Date().getMonth() + 1;
            connection.query("SELECT * FROM FESTIVALS WHERE MONTH(deadline) >= ? AND",
            [currentmonth],
            (err, festivals) => {
                if (err) {
                    connection.release();
                    callback(err);
                }
                else {
                    let preinscriptions;
                    films.forEach(film => {
                        festivals.forEach(festival => {
                            let temp = [festival.id, film.id];
                            preinscriptions.push(temp);
                        });
                    });
                    connection.query("INSERT INTO PRESINSCR(festival_id, film_id) VALUES ?",
                    [preinscriptions],
                    (err) => {
                        if (err) {
                            connection.release();
                            callback(err);
                        }
                        else {
                            callback(null);
                        }
                    })
                }
            })
        });
    }
   
}

module.exports = {
    DAOPreinsc: DAOPreinsc
}