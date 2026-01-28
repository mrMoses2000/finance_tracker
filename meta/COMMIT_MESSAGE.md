# Commit Message Template

Type: Feat
Subject: decimals, audit logs, rate limiting, prod compose

Body:
- Converted all money fields to Prisma Decimal with migration.
- Added audit logging for mutating endpoints.
- Added API and auth rate limiting middleware.
- Added production compose profile with migrate deploy.
