# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project scaffolding
- Pure Go SQLite backend with modernc.org/sqlite
- Astro + React + Tailwind CSS frontend
- JWT authentication with RBAC system
- Collection-based content management
- Admin dashboard UI
- Database migrations system
- VS Code development tasks
- Zero external dependencies setup

### Features

- 🏗️ Collection-based content management
- 👥 Role-based access control (RBAC)
- 📝 Draft/published states with versioning
- 🖼️ Media library with file uploads
- 🔒 JWT authentication with refresh tokens
- ⚡ Lifecycle hooks for CRUD operations
- 🎨 Modern admin dashboard UI

### Technical

- Pure Go implementation (no CGO required)
- SQLite database with automatic schema creation
- 5-minute setup from clone to running
- Cross-platform support (Windows, macOS, Linux)
- Hot reload development environment

## [1.0.0] - TBD

### Added

- Initial stable release
- Complete CMS functionality
- Production-ready authentication
- Full API documentation
- Comprehensive test suite

---

## Release Process

1. Update version in relevant files
2. Update this changelog with release notes
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will automatically create the release
