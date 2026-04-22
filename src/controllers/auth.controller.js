const prisma = require('../config/prisma')
const { hashPassword, comparePassword } = require('../utils/password')
const { generateToken } = require('../utils/jwt')

const register = async (req, res, next) => {
    try {
        const { email, name, password, role } = req.body

        const hashed = await hashPassword(password)

        const user = await prisma.user.create({
            data: { email, name, password: hashed, role: role || 'USER' }
        })

        const token = generateToken({ id: user.id, email: user.email, role: user.role })

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }

        const valid = await comparePassword(password, user.password)

        if (!valid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role })

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        })
    } catch (error) {
        next(error)
    }
}

const me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        })

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        res.json(user)
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login, me }