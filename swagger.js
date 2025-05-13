import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API de Usuários e Endereços',
    description: 'Documentação gerada automaticamente',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);