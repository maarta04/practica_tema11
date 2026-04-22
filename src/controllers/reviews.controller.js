const prisma = require('../config/prisma')

const getBookReviews = async (req, res, next) => {
    try {
        const { id } = req.params

        const reviews = await prisma.review.findMany({
            where: { bookId: parseInt(id) },
            include: {
                user: { select: { id: true, name: true } }
            }
        })

        const average = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

        res.json({
            reviews,
            average: Math.round(average * 10) / 10,
            total: reviews.length
        })
    } catch (error) {
        next(error)
    }
}

const createReview = async (req, res, next) => {
    try {
        const { id } = req.params
        const { rating, comment } = req.body
        const userId = req.user.id
        const bookId = parseInt(id)

        // Comprobar que el usuario ha devuelto el libro
        const returnedLoan = await prisma.loan.findFirst({
            where: {
                userId,
                bookId,
                status: 'RETURNED'
            }
        })

        if (!returnedLoan) {
            return res.status(403).json({
                error: 'Solo puedes reseñar libros que hayas devuelto'
            })
        }

        // Comprobar que no tiene ya una reseña
        const existingReview = await prisma.review.findUnique({
            where: { userId_bookId: { userId, bookId } }
        })

        if (existingReview) {
            return res.status(409).json({
                error: 'Ya has reseñado este libro'
            })
        }

        const review = await prisma.review.create({
            data: { userId, bookId, rating, comment },
            include: {
                user: { select: { id: true, name: true } }
            }
        })

        res.status(201).json(review)
    } catch (error) {
        next(error)
    }
}

const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params

        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) }
        })

        if (!review) {
            return res.status(404).json({ error: 'Reseña no encontrada' })
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ error: 'No puedes eliminar una reseña que no es tuya' })
        }

        await prisma.review.delete({
            where: { id: parseInt(id) }
        })

        res.json({ message: 'Reseña eliminada correctamente' })
    } catch (error) {
        next(error)
    }
}

module.exports = { getBookReviews, createReview, deleteReview }