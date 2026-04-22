const prisma = require('../config/prisma')

const getStats = async (req, res, next) => {
    try {
        // Libros más prestados (por número de préstamos)
        const mostBorrowed = await prisma.book.findMany({
            take: 5,
            select: {
                id: true,
                title: true,
                author: true,
                _count: { select: { loans: true } }
            },
            orderBy: {
                loans: { _count: 'desc' }
            }
        })

        // Libros mejor valorados (con media de rating)
        const bestRatedBooks = await prisma.book.findMany({
            include: {
                reviews: {
                    select: { rating: true }
                }
            }
        })

        const topRated = bestRatedBooks
            .map(book => {
                const total = book.reviews.length
                const average = total > 0 
                    ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / total 
                    : 0
                return {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    averageRating: parseFloat(average.toFixed(2)),
                    reviewCount: total
                }
            })
            .filter(book => book.reviewCount > 0) // Solo libros con reseñas
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5)

        // Estadísticas generales para el dashboard
        const summary = {
            totalBooks: await prisma.book.count(),
            totalUsers: await prisma.user.count(),
            activeLoans: await prisma.loan.count({ where: { status: 'ACTIVE' } }),
            totalReviews: await prisma.review.count()
        }

        res.json({
            summary,
            mostBorrowed: mostBorrowed.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                loanCount: b._count.loans
            })),
            topRated
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { getStats }
