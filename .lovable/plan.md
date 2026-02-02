

# BuildUnion - Construction Project Management App

## Overview
A full-featured construction/project management application with a light minimal theme, connecting to your external Supabase Pro project with multi-tenant architecture.

---

## Phase 1: Foundation & Authentication

### Supabase Connection
- Configure connection to `https://hbpmojtvlqzggvinefmt.supabase.co`
- Set up Supabase client with your anon key

### Database Schema
Create the following tables with RLS:

**profiles** - User profile information
- `id`, `email`, `full_name`, `avatar_url`, `created_at`

**user_roles** - Role management (separate table for security)
- `id`, `user_id`, `role` (enum: admin, moderator, user)

**projects** - Construction projects
- `id`, `user_id`, `name`, `description`, `status`, `location`, `start_date`, `end_date`, `budget`, `created_at`

**blueprints** - Project documents/blueprints
- `id`, `user_id`, `project_id`, `name`, `file_url`, `file_type`, `version`, `uploaded_at`

**activity_logs** - System activity tracking
- `id`, `user_id`, `project_id`, `action`, `description`, `created_at`

### Authentication
- Login/Signup pages with email authentication
- Protected routes requiring authentication
- Admin role verification using security definer function

---

## Phase 2: Core Features

### Dashboard
- Overview metrics (total projects, active projects, blueprints count)
- Recent activity feed
- Quick action buttons
- Project status breakdown chart

### Projects Management
- Project list with search and filters
- Create new project form
- Project detail view
- Edit/Delete project functionality
- Status management (Planning, In Progress, On Hold, Completed)

### Blueprints & Documents
- Supabase Storage bucket for file uploads
- Upload blueprints to specific projects
- Blueprint viewer/preview
- Version tracking
- Download functionality

### Activity Logs
- Automatic logging of all actions
- Filterable activity history
- Per-project activity view

---

## Phase 3: UI/UX

### Design System (Light Minimal Theme)
- Clean white backgrounds with subtle gray accents
- Professional typography
- Card-based layouts
- Consistent spacing and shadows

### Navigation
- Sidebar navigation with collapsible menu
- Dashboard, Projects, Blueprints, Activity sections
- User profile dropdown

### Responsive Design
- Mobile-friendly layouts
- Adaptive navigation for smaller screens

---

## Security Implementation

- Row Level Security (RLS) on all tables
- `user_id` column on all user-owned data
- Separate `user_roles` table with `has_role()` security definer function
- Proper storage bucket policies for blueprints

