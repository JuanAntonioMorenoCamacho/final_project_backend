require ('dotenv').config();
const express = require ('express');
const { pool, testConnection } = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;
const { swaggerUi, swaggerSpec } = require('./swagger');
const authMiddleware = require('./authMiddleware');

// Middleware para interpretar JSON
app.use(express.json());

// Ruta para acceder a la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de prueba para ver si el servidor funciona correctamente
app.get('/', (req, res) => {
    res.send('servidor funcionando correctamente');
});

// Ruta para probar la conexion a la base de dastos
app.get('/test-db', async (req, res) => {
    try {
        const isConnected = await testConnection();
        if (isConnected) {
            res.send('Conexion a MySQ establecida correctamente');
        }
        else {
            res.status(500).send('Error al conectar a MySQL');
        }
    }
        catch (error) {
            res.status(500).send('Error al probar la conexion a MySQL');
    }
    
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     security:
 *       - bearerAuth: []
 *     description: Retorna una lista completa de todos los usuarios registrados en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: David Moreno
 *                   teléfono:
 *                     type: string
 *                     example: 646765434
 *                   correo:
 *                     type: string
 *                     example: jam333@hotmail.com
 *                   profesional:
 *                     type: string
 *                     example: pintor
 *                   mensaje:
 *                     type: string
 *                     example: Cambiar color de las paredes
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor
 */
app.get('/users', authMiddleware, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios');
  
      const filtered = rows.map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre,
        teléfono: usuario["teléfono"],
        correo: usuario.correo,
        profesional: usuario.profesional,
        mensaje: usuario.mensaje,
        disponibilidad: usuario.disponibilidad,
        tarifa: usuario.tarifa,
        ciudad: usuario.ciudad
      }));
  
      res.json(filtered);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios con filtros opcionales
 *     description: Retorna una lista de usuarios que coincidan con los parámetros de búsqueda proporcionados.
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: false
 *         description: Nombre del usuario (búsqueda parcial)
 *       - in: query
 *         name: correo
 *         schema:
 *           type: string
 *         required: false
 *         description: Correo electrónico del usuario (búsqueda parcial)
 *       - in: query
 *         name: profesional
 *         schema:
 *           type: string
 *         required: false
 *         description: Profesión del usuario (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Lista de usuarios que coinciden con los filtros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: David Moreno
 *                   teléfono:
 *                     type: string
 *                     example: 646765434
 *                   correo:
 *                     type: string
 *                     example: jam333@hotmail.com
 *                   profesional:
 *                     type: string
 *                     example: pintor
 *                   mensaje:
 *                     type: string
 *                     example: Cambiar color de las paredes
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor
 */
app.get('/users/search', authMiddleware, async (req, res) => {
    try {
      const { nombre, correo, profesional } = req.query;
  
      let query = 'SELECT * FROM usuarios WHERE 1=1';
      let params = [];
  
      if (nombre) {
        query += ' AND nombre LIKE ?';
        params.push(`%${nombre}%`);
      }
  
      if (correo) {
        query += ' AND correo LIKE ?';
        params.push(`%${correo}%`);
      }
  
      if (profesional) {
        query += ' AND profesional LIKE ?';
        params.push(`%${profesional}%`);
      }
  
      const [rows] = await pool.query(query, params);
  
      const filtered = rows.map(usuario => ({
        nombre: usuario.nombre,
        teléfono: usuario["teléfono"],
        correo: usuario.correo,
        profesional: usuario.profesional,
        mensaje: usuario.mensaje,
        disponibilidad: usuario.disponibilidad,
        tarifa: usuario.tarifa,
        ciudad: usuario.ciudad
      }));
  
      res.json(filtered);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - teléfono
 *               - correo
 *               - profesional
 *               - mensaje
 *               - disponibilidad
 *               - tarifa
 *               - ciudad
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               teléfono:
 *                 type: string
 *                 example: +56912345678
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@email.com
 *               profesional:
 *                 type: string
 *                 example: Psicólogo
 *               mensaje:
 *                 type: string
 *                 example: Estoy interesado en una consulta.
 *               disponibilidad:
 *                 type: string
 *                 example: Lunes a Viernes desde las 18:00
 *               tarifa:
 *                 type: string
 *                 example: $30.000 por sesión
 *               ciudad:
 *                 type: string
 *                 example: Santiago
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario creado correctamente
 *                 id:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Faltan campos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Faltan campos obligatorios
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error en la base de datos
 */

  app.post('/users', authMiddleware, async (req, res) => {
    try {
      const { nombre, teléfono, correo, profesional, mensaje, disponibilidad, tarifa, ciudad } = req.body;
  
      // Validación simple (opcional pero recomendable)
      if (!nombre || !teléfono || !correo || !profesional || !mensaje || !disponibilidad || !tarifa || !ciudad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
  
      const query = `
        INSERT INTO usuarios (nombre, teléfono, correo, profesional, mensaje, disponibilidad, tarifa, ciudad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const [result] = await pool.query(query, [nombre, teléfono, correo, profesional, mensaje, disponibilidad, tarifa, ciudad]);
  
      res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        id: result.insertId
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  /**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     description: Elimina un usuario existente según su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor
 */
  app.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Verificar si el usuario existe
      const [result] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Eliminar el usuario
      await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  
      res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - teléfono
 *               - correo
 *               - profesional
 *               - mensaje
 *               - disponibilidad
 *               - tarifa
 *               - ciudad
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               teléfono:
 *                 type: string
 *                 example: +56912345678
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@email.com
 *               profesional:
 *                 type: string
 *                 example: Psicólogo
 *               mensaje:
 *                 type: string
 *                 example: Me gustaría reprogramar la cita.
 *               disponibilidad:
 *                 type: string
 *                 example: Martes y Jueves por la tarde
 *               tarifa:
 *                 type: string
 *                 example: $35.000 por sesión
 *               ciudad:
 *                 type: string
 *                 example: Valparaíso
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario actualizado correctamente
 *       400:
 *         description: Faltan campos obligatorios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
  app.put('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre, teléfono, correo, profesional, mensaje, disponibilidad, tarifa, ciudad } = req.body;
  
    // Validación simple
    if (!nombre || !teléfono || !correo || !profesional || !mensaje || !disponibilidad || !tarifa || !ciudad) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
  
    try {
      // Verificar si el usuario existe
      const [usuario] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  
      if (usuario.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Actualizar el usuario
      const query = `
        UPDATE usuarios
        SET nombre = ?, teléfono = ?, correo = ?, profesional = ?, mensaje = ?, disponibilidad = ?, tarifa = ?, ciudad = ?
        WHERE id = ?
      `;
  
      await pool.query(query, [nombre, teléfono, correo, profesional, mensaje, disponibilidad, tarifa, ciudad, id]);
  
      res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Iniciar el servidor y probar la conexion a la BD
app.listen(PORT , async () => {
    console.log(`Servidor corriendo en http://localhost: ${PORT}`);

    // Probar la conexion a la base de datos
    await testConnection();
});
