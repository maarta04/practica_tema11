const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Cargando datos de prueba...')

    // Limpiar base de datos
    await prisma.review.deleteMany()
    await prisma.loan.deleteMany()
    await prisma.book.deleteMany()
    await prisma.user.deleteMany()

    // Crear usuarios
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.create({
        data: {
            email: 'admin@biblioteca.com',
            name: 'Admin Principal',
            password: hashedPassword,
            role: 'ADMIN'
        }
    })

    const librarian = await prisma.user.create({
        data: {
            email: 'librarian@biblioteca.com',
            name: 'Bibliotecario',
            password: hashedPassword,
            role: 'LIBRARIAN'
        }
    })

    const user = await prisma.user.create({
        data: {
            email: 'user@biblioteca.com',
            name: 'Usuario Normal',
            password: hashedPassword,
            role: 'USER'
        }
    })

    console.log('✅ Usuarios creados')

    // Crear libros
    const book1 = await prisma.book.create({
        data: {
            isbn: '978-0-06-112008-4',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            genre: 'Ficción',
            description: 'Una novela sobre la injusticia racial en el sur de Estados Unidos',
            publishedYear: 1960,
            copies: 3,
            available: 3
        }
    })

    const book2 = await prisma.book.create({
        data: {
            isbn: '978-0-7432-7356-5',
            title: '1984',
            author: 'George Orwell',
            genre: 'Distopía',
            description: 'Una novela sobre un estado totalitario que controla la realidad',
            publishedYear: 1949,
            copies: 2,
            available: 2
        }
    })

    const book3 = await prisma.book.create({
        data: {
            isbn: '978-0-14-028329-7',
            title: 'El Gran Gatsby',
            author: 'F. Scott Fitzgerald',
            genre: 'Ficción',
            description: 'Una historia sobre el sueño americano en los años 20',
            publishedYear: 1925,
            copies: 4,
            available: 4
        }
    })

    const book4 = await prisma.book.create({
        data: {
            isbn: '978-84-376-0494-7',
            title: 'Cien años de soledad',
            author: 'Gabriel García Márquez',
            genre: 'Realismo mágico',
            description: 'La historia de la familia Buendía en el pueblo de Macondo',
            publishedYear: 1967,
            copies: 5,
            available: 5
        }
    })

    const book5 = await prisma.book.create({
        data: {
            isbn: '978-0-14-243723-0',
            title: 'El Quijote',
            author: 'Miguel de Cervantes',
            genre: 'Clásico',
            description: 'Las aventuras del ingenioso hidalgo Don Quijote de la Mancha',
            publishedYear: 1605,
            copies: 2,
            available: 1
        }
    })

    console.log('✅ Libros creados')

    // Crear préstamos
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    await prisma.loan.create({
        data: {
            userId: user.id,
            bookId: book1.id,
            dueDate,
            status: 'ACTIVE'
        }
    })

    const returnedLoan = await prisma.loan.create({
        data: {
            userId: user.id,
            bookId: book2.id,
            dueDate,
            status: 'RETURNED',
            returnDate: new Date()
        }
    })

    // Actualizar disponibilidad del libro prestado
    await prisma.book.update({
        where: { id: book1.id },
        data: { available: { decrement: 1 } }
    })

    console.log('✅ Préstamos creados')

    // Crear reseña (solo del libro devuelto)
    await prisma.review.create({
        data: {
            userId: user.id,
            bookId: book2.id,
            rating: 5,
            comment: 'Una obra maestra, totalmente recomendable'
        }
    })

    console.log('✅ Reseñas creadas')
    console.log('')
    console.log('Seed completado. Credenciales de prueba:')
    console.log('   Admin:      admin@biblioteca.com / password123')
    console.log('   Librarian:  librarian@biblioteca.com / password123')
    console.log('   User:       user@biblioteca.com / password123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })