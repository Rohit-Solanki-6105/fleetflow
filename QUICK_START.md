# FleetFlow - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Backend
```bash
cd c:\Users\Rohit\Desktop\fleetflow
.\venv\Scripts\activate
python manage.py runserver
```
**Backend will be running at:** http://localhost:8000

### Step 2: Start the Frontend (New Terminal)
```bash
cd c:\Users\Rohit\Desktop\fleetflow\frontend
npm run dev
```
**Frontend will be running at:** http://localhost:3000

### Step 3: Login
Navigate to http://localhost:3000/login

**Default Admin Credentials:**
- Email: `admin@fleetflow.com`
- Password: `admin123`

---

## 🎯 Quick Navigation

After logging in, you'll have access to:

### Command Center (Dashboard)
**URL:** `/command-center`
- Real-time fleet overview
- Auto-refreshes every 10 seconds
- KPI metrics: Active vehicles, trips, alerts
- Manual refresh button

### Vehicles
**URL:** `/vehicles`
- View all fleet vehicles
- Search by ID, plate, make, or model
- See status: Available, On Trip, In Shop, Retired
- Capacity and fuel details

### Drivers
**URL:** `/drivers`
- Driver profiles and contact info
- License information with expiry warnings
- Safety scores (out of 100)
- Status tracking: On Duty, Off Duty, On Trip, Suspended

### Trips
**URL:** `/trips`
- Current and past trips
- Pickup and dropoff locations
- Cargo weight and description
- Trip status tracking

### Maintenance
**URL:** `/maintenance`
- Service log history
- Maintenance types: Scheduled, Repair, Inspection, Emergency
- Cost tracking per service
- Filter by status

### Expenses
**URL:** `/expenses`
- **Fuel Tab:** Fuel expenses with quantity and cost per liter
- **Other Tab:** Tolls, parking, insurance, taxes, etc.
- Summary cards showing total costs

### Analytics
**URL:** `/analytics`
- Fleet performance metrics
- Financial overview
- Trip statistics
- Utilization rates

---

## 📊 Sample Data

The system comes pre-loaded with:
- **5 Vehicles:** Volvo, Scania, Mercedes-Benz, MAN, DAF trucks
- **4 Drivers:** Alex, Sarah, John, Emma
- **3 Trips:** NY→Boston, Chicago→Detroit, LA→SF

To reset or re-populate data:
```bash
python seed_data.py
```

---

## 🔐 User Roles & Permissions

### ADMIN (Full Access)
- Manage all resources
- Create/edit users
- Access all reports
- **Example:** Fleet Manager, System Administrator

### MANAGER
- Manage vehicles, drivers, trips
- View financial reports
- Cannot manage users
- **Example:** Operations Manager

### DISPATCHER
- Create and assign trips
- View vehicles and drivers
- Cannot access financial reports
- **Example:** Dispatch Coordinator

### DRIVER (Limited Access)
- View assigned trips
- Log expenses
- Cannot manage other resources
- **Example:** Truck Drivers

### ANALYST (Read-Only)
- View all data
- Export reports
- Cannot modify records
- **Example:** Financial Analyst, Business Intelligence

---

## 🎨 Key Features

### Real-Time Updates
- Dashboard automatically refreshes every 10 seconds
- See live changes to fleet status
- Manual refresh button available

### Status Management
- **Vehicles:** AVAILABLE → ON_TRIP → AVAILABLE (or IN_SHOP for maintenance)
- **Drivers:** ON_DUTY ↔ ON_TRIP ↔ OFF_DUTY (or SUSPENDED)
- **Trips:** DRAFT → DISPATCHED → IN_PROGRESS → COMPLETED

### Smart Validation
- ✅ Cargo weight must not exceed vehicle capacity
- ✅ Driver license must be valid for trip assignment
- ✅ Vehicle must be available (not in shop or on another trip)
- ✅ Driver must be available (not on another trip or suspended)

### Financial Tracking
- Automatic cost aggregation per vehicle
- Fuel efficiency calculations
- Total operational cost tracking
- Per-trip expense logging

---

## 🛠️ Troubleshooting

### Backend Issues
**Problem:** `Port 8000 already in use`
```bash
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

**Problem:** `ModuleNotFoundError`
```bash
# Ensure virtual environment is activated
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Issues
**Problem:** `Port 3000 already in use`
```bash
# Kill the process or use a different port
# Edit package.json: "dev": "next dev -p 3001"
```

**Problem:** `Cannot connect to backend`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Should be: `http://localhost:8000`

**Problem:** `Login fails`
- Verify backend is running
- Check browser console for errors
- Ensure CORS is enabled in Django settings

---

## 📱 API Endpoints

All endpoints are prefixed with `/api/`

### Authentication
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/verify/` - Verify token validity

### Resources
- `GET/POST /api/vehicles/` - List/Create vehicles
- `GET/PUT/DELETE /api/vehicles/{id}/` - Retrieve/Update/Delete vehicle
- `GET/POST /api/drivers/` - List/Create drivers
- `GET/POST /api/trips/` - List/Create trips
- `GET/POST /api/maintenance/` - List/Create maintenance records
- `GET/POST /api/fuel-expenses/` - List/Create fuel expenses
- `GET/POST /api/other-expenses/` - List/Create other expenses

### Analytics
- `GET /api/analytics/dashboard/` - Dashboard metrics
- `GET /api/analytics/fleet/` - Fleet performance
- `GET /api/analytics/financial/` - Financial reports
- `GET /api/analytics/drivers/` - Driver performance

**API Documentation:** http://localhost:8000/api/docs/

---

## 💡 Tips & Tricks

### Dark Mode
- Toggle using the moon/sun icon in the header
- Preference is saved locally

### Search
- Use the search bar on each page to filter records
- Searches across multiple fields (ID, name, license plate, etc.)

### Status Filters
- Use filter dropdowns to show only specific statuses
- Example: Show only "Available" vehicles

### Real-Time Updates
- Watch the "Last updated" timestamp on Command Center
- Click "Refresh" button to manually update

### Keyboard Shortcuts
- `Ctrl + K` - Focus search bar (if implemented)
- `Esc` - Close modals (if implemented)

---

## 🔄 Common Workflows

### 1. Dispatch a New Trip
1. Go to **Trips** page
2. Click "Add Trip"
3. Select available vehicle (with sufficient capacity)
4. Select available driver (with valid license)
5. Enter pickup and dropoff details
6. Enter cargo weight
7. Submit - Vehicle and driver status automatically change to "ON_TRIP"

### 2. Complete a Trip
1. Find the trip in **Trips** page
2. Click "Complete"
3. Vehicle and driver status automatically change to "AVAILABLE"

### 3. Log Maintenance
1. Go to **Maintenance** page
2. Click "Log Maintenance"
3. Select vehicle
4. Choose maintenance type
5. Enter cost and details
6. Submit - Vehicle status automatically changes to "IN_SHOP"

### 4. Track Expenses
1. Go to **Expenses** page
2. Choose **Fuel** or **Other** tab
3. Click "Log Expense"
4. Fill in details (vehicle, amount, date)
5. Submit - Costs are aggregated automatically

---

## 📈 Performance Tips

### For Best Experience:
- Use modern browsers (Chrome, Firefox, Edge, Safari)
- Enable JavaScript
- Stable internet connection for real-time updates
- Clear cache if you see stale data

### Production Recommendations:
- Enable caching in Django
- Use PostgreSQL instead of SQLite
- Set up Redis for session management
- Implement CDN for static files
- Enable gzip compression
- Set up monitoring (Sentry, DataDog)

---

## 🆘 Support

### Resources:
- **API Documentation:** http://localhost:8000/api/docs/
- **Django Admin:** http://localhost:8000/admin
- **Implementation Guide:** `IMPLEMENTATION_COMPLETE.md`
- **Architecture:** `frontend/ARCHITECTURE.md`

### Need Help?
Check the documentation files in the project root:
- `fleetflow.md` - Original requirements
- `QUICKSTART.md` - Basic setup guide
- `IMPLEMENTATION_COMPLETE.md` - Complete feature list
- `STATUS.md` - Development progress

---

**🎉 Happy Fleet Managing!**
