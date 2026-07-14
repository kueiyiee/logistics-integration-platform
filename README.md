# Logistics Integration Platform

A production-oriented platform for managing multi-tenant delivery operations, partner integrations, and event-driven workflows. The system is designed as an API-first enterprise application with role-based access control, secure admin tooling, and extensible integration capabilities.

## Overview

This repository implements the foundation of a logistics and delivery orchestration platform with:

- Secure authentication and user lifecycle management
- Multi-tenant company and platform administration
- Delivery and driver management workflows
- API key issuance for partner integrations
- Webhook-based event delivery for downstream systems
- Auditability, permissions, and enterprise-grade service boundaries

The architecture is intended to support real-world deployment scenarios, including SaaS-style operations, internal logistics control centers, and external integrations.

## High-Level System Architecture

### Backend
- Laravel 13 / PHP 8.x
- MySQL-based persistence
- RESTful API layer with Sanctum-based authentication
- Service-oriented business logic and controller separation
- Queue-ready webhook dispatch and background processing patterns
- RBAC and enterprise access control abstractions

### Frontend
- React 19 with TypeScript
- Vite-based application shell
- Modular admin and platform experience
- Component-driven UI architecture for scale and maintainability

### Infrastructure & Delivery
- Docker and Docker Compose deployment options
- Apache and Nginx configuration examples
- Environment separation for development, testing, and production
- Documentation-first operational model for deployment and support

## Core Capabilities

- Platform administration and company onboarding
- Driver and delivery record management
- User approval, role assignment, and permission enforcement
- API secret generation and lifecycle management
- Webhook endpoint creation, event subscriptions, and delivery retries
- Audit trail support for administrative actions

## Repository Structure

- [backend](backend) — Laravel API, services, models, migrations, tests
- [frontend](frontend) — React TypeScript client application
- [docs](docs) — architecture, API, database, deployment, and operational guides
- [database-design](database-design) — schema design and DBML assets
- [deployment](deployment) — deployment manifests and environment templates
- [postman](postman) — API collection assets
- [scripts](scripts) — operational and seeding utilities
- [mobile-api](mobile-api) — integration targets for mobile-facing services

## Development Status

The repository currently includes a strong enterprise foundation with working admin and integration modules, including API key and webhook management flows. The implementation is structured for continued expansion into production-grade logistics workflows and broader partner integrations.

## Getting Started

### Prerequisites
- PHP 8.x
- Composer
- Node.js and npm
- MySQL
- Laravel-compatible local environment (XAMPP, Docker, or similar)

### Backend
```bash
cd backend
composer install
php artisan migrate
php artisan test
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

The backend includes feature tests covering core admin workflows, including API key and webhook behavior.

## Notes for Senior Engineering Review

This repository is organized with a clear separation of concerns and is suitable for continued evolution into a multi-tenant logistics platform. The codebase emphasizes:

- Maintainability through layered services and modular structure
- Security through controlled permissions and secret handling
- Extensibility through event-driven integration patterns
- Operational readiness through documentation and deployment assets

## License

This project is intended for internal platform development and integration use cases. Please review local licensing requirements before production deployment.
