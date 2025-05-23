const mysql = require ('mysql2/promise');
// Carga las variables de entorno .env
require('dotenv').config ();

// Extrae las variables de conexion de process.env
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Configuracion del pool de conexion
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Metodo para probar la conexión
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('conexión a MSQL establecida correctamente');

        return true;
    }
        catch (error) {
        console.error('Error al conectar a MSQL:', error);
        return false;
    }
        finally {
            if (connection) connection.release();
        }
    
    
}
module.exports = {
    pool,
    testConnection
};
