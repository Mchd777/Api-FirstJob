// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion des Offres d\'emploi',
      version: '1.0.0',
      description: 'Documentation API avec Swagger pour gérer les offres d\'emploi et de stage',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.js'], // fichier contenant tes routes
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
