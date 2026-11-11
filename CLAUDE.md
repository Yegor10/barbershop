# Project Context: CRM & Online Booking Platform

## 1. Core Tech Stack
- **Framework:** Next.js (App Router), TypeScript (Strict Mode).
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`.
- **UI Components:** Shadcn UI, Radix UI primitives, Lucide React Icons.
- **Forms & Validation:** React Hook Form, Zod.
- **State & Dates:** `date-fns` for time-slot calculations and schedule grid operations.

## 2. Design & UI Guidelines (High-End SaaS Standard)
- **Aesthetics:** Clean, modern SaaS dashboard layout. Use subtle borders (`border-border`), clean spacing, light glassmorphism effects for modals/cards.
- **Color Palette:** Dark-mode friendly. High contrast for critical actions (booking confirmation, status badges).
- **Responsive Standard:**
  - **Client Booking Flow:** Mobile-First design (optimized for smartphone screens).
  - **CRM Admin Dashboard:** Desktop-optimized layout with interactive calendar grids, sidebar navigation, and scalable data tables.

## 3. Module Requirements

### A. Client Booking Flow (`/book`)
- Multi-step interactive form: **Select Service -> Choose Specialist -> Pick Date & Time Slot -> Client Info -> Confirmation**.
- Real-time time-slot availability check (prevent double booking).
- Mobile-friendly time picker grid (e.g., 30-min / 60-min intervals).

### B. CRM Master Dashboard (`/admin`)
- **Interactive Calendar/Schedule:** Grid view of appointments by master/day/week.
- **Status Management:** Visually distinct badges for states: `pending`, `confirmed`, `completed`, `cancelled`.
- **Metrics Bar:** Summary cards showing Total Revenue, Appointments Today, Active Clients, and Completion Rate.
- **Client Directory:** Searchable table with filtering, appointment history, and fast manual booking creation.

## 4. Coding Rules & Structure
- Keep components small and focused under `@/components/ui` and `@/components/modules`.
- Explicitly handle loading states (`Skeleton` components) and empty states for calendar/tables.
- Always generate fully typed props and Zod schemas for form inputs.