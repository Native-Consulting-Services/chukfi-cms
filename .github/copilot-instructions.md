<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Chukfi CMS - Copilot Instructions

## Project Overview

Chukfi CMS is an open-source, self-hosted content management system built as a monorepo with:

- **Frontend**: Astro + React + Tailwind CSS for admin dashboard
- **Backend**: Go HTTP API with PostgreSQL
- **Architecture**: Collection-based content management similar to Payload CMS

## Project Structure

- `frontend/` - Astro application with React islands for admin UI
- `backend/` - Go API server with chi router
- `shared/` - Shared types and schemas
- `docker-compose.yml` - Development environment setup

## Key Features

- Collection-based content types with configurable fields
- Role-based access control (RBAC) with permissions management
- Admin dashboard for managing collections, documents, media, users
- File upload and media library
- Draft/published states, versioning, soft delete
- Lifecycle hooks for CRUD operations
- JWT authentication with refresh tokens

## Development Guidelines

- Use modern, idiomatic patterns for both Go and Astro/React
- Follow REST API conventions under `/api/v1`
- Implement proper error handling and validation
- Use TypeScript for frontend type safety
- Follow Go best practices with clean architecture
- Ensure all features respect RBAC permissions

## Tech Stack

- **Frontend**: Astro, React, Tailwind CSS, TypeScript
- **Backend**: Go, chi router, PostgreSQL, JWT
- **Dev Tools**: Docker Compose, Air (Go live reload), golang-migrate

## Coding Standards

- Use semantic commit messages
- Write comprehensive tests for critical functionality
- Document APIs with clear examples
- Follow accessibility standards in UI components
- Implement proper error boundaries and validation
