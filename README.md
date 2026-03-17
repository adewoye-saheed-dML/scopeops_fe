# ScopeOps Platform 

ScopeOps is a modern, responsive web application built to streamline supplier carbon data collection, track procurement spending, and analyze Scope 3 emissions. Designed for sustainability teams and procurement managers, it transforms raw supply-chain data into actionable, decision-grade climate insights.

## Features

- **Dashboard Analytics:** High-level overview of supplier activities, carbon metrics, and recent data uploads.
- **Supplier Management:** Comprehensive CRM for suppliers—add, edit, and track individual supplier emission profiles.
- **Scope & Spend Tracking:** Log and monitor carbon footprints (Scope 1, 2, 3) and associate them with procurement spend data.
- **Bulk Data Ingestion:** Seamless CSV uploader for importing large volumes of supplier and emissions data at scale.
- **Secure Authentication:** Built-in login and signup flows to keep enterprise data secure.
- **Responsive UI:** A clean, accessible, and fast interface built with Tailwind CSS and Next.js.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** Custom accessible UI components
- **State Management & Data Fetching:** React Hooks + Context/Zustand (via custom stores like `authStore` and `toastStore`)
- **Linting & Formatting:** ESLint & Prettier

## Project Structure

```text
scopeops_fe/
├── public/               # Static assets (logos, SVGs, etc.)
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, globals.css)
│   ├── components/       # Reusable UI components (Dashboard, Data Tables, Scopes, UI elements)
│   ├── hooks/            # Custom React hooks (useToast, useThemePreference)
│   ├── lib/              # Utility functions and API configuration
│   ├── store/            # Global state management
│   └── types/            # TypeScript interface definitions
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

Make sure you have Node.js (v18 or higher) and npm installed on your machine.

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/adewoye-saheed-dML/scopeops_fe.git
cd scopeops_fe
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:** Create a `.env.local` file in the root directory and add any necessary environment variables (e.g., your backend API URL).

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api # Adjust to match your backend
```

4. **Start the development server:**

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/adewoye-saheed-dML/scopeops_fe/issues) if you want to contribute.

## Author

**Saheed Damilola Adewoye**

- GitHub: [@adewoye-saheed-dML](https://github.com/adewoye-saheed-dML)
- LinkedIn: [adewoye-saheed-dml](https://www.linkedin.com/in/adewoye-saheed-dml)

## License

This project is licensed under the [MIT License](LICENSE).