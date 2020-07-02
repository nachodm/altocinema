"use strict";

/**
 * Proporciona operaciones para la gestión de películas
 * en la base de datos.
 */
class DAOFestivals {
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
     * Añade un determinado festival a la base de datos
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando el objeto Error (si se produce, o null en caso contrario)
     * 
     * @param {string} festival Identificador del festival a introducir
     * @param {string} categories Categorías que recibe el festival.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newFestival(festival, categories, callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(null);
            }
            else{
                connection.query("INSERT INTO FESTIVALS (name, ok, init_date, end_date, edition,  deadline,  type, entryfee, fee, currency, platform, print, prize, contactname, contact_email, programmer, prog_email, contact_tel, contact_web, platformurl,state,contactcountry,language,notes,confirmed,sheet,shortname,header,street,postalcode,city, province, copies_header, copies_street,copies_cp,copies_tel,copies_city,copies_province, copies_country) VALUES ?",
                [festival],
                (err, result) => {
                    if (err) { callback(err);}
                    else {
                        let festivalcategories = [];
                        categories.forEach(c => {
                            festivalcategories.push({id: result.insertId, category: c});
                        });
                        if (festivalcategories.length > 0) {
                            connection.query("INSERT INTO festivalcategories (id, category) VALUES ?",
                            [festivalcategories.map(festival => [festival.id, festival.category])],
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
    getFestivals(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return null;
            }
            connection.query("SELECT * FROM FESTIVALS",
            (err, festivals) => {
                connection.release();
                if (err) {callback(err, null);}
                else {
                    callback(null, festivals);
                }
            })
        });
    }

}

module.exports = {
    DAOFestivals: DAOFestivals
}