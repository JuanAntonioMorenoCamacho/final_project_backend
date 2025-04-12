// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Definimos las opciones de configuración para Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // Versión de OpenAPI (Swagger)
    info: {
      title: 'API de Usuarios', // Título de la API
      description: 'API para manejar usuarios en el sistema', // Descripción
      version: '1.0.0', // Versión de la API
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL de la API
      },
    ],
  },
  apis: ['./app.js'], // Ruta al archivo donde están tus rutas (en este caso el archivo principal)
};

// Creamos el SwaggerSpec a partir de la configuración
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };

