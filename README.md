# Biomedical Business Management Frontend

A modern Next.js frontend application for managing a biomedical machine service and sales business.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
.
├── app/
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Dashboard page
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── register/
│   │   └── page.tsx         # Registration page
│   ├── customers/
│   │   └── page.tsx         # Customers listing page
│   ├── inventory/
│   │   └── page.tsx         # Machines/Inventory page
│   ├── services/
│   │   └── page.tsx         # Services page
│   └── invoices/
│       └── page.tsx         # Invoices page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── customer-dialog.tsx  # Customer create/edit dialog
│   ├── inventory-dialog.tsx # Machine create/edit dialog
│   ├── service-dialog.tsx   # Service create/edit dialog
│   ├── invoice-dialog.tsx   # Invoice create/edit dialog
│   ├── dashboard-stats.tsx  # Dashboard statistics cards
│   ├── recent-activity.tsx  # Recent activity component
│   ├── upcoming-services.tsx # Upcoming services component
│   └── sidebar.tsx          # Navigation sidebar
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── hooks/
│   ├── useCustomers.ts     # Customers data hook
│   ├── useMachines.ts      # Machines data hook
│   ├── useServices.ts      # Services data hook
│   ├── useInvoices.ts      # Invoices data hook
│   └── useDashboard.ts     # Dashboard data hook
├── lib/
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production, update this to your backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The application will start on `http://localhost:3000`

## Features

### Authentication
- Login with email and password
- Register new admin accounts (no login required)
- JWT token-based authentication
- Protected routes
- Automatic token refresh

### Dashboard
- Overview statistics (total customers, machines, services, revenue)
- Monthly revenue chart
- Recent activity feed
- Upcoming services list

### Customer Management
- List all customers with pagination
- Search customers by name, email, or phone
- Create new customers
- Edit existing customers
- Delete customers

### Inventory Management
- List all machines with pagination
- Filter by status (available, sold, under_service)
- Search machines
- Create new machine entries
- Edit machine details
- Update stock quantities
- Delete machines

### Service Management
- List all services with pagination
- Filter by status (pending, in_progress, completed)
- Filter by customer
- Filter by date range
- Create new service records
- Edit service details
- Mark services as completed (auto-creates invoice)
- Delete services

### Invoice Management
- List all invoices with pagination
- View invoice details with line items
- Create invoices manually
- Add multiple items (services and/or machines)
- Update payment status
- Delete invoices (restores machine stock)

## API Integration

The frontend communicates with the backend API through the `lib/api.ts` client. All API requests include JWT authentication tokens automatically.

### API Client Features

- Automatic token management
- Error handling
- 401 redirect to login
- Pagination support
- Type-safe API methods

### Custom Hooks

The application uses custom React hooks for data fetching:

- `useCustomers()` - Fetch and manage customers
- `useMachines()` - Fetch and manage machines
- `useServices()` - Fetch and manage services
- `useInvoices()` - Fetch and manage invoices
- `useDashboard()` - Fetch dashboard statistics

Each hook provides:
- Data array
- Loading state
- Error state
- Pagination info
- Refetch function

## Pages

### `/` - Dashboard
Overview of business statistics, revenue chart, recent activity, and upcoming services.

### `/login` - Login Page
User authentication page. Redirects to dashboard on successful login.

### `/register` - Registration Page
Create new admin accounts. No authentication required.

### `/customers` - Customers Page
List, search, create, edit, and delete customers.

### `/inventory` - Inventory Page
Manage machine inventory, stock levels, and machine status.

### `/services` - Services Page
Manage service records, track service status, and link services to customers and machines.

### `/invoices` - Invoices Page
Create and manage invoices, track payment status, and view invoice details.

## Components

### Dialog Components
- `CustomerDialog` - Create/edit customer form
- `InventoryDialog` - Create/edit machine form
- `ServiceDialog` - Create/edit service form
- `InvoiceDialog` - Create/edit invoice form with multiple items

### Dashboard Components
- `DashboardStats` - Statistics cards
- `RecentActivity` - Recent invoices and services feed
- `UpcomingServices` - Upcoming service appointments

### UI Components
All UI components are from shadcn/ui and located in `components/ui/`.

## Styling

The application uses Tailwind CSS for styling with a custom theme. Dark mode is supported through `next-themes`.

## State Management

- **Authentication**: React Context (`AuthContext`)
- **Data Fetching**: Custom hooks with React Query-like patterns
- **Form State**: React Hook Form
- **UI State**: React useState hooks

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes | `http://localhost:3001/api` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend API URL
4. Deploy

Vercel will automatically:
- Detect Next.js
- Run `npm run build`
- Deploy to production

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Import from GitHub, set build command: `npm run build`, publish directory: `.next`
- **Railway**: Add Node.js service, set build command: `npm run build`, start command: `npm start`
- **Render**: Create Web Service, set build command: `npm run build`, start command: `npm start`

## Backend Requirements

This frontend requires the backend API to be running. Make sure:

1. Backend is deployed and accessible
2. CORS is configured to allow your frontend domain
3. `NEXT_PUBLIC_API_URL` points to the correct backend URL

## Default Credentials

After backend seeding:
- **Email**: `admin@biomedical.com`
- **Password**: `admin123`

**⚠️ Change these credentials in production!**

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

