const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    // Errores de Prisma
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Ya existe un registro con ese valor único'
        })
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Registro no encontrado'
        })
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    })
}

module.exports = errorHandler