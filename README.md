# Multi-step Form Challenge

A multi-step form application built with Next.js, TypeScript, and PostgreSQL. This application allows users to:

- Complete each step of a sign-up sequence
- Select a plan and add-ons
- View and confirm their selections
- Submit their order
- View responsive layouts optimized for both mobile and desktop

## Features

- Multi-step form with validation
- Responsive design for all screen sizes
- Form validation for all input fields
- API endpoints for data fetching and submission
- PostgreSQL database for data persistence
- Interactive UI with hover and focus states
- Monthly and yearly billing cycle options
- Summary review step with dynamic calculations

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript
- **Forms**: Formik with Yup validation
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── components/       # React components
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   └── lib/
│   |    └── db.ts             # Database connection
│   └── types/
│       └── myForm.ts         # TypeScript Interfaces
├── public/                   # Static assets
│   └── assets/               # Icons and images
├── database/
│   └── init.sql              # SQL initialization script
├── .env                      # Environment variables
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies
├── README.md                 # Project documentation
└── tsconfig.json             # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker for containerized setup)
- npm or yarn

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd multi-step-form
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your database connection details.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Docker Setup

1. **Build and start the containers**

   ```bash
   docker-compose up -d
   ```

   This will start both the Next.js application and PostgreSQL database.

2. **Access the application**

   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Plans Table
- `id`: Primary key
- `name`: Plan name (Arcade, Advanced, Pro)
- `description`: Plan description
- `monthly_price`: Monthly price
- `yearly_price`: Yearly price
- `icon_path`: Path to plan icon
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### Add-ons Table
- `id`: Primary key
- `name`: Add-on name
- `description`: Add-on description
- `monthly_price`: Monthly price
- `yearly_price`: Yearly price
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### Users Table
- `id`: Primary key
- `name`: User name
- `email`: User email (unique)
- `phone`: User phone number
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### Subscriptions Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `plan_id`: Foreign key to plans
- `is_yearly`: Boolean for yearly billing
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### Subscription Add-ons Table
- `id`: Primary key
- `subscription_id`: Foreign key to subscriptions
- `addon_id`: Foreign key to add-ons
- `created_at`: Creation timestamp

## API Documentation

### GET /api/plans
Returns a list of all available plans & default plan id.

**Response:**
```json
{
  "plans" :[{
    "id": "1",
    "name": "Arcade",
    "description": "Basic gaming plan",
    "monthly_price": 9,
    "yearly_price": 90,
    "icon_path": "/assets/icon-arcade.svg"
  },
  ...],
  "default_plan_id"
}
```

### GET /api/addons
Returns a list of all available add-ons.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Online service",
    "description": "Access to multiplayer games",
    "monthly_price": 1,
    "yearly_price": 10
  },
  ...
]
```

### POST /api/submit
Submits the user form with all selections.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "planType": "1",
  "isYearly": true,
  "addOns": ["1", "2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "userId": 1,
    "subscriptionId": 1
  }
}
```