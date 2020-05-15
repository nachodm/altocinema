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
                connection.query("INSERT INTO films email, password FROM users VALUES () email = ? and password = ?",
                [film, password],
                (err, rows) => {
                    if (err) { callback(null); }
                    if (rows.length === 0) {
                        callback(null);
                    } else {
                        callback(user);
                    }
                });
            }
        connection.release();
        });
    }

    /**
     * Modifica en la base de datos la información del usuario pasado por parámetro 
     * @param {object} user Usuario a actualizar en la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el booleano indicando la correcta actualización del usuario.
     */
    modifyFilm(user, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback("Error de conexion a la BBDD", undefined); return;
            }
            connection.query("UPDATE users SET password = ?, name = ? WHERE email = ?",
            [user.password, user.name, user.email],
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
     * Devuelve un objeto user que contiene la información del usuario al que se desea buscar.
     * @param {String} email Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilm(email) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return null;
            }
            connection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, rows) => {
                connection.release();
                if (err) {return null;}
                else {
                    let user;
                    if (rows.length > 0) {
                        user = {
                            email: rows[0].email, 
                            name: rows[0].name, 
                            password: rows[0].pass,
                        }
                    }
                    if (user !== undefined) { return user;}
                    else { return null;}
                }
            })
        });
    }

    /**
     * Devuelve un objeto user que contiene la información del usuario al que se desea buscar.
     * @param {String} email Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFilmList(email) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return null;
            }
            connection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, rows) => {
                connection.release();
                if (err) {return null;}
                else {
                    let user;
                    if (rows.length > 0) {
                        user = {
                            email: rows[0].email, 
                            name: rows[0].name, 
                            password: rows[0].pass,
                        }
                    }
                    if (user !== undefined) { return user;}
                    else { return null;}
                }
            })
        });
    }

}

module.exports = {
    DAOFilms: DAOFilms
}