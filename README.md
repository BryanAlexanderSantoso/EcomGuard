# 🛡️ SellerGuard - Ecosystem Anti-Fraud untuk UMKM Indonesia

Platform terintegrasi untuk melindungi seller, buyer, dan admin dari penipuan retur paket di marketplace online.

![SellerGuard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Database](https://img.shields.io/badge/Database-100%25%20Integrated-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green)

---

## ✨ Fitur Utama

### 🛍️ Untuk Seller
- ✅ Upload bukti video packing
- ✅ Database blacklist pembeli nakal
- ✅ Statistik win rate & revenue protection
- ✅ Laporan komunitas real-time

### 👤 Untuk Buyer
- ✅ Panduan unboxing yang benar
- ✅ Scan QR code untuk verifikasi
- ✅ Kirim bukti instan ke seller
- ✅ Trust score tracking

### 🛡️ Untuk Admin
- ✅ Review sengketa seller vs buyer
- ✅ Verifikasi laporan blacklist
- ✅ Global security audit
- ✅ Real-time monitoring

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd SellerGuard
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Jalankan Migrasi Database
```bash
npm run migrate
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Integration

**Status: ✅ 100% Integrated**

Semua data di landing page dan dashboard untuk semua role sekarang **fully integrated** dengan database Supabase.

### Tabel Database
- `profiles` - User profiles (seller, buyer, admin)
- `orders` - Order tracking & management
- `evidences` - Video packing & unboxing
- `blacklist` - Verified fraud reports
- `disputes` - Buyer-seller disputes
- `stats` - Global statistics

### Lihat Dokumentasi Lengkap
- 📖 [QUICK_START.md](./QUICK_START.md) - Panduan cepat 5 menit
- 📋 [RINGKASAN_PERBAIKAN.md](./RINGKASAN_PERBAIKAN.md) - Summary lengkap
- 🔧 [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) - Detail teknis

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16.1.1 (React 19)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 📁 Struktur Project

```
SellerGuard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── seller/            # Seller dashboard
│   │   ├── buyer/             # Buyer dashboard
│   │   ├── admin/             # Admin dashboard
│   │   └── blacklist/         # Blacklist pages
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts (Auth)
│   └── lib/                   # Utilities (Supabase client)
├── supabase/
│   └── migrations/            # Database migrations
├── scripts/
│   └── migrate.sh            # Migration helper
└── public/                    # Static assets
```

---

## 🔐 Authentication & Roles

### Role-Based Access Control (RBAC)
- **Seller**: Akses dashboard seller, upload evidence, report blacklist
- **Buyer**: Akses dashboard buyer, submit disputes, view orders
- **Admin**: Full access, verify reports, resolve disputes

### Protected Routes
Semua dashboard dilindungi dengan `ProtectedRoute` component yang memeriksa role user.

---

## 🎨 Design System

### Colors
- **Primary**: Emerald Green (#10b981)
- **Secondary**: Blue (#3b82f6)
- **Danger**: Rose (#f43f5e)
- **Warning**: Amber (#f59e0b)

### Components
- Glass-morphism cards
- Smooth animations
- Dark mode support
- Responsive design (mobile-first)

---

## 📈 Features Roadmap

### ✅ Completed
- [x] Landing page dengan stats real-time
- [x] Seller dashboard dengan analytics
- [x] Buyer dashboard dengan order tracking
- [x] Admin dashboard dengan mediation panel
- [x] Blacklist system dengan community reports
- [x] Database integration 100%
- [x] Real-time updates
- [x] Auto-increment statistics

### 🚧 In Progress
- [ ] Video upload & storage
- [ ] QR code generation & scanning
- [ ] Email notifications
- [ ] Export reports (PDF)

### 📋 Planned
- [ ] Mobile app (React Native)
- [ ] AI fraud detection
- [ ] Multi-language support
- [ ] Payment integration

---

## 🧪 Testing

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Run database migrations |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Developer**: Bryan Santoso
- **Database**: Supabase
- **Hosting**: Malas Hosting

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: Open GitHub issue
- **Email**: support@sellerguard.com

---

## 🎉 Acknowledgments

- Next.js team for amazing framework
- Supabase for powerful backend
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations

---

**Made with ❤️ for UMKM Indonesia**

© 2026 SellerGuard. All rights reserved.
