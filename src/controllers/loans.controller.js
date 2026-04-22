const prisma = require('../config/prisma')

const getMyLoans = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const take = parseInt(limit)

        const [loans, total] = await Promise.all([
            prisma.loan.findMany({
                where: { userId: req.user.id },
                skip,
                take,
                include: {
                    book: { select: { id: true, title: true, author: true, isbn: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.loan.count({ where: { userId: req.user.id } })
        ])

        res.json({
            loans,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / take)
            }
        })
    } catch (error) {
        next(error)
    }
}

const getAllLoans = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const take = parseInt(limit)

        const [loans, total] = await Promise.all([
            prisma.loan.findMany({
                skip,
                take,
                include: {
                    book: { select: { id: true, title: true, author: true } },
                    user: { select: { id: true, name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.loan.count()
        ])

        res.json({
            loans,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / take)
            }
        })
    } catch (error) {
        next(error)
    }
}

const createLoan = async (req, res, next) => {
    try {
        const { bookId } = req.body
        const userId = req.user.id

        // Comprobar préstamos activos del usuario
        const activeLoans = await prisma.loan.count({
            where: { userId, status: 'ACTIVE' }
        })

        if (activeLoans >= 3) {
            return res.status(400).json({ error: 'Ya tienes 3 préstamos activos, devuelve uno antes de pedir otro' })
        }

        // Comprobar si ya tiene ese libro en préstamo activo
        const existingLoan = await prisma.loan.findFirst({
            where: { userId, bookId: parseInt(bookId), status: 'ACTIVE' }
        })

        if (existingLoan) {
            return res.status(400).json({ error: 'Ya tienes este libro en préstamo' })
        }

        // Comprobar disponibilidad
        const book = await prisma.book.findUnique({
            where: { id: parseInt(bookId) }
        })

        if (!book) {
            return res.status(404).json({ error: 'Libro no encontrado' })
        }

        if (book.available <= 0) {
            return res.status(400).json({ error: 'No hay ejemplares disponibles' })
        }

        // Calcular fecha límite (14 días)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 14)

        // Crear préstamo y actualizar disponibilidad en una transacción
        const loan = await prisma.$transaction(async (tx) => {
            const newLoan = await tx.loan.create({
                data: {
                    userId,
                    bookId: parseInt(bookId),
                    dueDate,
                    status: 'ACTIVE'
                },
                include: {
                    book: { select: { id: true, title: true, author: true } }
                }
            })

            await tx.book.update({
                where: { id: parseInt(bookId) },
                data: { available: { decrement: 1 } }
            })

            return newLoan
        })

        res.status(201).json(loan)
    } catch (error) {
        next(error)
    }
}

const returnLoan = async (req, res, next) => {
    try {
        const { id } = req.params

        const loan = await prisma.loan.findUnique({
            where: { id: parseInt(id) }
        })

        if (!loan) {
            return res.status(404).json({ error: 'Préstamo no encontrado' })
        }

        if (loan.userId !== req.user.id) {
            return res.status(403).json({ error: 'No puedes devolver un préstamo que no es tuyo' })
        }

        if (loan.status === 'RETURNED') {
            return res.status(400).json({ error: 'Este préstamo ya fue devuelto' })
        }

        // Devolver libro y actualizar disponibilidad en una transacción
        const updatedLoan = await prisma.$transaction(async (tx) => {
            const returned = await tx.loan.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'RETURNED',
                    returnDate: new Date()
                },
                include: {
                    book: { select: { id: true, title: true, author: true } }
                }
            })

            await tx.book.update({
                where: { id: loan.bookId },
                data: { available: { increment: 1 } }
            })

            return returned
        })

        res.json(updatedLoan)
    } catch (error) {
        next(error)
    }
}

module.exports = { getMyLoans, getAllLoans, createLoan, returnLoan }