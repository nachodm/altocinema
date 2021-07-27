'use strict'

const { query } = require('express')

/**
 * Proporciona operaciones para la gestión de productores en la base de datos.
 */
class DAOProducers {
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
     * Añade un determinado productor a la base de datos
     *
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando el objeto Error (si se produce, o null en caso contrario)
     *
     * @param {string} producer Identificador del producer a introducir
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newProducer(producer, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(null)
            } else {
                connection.query(
                    'INSERT INTO PRODUCERS (fullname, name, surname, email, phone, nationality, home_city, birthdate, age, notes, modif) VALUES ?',
                    [producer],
                    (err) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null)
                        }
                    }
                )
            }
        })
    }

    /**
     * Modifica en base de datos el id del producer pasado por parámetro.
     * @param {*} producer Información del producer
     * @param {*} id Id del producer
     * @param {*} callback Objeto error o resultado
     */
    updateProducer(producer, id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback('Error de conexion a la BBDD', undefined)
                return
            }

            connection.query(
                'UPDATE PRODUCERS SET fullname = ?,name = ?,surname = ?,email = ?,phone = ?, nationality = ?, home_city = ?, birthdate = ?, age = ?, notes = ?, modif = ? WHERE id = ?',
                [
                    producer.fullname,
                    producer.name,
                    producer.surname,
                    producer.email,
                    producer.phone,
                    producer.nationality,
                    producer.home_city,
                    producer.birthdate,
                    producer.age,
                    producer.notes,
                    producer.modif,
                    id,
                ],
                (err) => {
                    connection.release()
                    if (err) {
                        callback(err, undefined)
                        return
                    } else {
                        callback(null, true)
                    }
                }
            )
        })
    }

    /**
     * Devuelve un objeto user que contiene la información del productor que se desea buscar.
     * @param {String} id Identificador del productor
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getProducer(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, undefined)
            }
            connection.query('SELECT * FROM PRODUCERS WHERE id = ?', [id], (err, producer) => {
                connection.release()
                if (err) {
                    callback(err, undefined)
                } else {
                    callback(null, producer[0])
                }
            })
        })
    }

    /**
     * Devuelve un objeto que contiene el listado de productores de la base de datos.
     * @param {function} callback Función que devolverá el objeto error o el resultado.
     */
    getProducers(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return null
            }
            connection.query('SELECT * FROM PRODUCERS', (err, producers) => {
                connection.release()
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, producers)
                }
            })
        })
    }
}

module.exports = {
    DAOProducers: DAOProducers,
}
