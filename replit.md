# Overview

This is a full-stack task management application built with React and Express, designed specifically for social media managers to handle email-based tasks. The application provides a dashboard for organizing and tracking tasks with different priorities and categories, along with user authentication and real-time statistics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions for authentication (no JWT implementation)
- **Password Security**: Bcrypt for password hashing
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Development Setup**: Hot reload with Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema**: Shared schema definitions using Drizzle with Zod validation
- **Tables**: Users and Tasks with proper foreign key relationships
- **Fallback**: In-memory storage implementation for development/testing
- **Migration**: Drizzle Kit for database schema management

## Authentication & Authorization
- **Strategy**: Session-based authentication using express-session
- **Security**: Bcrypt password hashing with salt rounds
- **Session Storage**: Memory-based sessions (not production-ready)
- **Protected Routes**: Middleware-based route protection on both client and server
- **User Management**: Registration, login, logout, and current user endpoints

## External Dependencies
- **Database Provider**: Neon Database (PostgreSQL serverless)
- **UI Components**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Font Awesome for iconography
- **Development Tools**: Replit-specific plugins for development environment integration
- **Form Validation**: Zod for runtime type checking and validation
- **HTTP Client**: Fetch API with custom error handling wrapper

The application follows a monorepo structure with shared TypeScript definitions, implements proper error handling throughout the stack, and uses modern React patterns with hooks and context. The architecture supports real-time data updates through React Query's caching and invalidation system.