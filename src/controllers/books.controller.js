const prisma = require('../config/prisma')

const getBooks = async (req, res, next) => {
    try {
        const { genre, author, available } = req.query

        const filters = {}

        if (genre) filters.genre = { contains: genre, mode: 'insensitive' }
        if (author) filters.author = { contains: author, mode: 'insensitive' }
        if (available === 'true') filters.available = { gt: 0 }

        const books = await prisma.book.findMany({
            where: filters,
            include: {
                _count: { select: { reviews: true, loans: true } }
            }
        })

        res.json(books)
    } catch (error) {
        next(error)
    }
}

const getBookById = async (req, res, next) => {
    try {
        const { id } = req.params

        const book = await prisma.book.findUnique({
            where: { id: parseInt(id) },
            include: {
                reviews: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                },
                _count: { select: { loans: true } }
            }
        })

        if (!book) {
            return res.status(404).json({ error: 'Libro no encontrado' })
        }

        res.json(book)
    } catch (error) {
        next(error)
    }
}

const createBook = async (req, res, next) => {
    try {
        const { isbn, title, author, genre, description, publishedYear, copies } = req.body

        const book = await prisma.book.create({
            data: {
                isbn,
                title,
                author,
                genre,
                description,
                publishedYear,
                copies,
                available: copies
            }
        })

        res.status(201).json(book)
    } catch (error) {
        next(error)
    }
}

const updateBook = async (req, res, next) => {
    try {
        const { id } = req.params

        const book = await prisma.book.update({
            where: { id: parseInt(id) },
            data: req.body
        })

        res.json(book)
    } catch (error) {
        next(error)
    }
}

const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params

        await prisma.book.delete({
            where: { id: parseInt(id) }
        })

        res.json({ message: 'Libro eliminado correctamente' })
    } catch (error) {
        next(error)
    }
}

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook }