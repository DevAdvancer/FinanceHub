<div align="center">
  <img src="public/financehub.png" alt="FinanceHub Logo" width="200"/>

  # 💰 FinanceHub

  A modern, full-featured personal finance management application built with React, TypeScript, and Supabase. Track your expenses, manage budgets, set financial goals, and gain insights into your spending patterns with an intuitive and beautiful interface.

  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![React](https://img.shields.io/badge/React-18.3.1-blue)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
</div>

## ✨ Features

- 📊 **Interactive Dashboard** - Real-time overview of your financial health with charts and statistics
- 💸 **Transaction Management** - Add, edit, and categorize transactions with ease
- 🎯 **Budget Tracking** - Set and monitor budgets across different categories
- 🏆 **Financial Goals** - Create and track progress towards your savings goals
- 📈 **Insights & Analytics** - Visualize spending patterns with interactive charts
- 📅 **Yearly Summary** - Comprehensive annual financial reports
- 🔐 **Data Encryption** - Optional client-side encryption for sensitive data
- 🌓 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Live data synchronization with Supabase
- 📤 **CSV Export** - Export your financial data for external analysis
- ⌨️ **Keyboard Shortcuts** - Navigate efficiently with keyboard commands

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd FinanceHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` to see the application.

## 🛠️ Built With

- **Frontend Framework:** [React 18](https://react.dev/) - A JavaScript library for building user interfaces
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for enhanced development experience
- **Build Tool:** [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI
- **Backend:** [Supabase](https://supabase.com/) - Open-source Firebase alternative
- **State Management:** [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- **Routing:** [React Router](https://reactrouter.com/) - Declarative routing for React
- **Charts:** [Recharts](https://recharts.org/) - Composable charting library
- **Forms:** [React Hook Form](https://react-hook-form.com/) - Performant form validation
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 📁 Project Structure

```
FinanceHub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components (Sidebar, etc.)
│   │   ├── settings/        # Settings components
│   │   ├── skeletons/       # Loading skeletons
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client and queries
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
└── ...config files          # Configuration files
```

## 🎯 Key Features Explained

### Transaction Management
Track all your income and expenses with detailed categorization. Each transaction can be tagged with categories, payment methods, and notes for better organization.

### Budget Tracking
Set monthly budgets for different spending categories and monitor your progress in real-time. Receive visual indicators when approaching or exceeding budget limits.

### Financial Goals
Define savings goals with target amounts and deadlines. Track your progress with visual indicators and stay motivated to achieve your financial objectives.

### Insights & Analytics
- Monthly spending trends
- Category-wise expense breakdown
- Income vs. Expense comparisons
- Custom date range analysis

### Data Security
Optional end-to-end encryption ensures your financial data remains private and secure. Encryption keys are stored locally and never leave your device.

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security

- Client-side encryption for sensitive data
- Secure authentication with Supabase Auth
- Environment variable management for API keys
- Row-level security policies in Supabase

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Lucide](https://lucide.dev/) for the icon set
- All contributors who help improve this project

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ using React and TypeScript
