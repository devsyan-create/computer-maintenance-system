# Inventory OS - سیستەمی جەردی کەرەستە

Enterprise-grade inventory management system with full RTL Kurdish support, powered by Firebase.

## Features

- 🔐 **Authentication**: Firebase Authentication with email/password (admin-only access)
- 📊 **Dashboard**: Real-time statistics and recent activity
- 📦 **Asset Management**: Complete CRUD operations with advanced table features
- 📍 **Location Management**: Track assets across multiple locations
- 🔄 **Transfer System**: Transfer assets with automatic receipt generation
- 🖨️ **Receipt Printing**: Professional A4 receipts for transfers
- 🔍 **Advanced Search**: Debounced global search across all fields
- 📤 **Excel Export**: Export selected or all assets to Excel
- ✅ **Bulk Operations**: Bulk transfer and delete operations
- 🎨 **Modern UI**: Tailwind CSS + shadcn/ui components
- 🌙 **Dark Mode Ready**: Full dark mode support
- 📱 **Responsive**: Mobile-friendly design
- 🔄 **RTL Support**: Full right-to-left layout for Kurdish
- ☁️ **Cloud-Based**: All data stored securely in Firebase Firestore

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- TanStack Table v8 (headless table)
- TanStack Query (server state)
- Zustand (global state)
- Sonner (toast notifications)

### Backend
- Firebase Authentication (Email/Password)
- Firebase Firestore (Cloud Database)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3001`

## Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

### Quick Start:
1. Create users in Firebase Console (Authentication > Users)
2. Deploy Firestore security rules from `firestore.rules`
3. Login with your Firebase email/password

## Project Structure

```
inventory-os/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Dashboard.jsx    # Dashboard view
│   │   ├── AssetsTable.jsx  # Main assets table
│   │   ├── Locations.jsx    # Locations management
│   │   ├── Transfers.jsx    # Transfer history
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Login.jsx        # Login screen
│   │   ├── AssetFormDialog.jsx
│   │   └── TransferDialog.jsx
│   ├── config/
│   │   └── firebase.js      # Firebase configuration
│   ├── services/
│   │   └── api.js           # Firebase API client
│   ├── store/
│   │   └── useStore.js      # Zustand stores
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── firestore.rules          # Firestore security rules
└── package.json
```

## Key Features

### Table Features
- Column visibility toggle
- Column sorting
- Global search with debouncing
- Row selection (single & bulk)
- Skeleton loaders
- Responsive horizontal scrolling
- Sticky header

### Data Integrity
- Unique serial numbers
- Unique MAC addresses
- Cascading location updates
- Atomic transfer transactions
- Location asset count tracking

### Business Workflows
- Multi-step asset creation
- Transfer with receipt generation
- Bulk operations with confirmation
- Change tracking
- Activity history

## Development

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## License

MIT

---

Made with ❤️ for Kurdish businesses
