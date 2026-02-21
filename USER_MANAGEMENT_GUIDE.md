# User Management Guide for FleetFlow

## Overview
FleetFlow supports Role-Based Access Control (RBAC) with 5 different user roles as mentioned in the specification document.

## User Roles

1. **Admin** - Full system access, can create/manage all users
2. **Fleet Manager** - Oversee vehicle health, asset lifecycle, and scheduling
3. **Dispatcher** - Create trips, assign drivers, validate cargo loads
4. **Safety Officer** - Monitor driver compliance, license expirations, safety scores
5. **Financial Analyst** - Audit fuel spend, maintenance ROI, operational costs

---

## Creating the First Admin User

### Method 1: Using the Helper Script (Recommended)

Run the provided script:
```bash
python create_superuser.py
```

Enter the required information:
- Email address
- First name
- Last name
- Password

This creates an admin user with full permissions (is_staff=True, is_superuser=True).

### Method 2: Using Django Management Command

```bash
python manage.py createsuperuser
```

Follow the prompts to enter email, first name, last name, and password.

---

## Creating Other Users (Admin Only)

Once you have an admin account, you can create other users through the web interface:

### Step 1: Login as Admin
1. Navigate to `http://localhost:3000/login`
2. Login with your admin credentials

### Step 2: Access User Management
1. Click on **"Users"** in the sidebar (only visible to admins)
2. You'll see the User Management page showing all existing users

### Step 3: Create New User
1. Click the **"Add User"** button
2. Fill in the form:
   - **Email** (required) - User's login email
   - **Password** (required) - Minimum 6 characters
   - **First Name** (required)
   - **Last Name** (required)
   - **Role** (required) - Select from dropdown:
     - Admin
     - Fleet Manager
     - Dispatcher
     - Safety Officer
     - Financial Analyst
   - **Phone Number** (optional)
3. Click **"Create User"**

### Step 4: View and Manage Users
The user list shows:
- User name and profile initials
- Email address
- Role (color-coded badge)
- Phone number
- Status (Active/Inactive)
- Delete action (trash icon)

---

## API Endpoints (For Admin Users)

### List All Users
```
GET /api/users/
Headers: Authorization: Bearer <admin_token>
```

### Create User
```
POST /api/users/
Headers: Authorization: Bearer <admin_token>
Body:
{
  "email": "john@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "MANAGER",
  "phone_number": "+1234567890"
}
```

### Get Current User Info
```
GET /api/users/me/
Headers: Authorization: Bearer <any_user_token>
```

### Update User
```
PATCH /api/users/{id}/
Headers: Authorization: Bearer <admin_token>
Body:
{
  "role": "DISPATCHER",
  "is_active": false
}
```

### Delete User
```
DELETE /api/users/{id}/
Headers: Authorization: Bearer <admin_token>
```

### Change Password
```
POST /api/users/{id}/change_password/
Headers: Authorization: Bearer <admin_token>
Body:
{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}
```

---

## Permission Rules

1. **Only Admin users** (is_staff=True) can:
   - Create new users
   - Update existing users
   - Delete users
   - Access the User Management page

2. **All authenticated users** can:
   - View list of users
   - View their own profile (`/api/users/me/`)

3. **Unauthenticated users** cannot access any user endpoints

---

## Important Notes

1. **First User Must Be Admin**: The first user must be created using the command line script with superuser privileges. After that, the admin can create other users through the web interface.

2. **Email is Username**: Users login with their email address, not a username.

3. **Password Requirements**: Minimum 6 characters (can be increased in settings).

4. **Role Assignment**: Users cannot change their own role. Only admins can assign/change roles.

5. **Security**: User creation API endpoint is protected - only admin users can create accounts. This prevents unauthorized account creation.

---

## Troubleshooting

### "You may not have admin permissions" Error
- This means you're not logged in as an admin user
- Only users with `is_staff=True` can create/manage users
- Login with an admin account or use the command line script

### Can't See "Users" Link in Sidebar
- The Users link is only visible to admin users
- Regular users won't see this option
- Check your user role in the profile

### Forgot Admin Password
- Use Django's password reset:
  ```bash
  python manage.py changepassword admin@example.com
  ```
- Or create a new superuser with the `create_superuser.py` script

---

## Example Workflow

1. **Initial Setup**:
   ```bash
   python create_superuser.py
   # Email: admin@fleetflow.com
   # Name: Admin User
   # Role: ADMIN (automatic for superuser)
   ```

2. **Login to Web Interface**:
   - Go to http://localhost:3000/login
   - Login with admin@fleetflow.com

3. **Create Fleet Manager**:
   - Navigate to Users page
   - Click "Add User"
   - Email: manager@fleetflow.com
   - Role: Fleet Manager
   - Create

4. **Create Dispatcher**:
   - Click "Add User"
   - Email: dispatcher@fleetflow.com
   - Role: Dispatcher
   - Create

5. **Create Safety Officer**:
   - Click "Add User"
   - Email: safety@fleetflow.com
   - Role: Safety Officer
   - Create

6. **Create Financial Analyst**:
   - Click "Add User"
   - Email: analyst@fleetflow.com
   - Role: Financial Analyst
   - Create

Now you have users for all roles mentioned in the document!
