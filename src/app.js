const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

dotenv.config()

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())

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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})

module.exports = app