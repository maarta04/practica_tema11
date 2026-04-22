const { Router } = require('express')
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/books.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')
const { validate, bookSchema } = require('../schemas/validation')

const router = Router()

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Listar todos los libros (con filtros opcionales)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filtrar por género
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Mostrar solo libros con ejemplares disponibles
 *     responses:
 *       200:
 *         description: Lista de libros con metadatos de paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: 'integer' }
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */
router.get('/', getBooks)

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Obtener un libro por ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro
 *     responses:
 *       200:
 *         description: Datos del libro con sus reseñas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Libro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getBookById)

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isbn, title, author, genre, publishedYear, copies]
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: 978-0-06-112008-4
 *               title:
 *                 type: string
 *                 example: To Kill a Mockingbird
 *               author:
 *                 type: string
 *                 example: Harper Lee
 *               genre:
 *                 type: string
 *                 example: Ficción
 *               description:
 *                 type: string
 *                 example: Una novela sobre la injusticia racial
 *               publishedYear:
 *                 type: integer
 *                 example: 1960
 *               copies:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Libro creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos (requiere LIBRARIAN o ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: ISBN duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, authorize('LIBRARIAN', 'ADMIN'), validate(bookSchema), createBook)

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Actualizar un libro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               copies:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Libro actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos (requiere LIBRARIAN o ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Libro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), updateBook)

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Eliminar un libro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Libro eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Libro eliminado correctamente
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos (requiere ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Libro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBook)

module.exports = router