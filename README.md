# FleetFlow - Fleet Management System

A comprehensive fleet management system built with Django REST Framework and Next.js that manages vehicles, drivers, trips, maintenance, and expenses.

## 🚀 Features

### Backend (Django)
- **Authentication**: JWT-based authentication with role-based access control
- **Vehicles Management**: Track vehicle fleet with status management (Available, On Trip, In Shop, Retired)
- **Drivers Management**: Manage drivers with license validation and performance tracking
- **Trip Dispatch**: Complete trip lifecycle management (Pending → Dispatched → Completed/Cancelled)
- **Maintenance Tracking**: Track maintenance records with automatic vehicle status updates
- **Expense Management**: Track fuel and other vehicle expenses
- **Analytics Dashboard**: Real-time KPIs and performance metrics

### Frontend (Next.js)
- **Modern UI**: Built with React 19, TypeScript, and Tailwind CSS
- **Authentication**: JWT token management with automatic refresh
- **Dashboard**: Real-time fleet overview with key metrics
- **Vehicle Registry**: Complete CRUD operations with search and filters
- **Trip Dispatcher**: Manage trip lifecycle with status tracking
- **Responsive Design**: Mobile-friendly interface with dark mode support

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL (optional, SQLite configured by default)
- npm or yarn

## 🛠️ Backend Setup

### 1. Create Virtual Environment
```bash
cd fleetflow
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary drf-spectacular
```

### 3. Configure Database (Optional)
The system uses SQLite by default. To use PostgreSQL, update `fleetflow/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fleetflow_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

Follow the prompts:
- Email: your@email.com
- First Name: Your Name
- Last Name: Your Last Name
- Password: (enter secure password)
- Role: ADMIN

### 6. Start Backend Server
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 7. Access Admin Panel
Navigate to: `http://localhost:8000/admin`
Login with your superuser credentials

### 8. API Documentation
Interactive API docs available at: `http://localhost:8000/api/docs/`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.local` file (already created):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start Frontend Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🔐 Authentication Flow

1. Navigate to `http://localhost:3000/login`
2. Login with your superuser credentials
3. System will store JWT tokens and redirect to Command Center
4. Tokens automatically refresh on expiry

## 📁 Project Structure

### Backend Structure
```
fleetflow/
├── accounts/          # User authentication & management
├── vehicles/          # Vehicle fleet management
├── drivers/           # Driver management
├── trips/             # Trip dispatch & tracking
├── maintenance/       # Maintenance records
├── expenses/          # Fuel & other expenses
├── analytics/         # Analytics & reporting
└── fleetflow/         # Django settings & configuration
```

### Frontend Structure
```
frontend/
├── app/
│   ├── (auth)/       # Authentication pages
│   │   └── login/
│   ├── (dashboard)/  # Protected dashboard pages
│   │   ├── command-center/
│   │   ├── vehicles/
│   │   └── trips/
│   └── layout.tsx    # Root layout with AuthProvider
├── components/       # Reusable UI components
├── contexts/         # React Context (AuthContext)
└── lib/
    └── api/          # API client & type definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user

### Resources
- `/api/vehicles/` - Vehicle CRUD operations
- `/api/drivers/` - Driver CRUD operations
- `/api/trips/` - Trip CRUD operations
- `/api/maintenance/` - Maintenance records
- `/api/fuel-expenses/` - Fuel expense tracking
- `/api/other-expenses/` - Other expenses

### Custom Actions
- `POST /api/trips/{id}/dispatch/` - Dispatch a trip
- `POST /api/trips/{id}/complete/` - Complete a trip
- `POST /api/trips/{id}/cancel/` - Cancel a trip
- `POST /api/vehicles/{id}/retire/` - Retire a vehicle
- `POST /api/drivers/{id}/suspend/` - Suspend a driver

### Analytics
- `GET /api/analytics/dashboard/` - Dashboard statistics
- `GET /api/analytics/fleet-performance/` - Fleet performance metrics
- `GET /api/analytics/financial/` - Financial summary
- `GET /api/analytics/driver-performance/` - Driver performance stats

## 🎯 User Roles

The system supports 5 user roles with different permissions:

1. **ADMIN** - Full system access
2. **MANAGER** - Manage vehicles, drivers, and trips
3. **DISPATCHER** - Create and manage trips
4. **SAFETY_OFFICER** - View and manage maintenance
5. **ANALYST** - View-only access to analytics

## 📊 Key Features Implemented

### Vehicle Management
- ✅ Track vehicle status (Available, On Trip, In Shop, Retired)
- ✅ Vehicle capacity and specifications
- ✅ Automatic status updates during trip lifecycle
- ✅ Maintenance cost tracking
- ✅ Search and filter capabilities

### Trip Dispatch
- ✅ Create trips with validation (cargo weight vs vehicle capacity)
- ✅ Assign vehicles and drivers
- ✅ Automatic availability checking
- ✅ Status workflow (Pending → Dispatched → Completed)
- ✅ Trip cancellation with reason tracking
- ✅ Real-time trip tracking

### Driver Management
- ✅ License validation with expiry tracking
- ✅ Driver status management
- ✅ Performance metrics
- ✅ Availability for trip assignment

### Analytics
- ✅ Real-time dashboard statistics
- ✅ Fleet utilization metrics
- ✅ Financial summaries
- ✅ Driver performance tracking

## 🧪 Testing the System

### 1. Create Test Data via Admin Panel
Navigate to `http://localhost:8000/admin`:
- Add 3-5 vehicles
- Add 3-5 drivers
- Create some sample trips

### 2. Test Frontend Features
- Login at `http://localhost:3000/login`
- View dashboard statistics
- Browse vehicle registry
- Create and dispatch trips
- Track trip status

### 3. Test API Endpoints
Use the interactive API docs at `http://localhost:8000/api/docs/`:
- Test authentication
- Create/update resources
- Trigger custom actions
- View analytics data

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Database errors:**
```bash
# Reset database (CAUTION: Deletes all data)
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Issues

**CORS errors:**
- Ensure backend is running
- Check CORS_ALLOWED_ORIGINS in settings.py includes your frontend URL

**Authentication errors:**
- Clear browser localStorage
- Check .env.local has correct API_URL
- Ensure backend server is running

**API connection refused:**
- Verify backend is running on port 8000
- Check firewall settings

## 📝 Next Steps

To complete the production-ready system:

1. **Add CRUD Modals**: Implement create/edit modals for vehicles, drivers, and trips
2. **Driver Management Page**: Create dedicated driver management interface
3. **Maintenance Tracking**: Add maintenance records page
4. **Expense Management**: Create expense tracking interface
5. **Advanced Analytics**: Add charts and visualizations
6. **Real-time Updates**: Implement WebSocket for live updates
7. **File Uploads**: Add document/image upload for vehicles
8. **Notification System**: Email/SMS notifications for important events
9. **Export Features**: Add PDF/Excel export for reports
10. **Testing**: Add unit and integration tests

## 🚢 Production Deployment

### Backend (Django)
1. Set `DEBUG = False` in settings.py
2. Configure PostgreSQL database
3. Set up proper SECRET_KEY
4. Configure static files with WhiteNoise or cloud storage
5. Use gunicorn or uwsgi for WSGI server
6. Set up SSL certificates
7. Configure proper ALLOWED_HOSTS

### Frontend (Next.js)
1. Update API_URL to production backend
2. Build optimized production bundle: `npm run build`
3. Deploy to Vercel, Netlify, or custom server
4. Set up CDN for static assets
5. Configure environment variables

## 📄 License

This project is part of a fleet management system implementation.

## 👨‍💻 Development

Built with:
- Django 5.2.11
- Django REST Framework
- Next.js 16.1.6
- React 19.2.3
- TypeScript
- Tailwind CSS
- PostgreSQL/SQLite

---

**Status**: ✅ Core functionality complete, ready for testing and enhancement
