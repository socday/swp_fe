# 🏢 FPTU HCM Multi-campus Facility Booking System

Hệ thống đặt phòng và quản lý cơ sở vật chất cho FPTU HCM, hỗ trợ hai campus: **FU FPT** và **NVH**.

## ✨ Tính năng chính

### 🎭 5 Vai trò người dùng

1. **👥 Student**: Tìm kiếm và đặt phòng
2. **👨‍🏫 Lecturer**: Đặt phòng với ưu tiên cao hơn
3. **👔 Staff**: Phê duyệt đơn, quản lý lịch, tạo tasks
4. **🛡️ Security**: Nhận tasks, mở cửa, báo cáo tình trạng
5. **👑 Admin**: Quản lý toàn bộ hệ thống và thống kê

### 🔄 Workflow tự động

- **Auto-notification**: Staff hủy booking → Tự động thông báo user
- **Auto-task creation**: Staff approve booking → Tự động tạo task cho Security
- **Report system**: Security gửi damage reports → Staff xử lý

### 📊 Tính năng nâng cao

- **Advanced Statistics** (Admin):
  - Top rooms (most booked)
  - Top time slots (most popular)
  - Popular categories
  - Usage by role
  
- **Multi-campus Support**:
  - Mỗi campus có staff/security riêng
  - Filter và search theo campus
  - Thống kê riêng từng campus

- **Real-time Calendar**:
  - View lịch theo ngày/tuần/tháng
  - Color-coded by status
  - Interactive booking creation

## 🚀 Quick Start

### 1. Tạo tài khoản demo

Trên trang Login, click một trong các nút:
- **"Create Demo Accounts"**: Tạo 7 tài khoản (students, lecturers, admins)
- **"Create Admin Account"**: Tạo 2 admin accounts
- **"Create Security Account"**: Tạo 2 security accounts
- **"Create Staff Account"**: Tạo 2 staff accounts

### 2. Login với credentials

Xem file [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md) để biết chi tiết tất cả tài khoản demo.

**Quick login examples:**
```
Student:  student1@fpt.edu.vn / student123
Lecturer: lecturer1@fpt.edu.vn / lecturer123
Staff:    staff1@fpt.edu.vn / staff123
Security: security1@fpt.edu.vn / security123
Admin:    admin1@fpt.edu.vn / admin123
```

### 3. Test các tính năng

**Student Flow:**
1. Login → Room Search → Create booking → View in My Bookings

**Staff Flow:**
1. Login → Booking Approvals → Approve/Reject
2. Task Management → View auto-created tasks
3. Reports → Handle security reports

**Security Flow:**
1. Login → View approved schedule
2. Tasks → See assigned tasks → Complete
3. Damage Reports → Report room issues

**Admin Flow:**
1. Login → Facility Management → Add/Edit rooms
2. User Management → View/Edit users
3. Advanced Statistics → View analytics

## 🏗️ Kiến trúc hệ thống

```
Frontend (React + Tailwind CSS)
    ↓
Backend (Hono Server on Supabase Edge Functions)
    ↓
Database (Supabase - KV Store + Auth)
```

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Hono (web framework), Deno runtime
- **Database**: Supabase (PostgreSQL + KV Store)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## 📁 Cấu trúc dự án

```
/
├── App.tsx                          # Main app với routing
├── components/
│   ├── StudentDashboard.tsx         # Dashboard cho student
│   ├── LecturerDashboard.tsx        # Dashboard cho lecturer
│   ├── StaffDashboard.tsx           # Dashboard cho staff (5 tabs)
│   ├── SecurityDashboard.tsx        # Dashboard cho security (3 tabs)
│   ├── AdminDashboard.tsx           # Dashboard cho admin (nâng cấp)
│   ├── BookingApprovals.tsx         # Staff: Approve/reject bookings
│   ├── UserManagement.tsx           # Admin: Manage users
│   ├── AdvancedStatistics.tsx       # Admin: Analytics
│   ├── Login.tsx                    # Login với creator buttons
│   ├── AdminAccountCreator.tsx      # Tạo admin accounts
│   ├── StaffAccountCreator.tsx      # Tạo staff accounts
│   ├── SecurityAccountCreator.tsx   # Tạo security accounts
│   └── ...
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Main backend với tất cả APIs
│           └── kv_store.tsx         # KV store utilities
├── lib/
│   ├── api.ts                       # Frontend API calls
│   └── timeSlots.ts                 # Time slot utilities
└── DEMO_ACCOUNTS.md                 # Danh sách tất cả accounts
```

## 🔌 API Endpoints

### Auth
- `POST /signup` - Đăng ký user mới
- `POST /signin` - Đăng nhập

### Rooms
- `GET /rooms` - Lấy danh sách phòng
- `POST /rooms` - Tạo phòng mới (admin)
- `PUT /rooms/:id` - Cập nhật phòng (admin)
- `DELETE /rooms/:id` - Xóa phòng (admin)

### Bookings
- `GET /bookings` - Lấy tất cả bookings
- `POST /bookings` - Tạo booking mới
- `PUT /bookings/:id` - Cập nhật booking
- `DELETE /bookings/:id` - Xóa booking
- `PUT /bookings/:id/approve` - Approve booking (staff)
- `PUT /bookings/:id/reject` - Reject booking (staff)

### Tasks
- `GET /tasks` - Lấy danh sách tasks
- `POST /tasks` - Tạo task mới (staff)
- `PUT /tasks/:id` - Cập nhật task (security)

### Reports
- `GET /reports` - Lấy danh sách reports
- `POST /reports` - Tạo report mới (security)
- `PUT /reports/:id` - Xử lý report (staff)

### Users (Admin only)
- `GET /users` - Lấy danh sách users
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user

### Statistics (Admin only)
- `GET /stats/rooms` - Top rooms statistics
- `GET /stats/timeslots` - Top timeslots statistics
- `GET /stats/categories` - Category statistics
- `GET /stats/usage` - Usage by role

## 🎨 Design System

### Colors
- **Primary**: Orange (#F97316) - Brand color
- **Student**: Blue (#3B82F6)
- **Lecturer**: Purple (#8B5CF6)
- **Staff**: Green (#10B981)
- **Security**: Cyan (#06B6D4)
- **Admin**: Orange (#F97316)

### Status Colors
- **Pending**: Yellow
- **Approved**: Green
- **Rejected**: Red
- **Cancelled**: Gray

## 🔐 Security

- Email phải có domain `@fpt.edu.vn` hoặc `@fe.edu.vn`
- Passwords được hash bởi Supabase Auth
- Role-based access control (RBAC)
- Protected routes theo role
- Service role key chỉ dùng ở backend

## 📱 Responsive Design

- Mobile-friendly interface
- Adaptive layouts cho tất cả screen sizes
- Touch-friendly buttons và interactions

## 🚧 Future Enhancements

- [ ] Email notifications (requires SMTP setup)
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Room availability calendar với drag & drop
- [ ] Recurring bookings
- [ ] QR code check-in cho security
- [ ] Advanced filtering và sorting
- [ ] Export reports (PDF/Excel)
- [ ] Integration với Google Calendar
- [ ] AI-powered room recommendations

## 📞 Support & Documentation

- **Demo Accounts**: [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md)
- **Staff Guide**: [STAFF_GUIDE.md](./STAFF_GUIDE.md) - Chi tiết cho vai trò Staff
- **Security Guide**: [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) - Chi tiết cho vai trò Security
- **API Documentation**: Xem comments trong `/supabase/functions/server/index.tsx`
- **Frontend API**: Xem `/api/api.ts`

## 🏆 Credits

Developed for **FPTU HCM** with ❤️

**Version**: 2.0  
**Last Updated**: December 9, 2025  
**Major Update**: Added Staff & Security roles với full workflow automation