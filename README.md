# Point of Sale System

A modern Point of Sale (POS) system built with Next.js 14, TypeScript, and TailwindCSS. This application provides a comprehensive solution for managing products, categories, users, payment methods, and transactions.

## Features

- 🛍️ **Product Management**

  - CRUD operations for products
  - Category assignment
  - Stock tracking
  - Price management

- 👥 **User Management**

  - Role-based access control
  - User authentication
  - Profile management

- 💰 **Payment Methods**

  - Multiple payment options
  - Active/Inactive status
  - Payment method tracking

- 📊 **Transaction Management**

  - Real-time transaction processing
  - Transaction history
  - Service charge calculation
  - Customer information tracking

- 🎯 **Core Features**
  - Infinite scroll tables
  - Virtual rendering for large datasets
  - Real-time search
  - Responsive design
  - Form validation
  - Error handling
  - Toast notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Table**: TanStack Table + Virtualization
- **Forms**: React Hook Form + Zod
- **UI Components**: Shadcn/ui
- **HTTP Client**: Axios
- **Notifications**: Sonner

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/markhadi/coffee-pos-frontend.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
NEXT_PUBLIC_API_URL=<your_api_domain,_example:_https://yourdomain.com>
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Key Components

- **VirtualTable**: Reusable table component with virtualization
- **TableHeader**: Consistent header with search and add button
- **ActionButtons**: Standardized action buttons for CRUD operations
- **FormDialog**: Reusable dialog for forms
- **TableEmptyState**: Consistent empty state display

## Backend Repository

The backend for this project is developed by [Joko Vivanco](https://github.com/jokovivanco). You can find the backend repository here:

- [Coffee POS Backend](https://github.com/jokovivanco/coffee-pos)

## Team

- Frontend: [Markhadi](https://github.com/markhadi)
- Backend: [Joko Vivanco](https://github.com/jokovivanco)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
