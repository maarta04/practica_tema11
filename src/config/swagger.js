const swaggerJsdoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Biblioteca Digital',
            version: '1.0.0',
            description: 'API REST para gestionar una biblioteca digital usando Supabase + Prisma'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor local' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', example: 'user@biblioteca.com' },
                        name: { type: 'string', example: 'Usuario Normal' },
                        role: { type: 'string', enum: ['USER', 'LIBRARIAN', 'ADMIN'] },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Book: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        isbn: { type: 'string', example: '978-0-06-112008-4' },
                        title: { type: 'string', example: 'To Kill a Mockingbird' },
                        author: { type: 'string', example: 'Harper Lee' },
                        genre: { type: 'string', example: 'Ficción' },
                        description: { type: 'string', nullable: true },
                        publishedYear: { type: 'integer', example: 1960 },
                        copies: { type: 'integer', example: 3 },
                        available: { type: 'integer', example: 2 }
                    }
                },
                Loan: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 3 },
                        bookId: { type: 'integer', example: 1 },
                        loanDate: { type: 'string', format: 'date-time' },
                        dueDate: { type: 'string', format: 'date-time' },
                        returnDate: { type: 'string', format: 'date-time', nullable: true },
                        status: { type: 'string', enum: ['ACTIVE', 'RETURNED', 'OVERDUE'] }
                    }
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 3 },
                        bookId: { type: 'integer', example: 2 },
                        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                        comment: { type: 'string', nullable: true, example: 'Excelente libro' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Mensaje de error' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
