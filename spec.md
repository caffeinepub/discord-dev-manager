# Discord & Dev Manager

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Discord management section: member list, announcements, roles overview, online members
- Development management section: tasks with priority levels (critical/high/medium/low), issues tracker, roadmap
- Dashboard overview with KPI stats: total members, active developers, tasks completed, open issues
- Recent activity feed
- Sidebar navigation with sections: Dashboard, Discord Management, Development, Settings
- Search functionality
- Role-based access (admin login to manage)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: actors for managing Discord members, announcements, dev tasks, and issues
2. Data models: Member (name, role, status), Announcement (title, content, timestamp), Task (title, priority, status, dueDate), Issue (title, severity, status)
3. CRUD operations for all entities
4. Stats/summary queries
5. Frontend: dark SaaS dashboard with sidebar nav, cards, stat widgets, lists
6. Authorization for admin-only management
