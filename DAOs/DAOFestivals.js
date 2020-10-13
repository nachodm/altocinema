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
                connection.query("INSERT INTO FESTIVALS (festival_id, name, ok, init_date, end_date, edition, year, deadline, type, entryfee, fee, currency, euros, platform, prize, waiver, disc, final, contactname, contact_email, programmer, prog_email, contact_tel, contact_web, platformurl,state,contactcountry,language,notes,confirmed,sheet,shortname,header,street,postalcode,city, province, copies_header, copies_street,copies_cp,copies_tel,copies_city,copies_province, copies_country, modif) VALUES ?",
                [festival],
                (err, result) => {
                    if (err) { callback(err);}
                    else {
                        let festivalcategories = [];
                        Array.prototype.forEach.call(categories, c => {
                            festivalcategories.push({id: result.insertId, category: c});
                        });
                        let fests=festivalcategories.reduce((o,a)=>{
                            let ini=[];
                            ini.push(a.id);
                            ini.push(a.category);
                            o.push(ini);
                            return o
                      },[]);
                        if (festivalcategories.length > 0) {
                            connection.query("INSERT INTO FESTIVALCATEGORIES (id, category) VALUES ?",
                            [fests],
                            (err) => {
                                connection.release();
                                if (err) { callback(err); }
                                
                                else {
                                    callback(null);
                                }
                            });
                        }
                        else {
                            callback(null);
                        }
                    }
                });
            }
        });
    }

    /**
     * Modifica en base de datos el id de película pasado por parámetro.
     * @param {*} data Información del festival
     * @param {*} categories Categorías a guardar del festival
     * @param {*} id id del festival a modificar
     * @param {*} callback Función que devolverá el error o el resultado
     */
    updateFestival(data, categories, id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback("Error de conexion a la BBDD", undefined); return;
            }
            connection.query("UPDATE festivals SET festival_id = ?, name = ?, ok = ?, init_date = ?, end_date = ?, edition = ?, year = ?, deadline = ?, type = ?, entryfee = ?, fee = ?, currency = ?, euros = ?, platform = ?, prize = ?, waiver = ?, disc = ?, final = ?, contactname = ?, contact_email = ?, programmer = ?, prog_email = ?, contact_tel = ?, contact_web = ?, platformurl = ?,state = ?,contactcountry = ?,language = ?,notes = ?,confirmed = ?,sheet = ?,shortname = ?,header = ?,street = ?,postalcode = ?,city = ?, province = ?, copies_header = ?, copies_street = ?,copies_cp = ?,copies_tel = ?,copies_city = ?,copies_province = ?, copies_country = ?, modif= ? WHERE id = ?",
            [data.festival_id, data.name, data.ok, data.init_date, data.end_date, data.edition, data.year, data.deadline, data.type, data.entryfee, data.fee, data.currency, data.euros, data.platform, data.prize, data.waiver, data.disc, data.final, data.contactname, data.contact_email, data.programmer, data.prog_email, data.contact_tel, data.contact_web, data.platformurl, data.state, data.contactcountry, data.language, data.notes, data.confirmed, data.sheet, data.shortname, data.header, data.street, data.postalcode, data.city, data.province, data.copies_header, data.copies_street, data.copies_cp, data.copies_tel, data.copies_city, data.copies_province, data.copies_country, data.modif, id],
            (err) => {
                if (err) {callback(err, undefined); return;}
                else {
                    let festivalcategories = [];
                    categories.forEach(c => {
                        festivalcategories.push({id: id, category: c});
                    });
                    if (festivalcategories.length > 0) {
                        connection.query("DELETE FROM FESTIVALCATEGORIES WHERE id = ?", 
                        [id],
                        (err) => {
                            if (err) {callback(err, undefined);}
                            else {
                                connection.query("INSERT INTO FESTIVALCATEGORIES (id, category) VALUES ?",
                                [festivalcategories.map(festival => [festival.id, festival.category])],
                                (err) => {
                                    connection.release();
                                    if (err) { callback(err, undefined); }
                                    
                                    else {
                                        callback(null, true);
                                    }
                                });
                            }
                        })
                    }
                    else {
                        callback(null, true);
                    }
                }
            })
        });
    }


    /**
     * Devuelve un objeto user que contiene la información del festival que se desea buscar.
     * @param {String} id Identificador del usuario
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getFestival(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, undefined, undefined);
            }
            connection.query("SELECT * FROM festivals WHERE id = ?",
            [id],
            (err, festival) => {
                if (err) {callback(err, undefined, undefined);}
                connection.query("SELECT category from FESTIVALCATEGORIES WHERE id = ?",
                [id],
                (err, categories) => {
                    connection.release();
                    if (err) {callback(err, undefined, undefined);}
                    else {
                        let categoriesArray = [];
                        categories.forEach(c => {
                            categoriesArray.push(c.category);
                        });
                        callback(null, festival[0], categoriesArray);
                    }
                });
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
    /**
     * Realiza las preinscripciones a los festivales de todas las películas que recibe por parámetro.
     * @param {*} films 
     * @param {*} callback 
     */
    handleMonthPrescriptions(films, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
            }
            let currentmonth = new Date().getMonth() + 1;
            connection.query("SELECT * FROM FESTIVALS WHERE MONTH(deadline) = ?",
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
    DAOFestivals: DAOFestivals
}