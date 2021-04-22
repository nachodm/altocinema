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
     * @param {*} callback 
     */
    handleMonthPreinscriptions( callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
            }
            let currentmonth = new Date().getMonth() + 1;
            connection.query("SELECT * FROM ( SELECT festcat.id as festid, COUNT(festcat.id) AS SUMA, filcat.id, fest.name, fil.id AS filmId " +
                "FROM FESTIVALCATEGORIES festcat "+
                "JOIN FILMCATEGORIES filcat ON festcat.category = filcat.category "+
                "JOIN FESTIVALS fest ON festcat.id = fest.id "+
                "JOIN FILMS fil ON filcat.id = fil.id "+
                "WHERE MONTH(fest.deadline) = ? "+
                "GROUP BY festcat.id"+
            ") AS X " +
            "JOIN ("+
                "SELECT id as festid2, COUNT(id) as SUMA2 "+
                "FROM FESTIVALCATEGORIES "+
                "GROUP BY id"+
            ") AS Y "+
            "ON X.festid = Y.festid2 "+
            "WHERE X.SUMA = Y.SUMA2 ",
            [currentmonth],
            (err, preinscriptions) => {
                if (err) {
                    connection.release();
                    callback(err, null);
                }
                else {
                    if (preinscriptions.length > 0) {
                        let ids = preinscriptions.map(insc => {
                            return [insc["id"], insc["filmId"]]
                        })
                        connection.query("INSERT INTO PREINSCR(festival_id, film_id) VALUES ?",
                        [ids],
                        (err) => {
                            if (err) {
                                connection.release();
                                callback(err, null);
                            }
                            else {
                                callback(null, preinscriptions);
                            }
                        })
                    }
                    else callback(null, null)
                }
            })
        });
    }
   
}

module.exports = {
    DAOPreinsc: DAOPreinsc
}