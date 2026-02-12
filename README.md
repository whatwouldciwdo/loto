# LOTO (Lockout/Tagout) Management System

Sistem manajemen Lockout/Tagout berbasis web untuk mengelola proses tagging dan release equipment dengan approval workflow.

## 🏗️ Technology Stack

- **Backend:** NestJS (Node.js + TypeScript)
- **Frontend:** Next.js 14 + Shadcn/ui + TailwindCSS
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Storage:** MinIO (S3-compatible)
- **Container:** Docker & Docker Compose

## 📋 Prerequisites

- Docker Desktop (untuk Windows)
- Node.js 20+ (untuk development)
- Git

## 🚀 Quick Start

### 1. Clone & Setup

```bash
# Clone repository (jika dari git)
git clone <repository-url>
cd Loto

# Copy environment file
cp .env.example .env

# Edit .env dan sesuaikan password/secrets
```

### 2. Start Docker Services

```bash
# Start semua services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access Services

- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`
- **MinIO Console:** http://localhost:9001
  - Username: `minio_admin`
  - Password: `minio_password_change_in_production`
- **MinIO API:** http://localhost:9000

### 4. Setup Backend (akan dibuat)

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

### 5. Setup Frontend (akan dibuat)

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
Loto/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── loto/           # LOTO management
│   │   ├── approvals/      # Approval workflow
│   │   └── database/       # Migrations & seeds
│   └── Dockerfile
├── frontend/               # Next.js web app
│   ├── app/               # App router
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   └── Dockerfile
├── docker/                # Docker configs
│   └── postgres/
│       └── init/         # Init SQL scripts
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔐 Default Users (akan di-seed)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| SP HAR | sp.har | sphar123 |
| SPS HAR | sps.har | spshar123 |
| OP Lokal | op.lokal | oplokal123 |
| OP CCR | op.ccr | opccr123 |

⚠️ **IMPORTANT:** Ganti semua password default sebelum production!

## 🎯 Features

### Implemented
- [ ] Authentication (Username/Password)
- [ ] Role-Based Access Control (RBAC)
- [ ] LOTO Request Form (CAT.02)
- [ ] Approval Workflow (CAT.04)
- [ ] Operator Forms (CAT.03, CAT.05)
- [ ] Release Process (CAT.06)
- [ ] History & Audit Trail
- [ ] File Upload (Tagging Photos)
- [ ] Export to PDF/Excel

### Planned
- [ ] LDAP/Microsoft 365 Integration
- [ ] Email Notifications
- [ ] Real-time Notifications
- [ ] Dashboard Analytics
- [ ] Mobile Responsive

## 🛠️ Development

### Run Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### Database Migrations

```bash
cd backend

# Create new migration
npm run migration:create -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ will delete data)
docker-compose down -v
```

## 📊 Database Schema

Lihat dokumentasi lengkap di `docs/database-schema.md`

Key tables:
- `users` - User accounts
- `roles` - User roles
- `loto_requests` - LOTO requests
- `loto_approvals` - Approval records
- `loto_history` - Audit trail
- `loto_attachments` - File uploads

## 🔄 Workflow

### Tagging Process
1. HAR request LOTO (CAT.02)
2. SP/SPS HAR approval (CAT.04)
3. Form operator (DRAFT → PROGRESS) (CAT.03, CAT.05)
4. OP melakukan tagging
5. OP inform HAR

### Release Process
1. HAR initiate release (CAT.06)
2. Form approval OP
3. Upload foto release
4. LOTO status → CLOSE
5. History tracking

## 🐛 Troubleshooting

### Docker issues

```bash
# Restart services
docker-compose restart

# Rebuild images
docker-compose up -d --build

# Check logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs minio
```

### Database connection issues

```bash
# Connect to PostgreSQL
docker exec -it loto_postgres psql -U loto_user -d loto_db

# Check Redis
docker exec -it loto_redis redis-cli
AUTH redis_password_change_in_production
PING
```

## 📚 Documentation

- [API Documentation](docs/api.md) (akan dibuat)
- [User Guide](docs/user-guide.md) (akan dibuat)
- [Deployment Guide](docs/deployment.md) (akan dibuat)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## 📝 License

Internal use only - Company Property

## 👥 Team

- Developer: [Your Name]
- Project Manager: [PM Name]
- Stakeholders: HSE Department

## 📞 Support

For issues or questions, contact:
- Email: support@company.com
- Slack: #loto-system
