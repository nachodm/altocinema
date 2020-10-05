"use strict";

const { query } = require("express");

/**
 * Proporciona operaciones para la gestión de directores en la base de datos.
 */
class DAODirectors {
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
     * Añade un determinado director a la base de datos
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando el objeto Error (si se produce, o null en caso contrario)
     * 
     * @param {string} director Identificador del director a introducir
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newDirector(director, callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(null);
            }
            else{
                connection.query("INSERT INTO DIRECTORS (fullname, name, surname, email, phone, birth_city, home_city, DNI, birthdate, age, esp_bio, eng_bio, modif) VALUES ?",
                [director],
                (err) => {
                    if (err) { callback(err);}
                    else {
                        callback(null);
                    }
                });
            }
        });
    }

    /**
     * Modifica en base de datos el id del director pasado por parámetro.
     * @param {*} director Información del director
     * @param {*} id Id del director
     * @param {*} callback Objeto error o resultado
     */
    updateDirector(director, id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback("Error de conexion a la BBDD", undefined); return;
            }
            
            connection.query("UPDATE DIRECTORS SET fullname = ?,name = ?,surname = ?,email = ?,phone = ?,birth_city = ?, home_city = ?, DNI = ?, birthdate = ?, age = ?, esp_bio = ?, eng_bio = ?, modif = ? WHERE id = ?",
            [director.fullname, director.name, director.surname, director.email, director.phone, director.birth_city, director.home_city, director.DNI, director.birthdate, director.age, director.esp_bio, director.eng_bio, director.modif, id],
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
     * Devuelve un objeto user que contiene la información del director que se desea buscar.
     * @param {String} id Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getDirector(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, undefined);
            }
            connection.query("SELECT * FROM DIRECTORS WHERE id = ?",
            [id],
            (err, director) => {
                connection.release();
                if (err) {callback(err, undefined);}
                else {
                    callback(null, director[0]);
                }
            })
        });
    }

    /**
     * Devuelve un objeto que contiene el listado de películas de la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getDirectors(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return null;
            }
            connection.query("SELECT * FROM DIRECTORS",
            (err, directors) => {
                connection.release();
                if (err) {callback(err, null);}
                else {
                    callback(null, directors);
                }
            })
        });
    }

}

module.exports = {
    DAODirectors: DAODirectors
}