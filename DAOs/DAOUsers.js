"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsers {
    /**
     * Inicializa el DAO usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} user Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(user, password, callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(null);
            }
            else{
                connection.query("SELECT email, password FROM users WHERE email = ? and password = ?",
                [user, password],
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
     * Inserta la información del usuario pasado por parámetro en la base de datos.
     * @param {object} user Objeto usuario a insertar en la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    newUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback("Error de conexion a la BBDD", undefined);
            }
            connection.query("INSERT INTO users (email, pass, name) VALUES (?, ?, ?)",
            [user.email, user.password, user.name],
            (err)=> {
                    connection.release();
                    if(err){
                        callback("Error acceso BBDD", false);
                    }
                    else {
                        callback(undefined, true);
                    }
            });
        });
    }

    /**
     * Modifica en la base de datos la información del usuario pasado por parámetro 
     * @param {object} user Usuario a actualizar en la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el booleano indicando la correcta actualización del usuario.
     */
    modifyUser(user, callback){
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
    getUser(email) {
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
    DAOUsers: DAOUsers
}