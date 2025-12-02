# 🚀 Quick Admin Setup Guide

## ⚠️ Important: There is NO Default Admin Account

You need to create your admin account first. Here's how:

## Method 1: Using Python Script (Easiest)

### Step 1: Register a Regular User
1. Go to your app: `http://localhost:5173/auth` (or your frontend URL)
2. Click "Create Account"
3. Enter your details:
   - **Name**: Your name
   - **Email**: `admin@smartstay.com` (or any email you want)
   - **Password**: Choose a strong password (remember this!)
4. Click "Create Account"

### Step 2: Make User Admin
```bash
cd backend
python create_admin.py
```

When prompted, enter the email you just registered with.

**Example:**
```
Enter user email to make admin: admin@smartstay.com
✅ SUCCESS! User 'admin@smartstay.com' is now an admin!
```

### Step 3: Login to Admin Panel
1. Go to: `http://localhost:5173/admin/login`
2. Enter:
   - **Email**: `admin@smartstay.com` (or the email you used)
   - **Password**: The password you set during registration
3. Click "Access Admin Panel"

---

## Method 2: Using MongoDB Directly

### Step 1: Register a User (same as above)

### Step 2: Connect to MongoDB
```bash
# Using MongoDB Compass or MongoDB Shell
mongosh "your-mongodb-uri"
```

### Step 3: Update User Role
```javascript
use find_stays_db  // or your database name

db.users.updateOne(
  { email: "admin@smartstay.com" },
  { $set: { role: "admin" } }
)
```

### Step 4: Verify
```javascript
db.users.findOne({ email: "admin@smartstay.com" })
// Should show: role: "admin"
```

---

## Method 3: Using Admin Panel (if you already have an admin)

1. Login as existing admin
2. Go to Admin Panel → Users tab
3. Find the user you want to make admin
4. Change their role from "User" to "Admin" using the dropdown

---

## 📝 Your Admin Credentials

After setup, your admin credentials will be:

- **Email**: The email you registered with (e.g., `admin@smartstay.com`)
- **Password**: The password you set during registration

**⚠️ Important:** There is NO default password. You create it during registration!

---

## 🔐 Security Tips

1. **Use a strong password**: At least 8 characters, mix of letters, numbers, and symbols
2. **Keep it secret**: Don't share admin credentials
3. **Change regularly**: Update your password periodically
4. **Use unique email**: Don't use the same email for admin and regular user

---

## 🎯 Quick Test

After setup, test your admin access:

1. Go to `/admin/login`
2. Login with your admin credentials
3. You should see the Admin Control Panel
4. Check the Dashboard tab for statistics

---

## ❓ Troubleshooting

### "User not found"
- Make sure you registered the user first at `/auth`
- Check the email spelling
- Verify MongoDB connection

### "Access Denied" after login
- User might not have admin role
- Run `create_admin.py` again
- Check MongoDB: `db.users.findOne({email: "your@email.com"})`

### "Cannot connect to MongoDB"
- Check your `.env` file has correct `MONGO_URI`
- Verify MongoDB is running
- Test connection: `python -c "from mongo_client import test_connection; print(test_connection())"`

---

## ✅ Success Checklist

- [ ] Registered a user account
- [ ] Ran `create_admin.py` or updated MongoDB
- [ ] Verified user has `role: "admin"` in database
- [ ] Can login at `/admin/login`
- [ ] Can access Admin Panel at `/admin`

---

**Remember:** Your admin email and password are whatever you set during registration. There's no default account!

