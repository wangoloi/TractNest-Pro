# TrackNest Pro - Enterprise Management System

A comprehensive business management system built with React, featuring role-based access control, sales management, inventory tracking, and administrative tools.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Owner, Admin, and User roles with different permissions
- **Sales Management**: Complete sales tracking with receipts and invoices
- **Inventory Management**: Stock tracking with low stock alerts
- **User Management**: Admin tools for user registration and management
- **Access Control**: Block/unblock users with immediate effect
- **Communications**: Internal messaging system between roles
- **Reports & Statements**: Generate sales and stock statements
- **Dark Mode**: Complete dark/light theme support
- **Currency Management**: Multi-currency support with UGX as default

### Advanced Features
- **Auto-Generated Credentials**: Automatic username/password generation for new users
- **Email Notifications**: Simulated email system for credential delivery
- **Multi-Item Stock**: Add multiple items to single receipts
- **Real-time Data**: localStorage-based data persistence
- **Responsive Design**: Mobile-first responsive interface
- **Professional UI**: Modern, clean interface with Tailwind CSS

## 🏗️ Project Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Application core
│   │   ├── providers/               # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication & user management
│   │   │   ├── CurrencyContext.jsx  # Currency settings
│   │   │   ├── MessageContext.jsx   # Messaging system
│   │   │   └── ThemeContext.jsx     # Dark/light mode
│   │   └── routes/
│   │       └── SimplifiedRoutes.jsx # Application routing
│   ├── components/                  # Reusable UI components
│   │   ├── common/                  # Common components
│   │   │   ├── ErrorBoundary.jsx    # Error handling
│   │   │   └── Skeleton.jsx         # Loading skeletons
│   │   ├── dashboard/               # Dashboard components
│   │   │   └── Dashboard.jsx        # Main dashboard
│   │   ├── messages/                # Messaging components
│   │   │   └── CustomerMessages.jsx # Customer messaging
│   │   ├── owner/                   # Owner-specific components
│   │   │   ├── EnterpriseUsers.jsx  # Enterprise user management
│   │   │   ├── OrganizationsManagement.jsx # Organization management
│   │   │   └── OwnerDashboard.jsx   # Owner dashboard
│   │   ├── settings/                # Settings components
│   │   │   └── AppSettings.jsx      # Application settings
│   │   ├── shared/                  # Shared components
│   │   │   └── layout/
│   │   │       └── SimplifiedNavigation.jsx # Main navigation
│   │   ├── statements/              # Statement components
│   │   │   ├── SalesStatement.jsx   # Sales statement generation
│   │   │   ├── StockStatement.jsx   # Stock statement generation
│   │   │   └── Statements.jsx       # Main statements component
│   │   └── ui/                      # UI components
│   │       ├── forms/               # Form components
│   │       │   ├── ButtonDropdown.jsx # Dropdown buttons
│   │       │   ├── Dropdown.jsx     # Dropdown menus
│   │       │   ├── Modal.jsx        # Modal dialogs
│   │       │   ├── SaleForm.jsx     # Sales form
│   │       │   └── StockForm.jsx    # Stock form
│   │       ├── modals/              # Modal components
│   │       │   └── Modal.jsx        # Modal wrapper
│   │       └── tables/              # Table components
│   │           └── DataTable.jsx    # Data table with scrolling
│   ├── features/                    # Feature modules
│   │   ├── admin/                   # Admin features
│   │   │   └── components/
│   │   │       ├── admin/
│   │   │       │   └── AdminManagement.jsx # Admin management
│   │   │       ├── communications/  # Communication components
│   │   │       │   ├── AdminCommunications.jsx # Admin communications
│   │   │       │   └── OwnerCommunications.jsx # Owner communications
│   │   │       ├── performance/     # Performance components
│   │   │       │   └── PerformanceMonitor.jsx # Performance monitoring
│   │   │       ├── subscriptions/   # Subscription components
│   │   │       │   └── SubscriptionManager.jsx # Subscription management
│   │   │       ├── AccessControl.jsx # Access control
│   │   │       └── UserManagement.jsx # User management
│   │   ├── auth/                    # Authentication features
│   │   │   ├── components/
│   │   │   │   └── ProtectedRoute.jsx # Route protection
│   │   │   └── hooks/
│   │   │       └── useRoleAccess.js # Role access hooks
│   │   └── sales/                   # Sales features
│   │       ├── components/          # Sales components
│   │       │   ├── MySales.jsx      # User sales view
│   │       │   ├── SalesManager.jsx # Admin sales management
│   │       │   ├── SalesPlus.jsx    # Sales operations
│   │       │   └── UserSalesManager.jsx # User sales manager
│   │       └── hooks/               # Sales hooks
│   │           └── useSalesManager.js # Sales management hook
│   ├── lib/                         # Utility libraries
│   │   ├── config/                  # Configuration
│   │   │   └── emailConfig.js       # Email configuration
│   │   ├── constants/               # Constants
│   │   │   └── roles.js             # Role definitions
│   │   └── utils/                   # Utility functions
│   │       ├── helpers/
│   │       │   └── salesHelpers.js  # Sales helper functions
│   │       ├── api.js               # API utilities
│   │       ├── config.js            # Configuration utilities
│   │       ├── formatNumber.js      # Number formatting
│   │       ├── normalizeName.js     # Name normalization
│   │       └── userGenerator.js     # User credential generation
│   ├── pages/                       # Page components
│   │   └── Login.jsx                # Login page
│   ├── App.jsx                      # Main application component
│   ├── index.css                    # Global styles
│   └── main.jsx                     # Application entry point
├── index.html                       # HTML template
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
└── vite.config.js                   # Vite configuration
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.1.3
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React
- **Routing**: React Router DOM 7.8.1
- **State Management**: React Context API
- **Notifications**: React Toastify
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **UI Components**: Custom components with Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TractNest-Pro/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 👥 User Roles & Permissions

### Owner
- **Dashboard**: System overview and metrics
- **Admin Management**: Create and manage admin accounts
- **Performance Monitor**: System performance tracking
- **Subscriptions**: Manage system subscriptions
- **Communications**: Admin-to-owner messaging
- **Settings**: System-wide configuration

### Admin
- **Dashboard**: Business overview and metrics
- **Sales & Inventory**: Complete sales and stock management
- **User Management**: Register and manage users
- **Access Control**: Block/unblock users
- **Communications**: User-to-admin messaging
- **Reports**: Generate business reports
- **Settings**: Business configuration

### User
- **Dashboard**: Personal overview
- **Sales & Inventory**: Make sales and view inventory
- **Browse Products**: View available products
- **Statements**: Generate personal statements
- **Contact Admin**: Send messages to admin

## 🔧 Key Features Explained

### Authentication System
- **Hardcoded Users**: Pre-configured users for demonstration
- **Role-Based Access**: Different interfaces based on user role
- **Session Management**: localStorage-based session persistence
- **Protected Routes**: Automatic redirection for unauthorized access

### Sales Management
- **Multi-Item Sales**: Add multiple items to single transactions
- **Receipt Generation**: Automatic receipt numbering
- **Currency Support**: Multi-currency with UGX default
- **Sales History**: Complete transaction history
- **Real-time Updates**: Immediate data persistence

### Inventory Management
- **Stock Tracking**: Real-time inventory levels
- **Low Stock Alerts**: Automatic notifications
- **Multi-Item Receipts**: Add multiple items to stock receipts
- **Supplier Management**: Track supplier information
- **Stock Statements**: Generate inventory reports

### User Management
- **Auto-Generated Credentials**: Automatic username/password creation
- **Email Notifications**: Simulated email delivery
- **Access Control**: Immediate user blocking/unblocking
- **Role Assignment**: Automatic role-based permissions
- **User Profiles**: Complete user information management

### Dark Mode
- **System Preference**: Automatic detection of system theme
- **Manual Toggle**: User-controlled theme switching
- **Persistent Settings**: Theme preference saved in localStorage
- **Complete Coverage**: All components support dark mode

## 📊 Data Management

### Storage Strategy
- **localStorage**: Primary data persistence
- **Context API**: Real-time state management
- **No Backend**: Frontend-only application
- **Data Structure**: JSON-based data organization

### Key Data Types
- **Users**: Authentication and profile data
- **Sales**: Transaction records and receipts
- **Inventory**: Stock levels and item information
- **Messages**: Internal communication system
- **Settings**: Application configuration

## 🎨 UI/UX Features

### Design System
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Complete theme support
- **Accessibility**: WCAG compliant components
- **Professional Look**: Modern, clean interface

### Component Library
- **Reusable Components**: Modular component architecture
- **Consistent Styling**: Unified design language
- **Interactive Elements**: Hover states and animations
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error boundaries

## 🔒 Security Features

### Access Control
- **Role-Based Permissions**: Granular access control
- **Route Protection**: Automatic unauthorized access prevention
- **Session Management**: Secure session handling
- **User Blocking**: Immediate access revocation

### Data Security
- **Input Validation**: Comprehensive form validation
- **XSS Prevention**: Sanitized user inputs
- **CSRF Protection**: Built-in CSRF safeguards
- **Secure Storage**: localStorage with validation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Features
- **Touch-Friendly**: Optimized for touch interaction
- **Collapsible Navigation**: Mobile-optimized menu
- **Responsive Tables**: Scrollable data tables
- **Adaptive Forms**: Mobile-friendly form layouts

## 🚀 Performance Optimizations

### Build Optimizations
- **Code Splitting**: Dynamic imports for better loading
- **Tree Shaking**: Unused code elimination
- **Minification**: Compressed production builds
- **Asset Optimization**: Optimized images and fonts

### Runtime Optimizations
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: On-demand component loading
- **Efficient Rendering**: Optimized re-render cycles
- **Memory Management**: Proper cleanup and garbage collection

## 🧪 Testing Strategy

### Component Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **User Acceptance**: End-to-end user workflows
- **Cross-Browser**: Multi-browser compatibility

### Quality Assurance
- **Code Review**: Peer review process
- **Linting**: ESLint configuration
- **Type Checking**: PropTypes validation
- **Performance Monitoring**: Bundle size tracking

## 📈 Future Enhancements

### Planned Features
- **Backend Integration**: Real database and API
- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: Business intelligence tools
- **Mobile App**: Native mobile application
- **Multi-language**: Internationalization support

### Technical Improvements
- **TypeScript**: Type safety implementation
- **Testing Framework**: Jest and React Testing Library
- **CI/CD Pipeline**: Automated deployment
- **Performance Monitoring**: Real-time performance tracking

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint configuration
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Prefer Context API over prop drilling
4. **Styling**: Use Tailwind CSS classes
5. **Testing**: Write tests for new features

### Pull Request Process
1. **Feature Branch**: Create feature-specific branches
2. **Code Review**: Submit PR for review
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Merge**: After approval and testing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **Component Documentation**: Inline code comments
- **API Documentation**: Function and hook documentation
- **User Guide**: Feature usage instructions
- **Troubleshooting**: Common issues and solutions

### Contact
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Email**: Support email (if available)

---

**TrackNest Pro** - Empowering businesses with comprehensive management solutions.

