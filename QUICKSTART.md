# FleetFlow - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Backend Setup
```bash
cd c:\Users\Rohit\Desktop\fleetflow

# Activate virtual environment (if not already activated)
venv\Scripts\activate

# Run migrations (already completed, but just in case)
python manage.py migrate

# Create admin user
python create_superuser.py
# Or use: python manage.py createsuperuser

# (Optional) Load sample data
python seed_data.py
```

### Step 2: Frontend Setup
```bash
cd c:\Users\Rohit\Desktop\fleetflow\frontend

# Install dependencies (if not done)
npm install
```

### Step 3: Start Both Servers
```bash
# Option 1: Use the convenient batch script
cd c:\Users\Rohit\Desktop\fleetflow
.\start-servers.bat

# Option 2: Start manually in separate terminals
# Terminal 1 - Backend:
cd c:\Users\Rohit\Desktop\fleetflow
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend:
cd c:\Users\Rohit\Desktop\fleetflow\frontend
npm run dev
```

### Step 4: Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin
- **API Docs:** http://localhost:8000/api/docs/

### Step 5: Login
If you used `seed_data.py`:
- Email: `admin@fleetflow.com`
- Password: `admin123`

Otherwise, use the credentials you created with the superuser script.

## 📋 What's Already Built

### ✅ Backend Complete
- [x] User authentication with JWT
- [x] Vehicle management with status tracking
- [x] Driver management with license validation
- [x] Trip dispatch system with workflow
- [x] Maintenance tracking
- [x] Expense management
- [x] Analytics and reporting APIs

### ✅ Frontend Integrated
- [x] Login page with real authentication
- [x] Dashboard with live metrics
- [x] Vehicle registry with search
- [x] Trip management interface
- [x] Responsive design + dark mode

## 🎯 Test the System

### 1. Test Authentication
1. Go to http://localhost:3000/login
2. Login with your credentials
3. You'll be redirected to the Command Center

### 2. View Dashboard
- See real-time fleet statistics
- Vehicle counts by status
- Active trips count
- Fleet utilization rate

### 3. Manage Vehicles
1. Click "Vehicles" in sidebar
2. Browse all vehicles
3. Use search to filter
4. See real-time status (Available, On Trip, In Shop, Retired)

### 4. Manage Trips
1. Click "Trips" in sidebar
2. View all trips with status
3. See trip details (route, driver, cargo)
4. Filter by status or search

## 🔧 Common Tasks

### Add Sample Data
```bash
python seed_data.py
```
This creates:
- 5 sample vehicles
- 4 sample drivers
- 3 sample trips

### Create a Vehicle via Admin
1. Go to http://localhost:8000/admin
2. Click "Vehicles"
3. Click "Add Vehicle"
4. Fill in details and save

### Create a Trip via API
Use the API docs at http://localhost:8000/api/docs/:
1. Expand "POST /api/trips/"
2. Click "Try it out"
3. Fill in the request body
4. Execute

## 🐛 Troubleshooting

### "Connection refused" error
- Make sure backend is running: `python manage.py runserver`
- Check if port 8000 is available

### JWT token errors
- Clear browser localStorage
- Re-login

### No data showing
- Run `python seed_data.py` to add sample data
- Or add data via admin panel

## 📝 Next Development Steps

1. **Add CRUD Modals**
   - Vehicle create/edit modal
   - Driver management modal
   - Trip dispatch form

2. **Implement Custom Actions**
   - Dispatch trip button
   - Complete trip button
   - Retire vehicle action

3. **Build Remaining Pages**
   - Drivers management page
   - Maintenance records page
   - Expenses tracking page
   - Advanced analytics dashboard

4. **Add Features**
   - File uploads for documents
   - Charts and visualizations
   - Notifications system
   - Export to PDF/Excel

## 🎨 Current Features

### Authentication
- JWT-based with automatic token refresh
- Role-based access control (ADMIN, MANAGER, DISPATCHER, SAFETY_OFFICER, ANALYST)
- Secure password hashing

### Vehicle Management
- Full CRUD operations
- Status tracking (Available, On Trip, In Shop, Retired)
- Capacity and specifications
- Maintenance cost tracking

### Trip Management
- Trip creation with validation
- Cargo weight vs vehicle capacity checks
- Status workflow (Pending → Dispatched → Completed/Cancelled)
- Automatic vehicle/driver status updates

### Analytics
- Real-time dashboard KPIs
- Fleet utilization metrics
- Financial summaries
- Driver performance stats

## 💡 Tips

1. **Use Admin Panel** for quick data entry during development
2. **Check API Docs** to understand all available endpoints
3. **Monitor Console** for any frontend errors
4. **Use Django Shell** for data inspection: `python manage.py shell`

## 🚢 Production Checklist

Before deploying:
- [ ] Set `DEBUG = False` in settings.py
- [ ] Configure PostgreSQL database
- [ ] Set up proper SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up SSL certificates
- [ ] Configure static files
- [ ] Set up error logging
- [ ] Enable CORS for production domain
- [ ] Build frontend: `npm run build`
- [ ] Set production API_URL

---

**You're all set! Start the servers and begin using FleetFlow.** 🚛
