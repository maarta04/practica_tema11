# T9: API de Biblioteca con Supabase + Prisma

## Descripción

API REST para gestionar una biblioteca digital usando **Supabase** como base de datos PostgreSQL y **Prisma** como ORM.

## Stack utilizado

- **Node.js** + **Express** — servidor HTTP
- **Prisma** — ORM para PostgreSQL
- **Supabase** — base de datos PostgreSQL en la nube
- **JWT** + **bcryptjs** — autenticación y hashing de contraseñas
- **Zod** — validación de datos de entrada
- **Nodemon** — hot-reload en desarrollo

## Modelos de datos

```
User
├── id (autoincrement)
├── email (unique)
├── name
├── password (hash bcrypt)
├── role (USER | LIBRARIAN | ADMIN)
├── createdAt / updatedAt
├── loans[] (relación)
└── reviews[] (relación)

Book
├── id (autoincrement)
├── isbn (unique)
├── title
├── author
├── genre
├── description (opcional)
├── publishedYear
├── copies (total de ejemplares)
├── available (ejemplares disponibles)
├── createdAt / updatedAt
├── loans[] (relación)
└── reviews[] (relación)

Loan
├── id (autoincrement)
├── userId (FK → User)
├── bookId (FK → Book)
├── loanDate
├── dueDate (14 días desde loanDate)
├── returnDate (nullable)
├── status (ACTIVE | RETURNED | OVERDUE)
└── createdAt / updatedAt

Review
├── id (autoincrement)
├── userId (FK → User)
├── bookId (FK → Book)
├── rating (1-5)
├── comment (opcional)
├── createdAt
└── (unique: userId + bookId)
```

## Endpoints implementados

#### Auth
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | /api/auth/register | Registrar usuario | Público |
| POST | /api/auth/login | Iniciar sesión | Público |
| GET | /api/auth/me | Obtener perfil | Autenticado |

#### Books
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/books | Listar libros (con filtros) | Público |
| GET | /api/books/:id | Obtener libro por ID | Público |
| POST | /api/books | Crear libro | Librarian/Admin |
| PUT | /api/books/:id | Actualizar libro | Librarian/Admin |
| DELETE | /api/books/:id | Eliminar libro | Admin |

#### Loans
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/loans | Mis préstamos | Autenticado |
| GET | /api/loans/all | Todos los préstamos | Librarian/Admin |
| POST | /api/loans | Solicitar préstamo | Autenticado |
| PUT | /api/loans/:id/return | Devolver libro | Autenticado |

#### Reviews
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/books/:id/reviews | Reseñas de un libro | Público |
| POST | /api/books/:id/reviews | Crear reseña | Autenticado |
| DELETE | /api/reviews/:id | Eliminar mi reseña | Autenticado |

## Reglas de negocio implementadas

1. **Préstamos**:
   - Un usuario puede tener máximo 3 préstamos activos
   - No puede pedir prestado el mismo libro dos veces (si ya lo tiene activo)
   - Solo se puede prestar si hay ejemplares disponibles (`available > 0`)
   - Duración del préstamo: 14 días automáticos

2. **Reseñas**:
   - Solo una reseña por usuario por libro (`@@unique([userId, bookId])`)
   - Rating entre 1 y 5 (validado con Zod)
   - Solo usuarios que hayan devuelto el libro pueden reseñar (`status: RETURNED`)

3. **Inventario**:
   - Al prestar: `available--`
   - Al devolver: `available++`
   - Ambas operaciones dentro de una `$transaction` de Prisma para garantizar consistencia

## Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. En **Settings → Database**, copia las dos URLs:
   - **Transaction (pooler)** → para `DATABASE_URL` (puerto 6543)
   - **Direct connection** → para `DIRECT_URL` (puerto 5432)

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase y un JWT_SECRET
```

### 4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

> ⚠️ Se necesitan **dos URLs** en el `.env`: `DATABASE_URL` (pooler, puerto 6543) y `DIRECT_URL` (directa, puerto 5432). Prisma usa la directa para migraciones y la pooler para queries en runtime.

### 5. (Opcional) Sembrar datos de prueba

```bash
npm run db:seed
```

Crea 3 usuarios, 5 libros, 2 préstamos y 1 reseña de ejemplo.

Credenciales de prueba:
- Admin: `admin@biblioteca.com` / `password123`
- Librarian: `librarian@biblioteca.com` / `password123`  
- User: `user@biblioteca.com` / `password123`

### 6. Iniciar servidor

```bash
npm run dev
```

## Scripts

```bash
npm run dev          # Servidor con hot-reload (nodemon)
npm start            # Servidor en producción
npm run db:studio    # Abrir Prisma Studio
npm run db:migrate   # Crear nueva migración
npm run db:push      # Sincronizar schema sin migración
npm run db:seed      # Sembrar datos de prueba
npm test             # Ejecutar tests
```

## Estructura del proyecto

```
practica_T9/
├── prisma/
│   ├── schema.prisma      # Modelos y relaciones
│   ├── migrations/        # Historial de migraciones
│   └── seed.js            # Datos de prueba
├── src/
│   ├── app.js             # Configuración Express y rutas
│   ├── config/
│   │   └── prisma.js      # Cliente Prisma (singleton)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── books.controller.js
│   │   ├── loans.controller.js
│   │   └── reviews.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # Verificación JWT + roles
│   │   └── error.middleware.js   # Manejo de errores Prisma
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── books.routes.js
│   │   ├── loans.routes.js
│   │   └── reviews.routes.js
│   ├── schemas/
│   │   └── validation.js         # Schemas Zod
│   └── utils/
│       ├── password.js           # Hash + comparación bcrypt
│       └── jwt.js                # Generación + verificación JWT
├── tests/
│   └── api.http                  # Tests con REST Client (VS Code)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Criterios de éxito

- Prisma schema con todos los modelos y relaciones
- Migraciones aplicadas correctamente en Supabase
- CRUD completo de libros
- Sistema de préstamos funcionando
- Control de inventario (`available`) con transacciones
- Reseñas con validación (Zod + reglas de negocio)
- Autenticación JWT
- Manejo de errores de Prisma (P2002, P2025)

## Bonus

- Filtros avanzados (género, autor, disponibilidad)
- Comentarios Swagger
- Paginación en listados
- Endpoint de estadísticas (libros más prestados, mejor valorados)

## Recursos

- Prisma Docs
- Supabase Docs
- Teoría T9 - Supabase + Prisma
