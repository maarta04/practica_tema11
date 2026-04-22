const { env } = require('./config/env')
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const logger = require('./utils/logger')
const { requestLogger } = require('./middleware/logger.middleware')
const prisma = require('./config/prisma')

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/books', require('./routes/books.routes'))
app.use('/api/loans', require('./routes/loans.routes'))
app.use('/api/stats', require('./routes/stats.routes'))
app.use('/api', require('./routes/reviews.routes'))

// Error middleware
app.use(require('./middleware/error.middleware'))

app.get('/', (req, res) => {
    res.json({ message: 'Biblioteca API funcionando' })
})

app.get('/api/health', async (_req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV
    }

    try {
        await prisma.$queryRaw`SELECT 1`
        health.database = 'connected'
    } catch (error) {
        health.status = 'error'
        health.database = 'disconnected'
        return res.status(503).json(health)
    }

    res.json(health)
})

if (require.main === module) {
    const server = app.listen(env.PORT, () => {
        logger.info(`Servidor corriendo en puerto ${env.PORT} [${env.NODE_ENV}]`)
    })

    const shutdown = async (signal) => {
        logger.info(`${signal} recibido. Cerrando servidor...`)

        server.close(async () => {
            logger.info('Servidor HTTP cerrado')
            await prisma.$disconnect()
            logger.info('Base de datos desconectada')
            process.exit(0)
        })

        setTimeout(() => {
            logger.error('Forzando cierre')
            process.exit(1)
        }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
}

module.exports = app
