# Admin Panel Setup Guide

## 🛡️ Admin Access Features

The admin panel provides special access to manage the entire SmartStay Navigator platform.

### Admin-Only Access Features:

1. **User Management**
   - View all registered users
   - Change user roles (user/admin)
   - See user statistics

2. **Event Management**
   - View all events (regardless of visibility radius)
   - Delete any event
   - See event statistics

3. **Place Management**
   - View all tourist spots
   - Delete any place
   - Manage place data

4. **Stay Management**
   - View all stays
   - Delete any stay
   - Manage accommodation data

5. **Dashboard Statistics**
   - Total users count
   - Admin vs regular users
   - Content statistics (events, places, stays)

## 🔐 How to Make a User Admin

### Method 1: Direct MongoDB Update

1. Connect to your MongoDB database
2. Find the user document:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### Method 2: Using Admin Panel (if you already have an admin)

1. Login as an existing admin
2. Go to Admin Panel → Users tab
3. Find the user you want to make admin
4. Change their role from "User" to "Admin" using the dropdown

### Method 3: Python Script

Create a file `make_admin.py`:

```python
from mongo_client import get_users_collection
from bson import ObjectId

users = get_users_collection()

# Make a user admin by email
email = "your-admin@email.com"
result = users.update_one(
    {'email': email},
    {'$set': {'role': 'admin'}}
)

if result.modified_count > 0:
    print(f"User {email} is now an admin!")
else:
    print(f"User {email} not found or already admin")
```

Run: `python make_admin.py`

## 📍 Admin Routes

All admin routes require authentication and admin role:

- `GET /api/admin/check` - Check if current user is admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/<id>/role` - Update user role (admin only)
- `GET /api/admin/events` - Get all events (admin only)
- `DELETE /api/admin/events/<id>` - Delete event (admin only)
- `GET /api/admin/places` - Get all places (admin only)
- `DELETE /api/admin/places/<id>` - Delete place (admin only)
- `GET /api/admin/stays` - Get all stays (admin only)
- `DELETE /api/admin/stays/<id>` - Delete stay (admin only)
- `GET /api/admin/stats` - Get dashboard statistics (admin only)

## 🚀 Accessing Admin Panel

1. Login to your account
2. If you're an admin, you'll see "🛡️ Admin" in the sidebar
3. Click on it to access the admin panel
4. If you don't see it, you're not an admin yet

## ⚠️ Security Notes

- Admin access is role-based (stored in MongoDB)
- Only users with `role: "admin"` can access admin features
- All admin routes are protected with `@admin_required` decorator
- Regular users will see "Access Denied" if they try to access `/admin`

## 🎯 First Admin Setup

To create the first admin:

1. Register a normal user account
2. Use Method 1 (MongoDB) or Method 3 (Python script) to set their role to "admin"
3. Login with that account
4. You'll now see the Admin link in the sidebar

