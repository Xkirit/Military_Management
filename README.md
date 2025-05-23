# Military Management System

A comprehensive military asset management system built with React frontend and Node.js backend.

## 🚀 Features

- **Dashboard**: Real-time metrics and analytics for military assets
- **Asset Management**: Track equipment, bases, and personnel
- **Transfers**: Manage asset transfers between bases
- **Purchases**: Record new equipment acquisitions
- **Assignments**: Assign equipment to personnel
- **Expenditures**: Track asset usage and disposal
- **Authentication**: Secure login and user management

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications
- **Inter & JetBrains Mono** - Modern typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## 📁 Project Structure

```
military_management/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   └── public/            # Static assets
├── backend/               # Node.js backend API
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── uploads/           # File uploads
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Xkirit/Military_Management.git
   cd Military_Management
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   - Create a MySQL database
   - Import the database schema (if provided)
   - Update database configuration in `backend/config/`

5. **Environment Configuration**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the environment variables with your configuration

6. **Start the Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5002

## 🎨 Design System

The application uses a modern design system with:
- **Inter** font for UI elements
- **JetBrains Mono** for numeric data
- Consistent color palette with CSS custom properties
- Responsive design for mobile and desktop
- Smooth animations and transitions

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing
- Protected routes
- Session management

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ directory to your hosting service
```

### Backend Deployment
- Configure environment variables for production
- Set up MySQL database
- Deploy to your preferred hosting service (Heroku, AWS, etc.)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Dashboard
- `POST /api/dashboard` - Get dashboard metrics

### Assets
- `GET /api/bases` - Get all bases
- `GET /api/equipment-types` - Get equipment types
- `GET /api/equipment` - Get equipment list
- `POST /api/purchases` - Create purchase
- `POST /api/transfers` - Create transfer
- `POST /api/assignments` - Create assignment
- `POST /api/expenditures` - Create expenditure

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Kirit** - *Initial work* - [Xkirit](https://github.com/Xkirit)

## 🙏 Acknowledgments

- React team for the amazing framework
- Node.js community for excellent backend tools
- All contributors who helped improve this project

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**⭐ If you find this project helpful, please give it a star!** 