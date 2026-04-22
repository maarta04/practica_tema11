const { z } = require('zod')

const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['USER', 'LIBRARIAN', 'ADMIN']).optional()
})

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
})

const bookSchema = z.object({
    isbn: z.string().min(1, 'El ISBN es requerido'),
    title: z.string().min(1, 'El título es requerido'),
    author: z.string().min(1, 'El autor es requerido'),
    genre: z.string().min(1, 'El género es requerido'),
    description: z.string().optional(),
    publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
    copies: z.number().int().min(1),
    available: z.number().int().min(0).optional()
})

const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional()
})

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body)
        next()
    } catch (error) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: error.errors
        })
    }
}

module.exports = { registerSchema, loginSchema, bookSchema, reviewSchema, validate }