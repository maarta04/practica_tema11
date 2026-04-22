const { verifyToken } = require('../utils/jwt')

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = verifyToken(token)
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' })
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos para esta acción' })
        }
        next()
    }
}

module.exports = { authenticate, authorize }