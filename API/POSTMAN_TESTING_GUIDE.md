# 📋 Panduan Testing Postman - Halo Optom API

## 🚀 Overview

Dokumentasi ini adalah panduan lengkap untuk melakukan testing API Halo Optom menggunakan Postman. Panduan ini mencakup semua flow pasien, testing pembayaran dengan Xendit, dan validasi fitur-fitur utama aplikasi.

## 📦 Prerequisites

### 1. Setup Environment
- ✅ Server backend berjalan di `http://localhost:4000`
- ✅ Database PostgreSQL aktif
- ✅ Redis server aktif
- ✅ Postman aplikasi terinstall

### 2. Import Files ke Postman
1. **Import Collection**: `Halo-Optom-API.postman_collection.json`
2. **Import Environment**: `Halo-Optom-Environment.postman_environment.json`
3. **Set Active Environment**: Pilih "Halo Optom Environment"

### 3. Environment Variables Setup
```json
{
  "base_url": "http://localhost:4000",
  "auth_token": "",
  "user_id": "",
  "appointment_id": "",
  "order_id": "",
  "product_id": "",
  "room_id": "",
  "xendit_webhook_token": "your-xendit-webhook-token"
}
```

---

## 🔐 1. Testing Flow Authentication

### 1.1 Register Pasien Baru

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+6281234567890"
}
```

**Expected Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "patient"
  }
}
```

**Validation Points**:
- ✅ Status code: 201
- ✅ Response contains user data
- ✅ Password tidak ter-expose di response
- ✅ Role default adalah "patient"

### 1.2 Login Pasien

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response** (200):
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "patient"
  }
}
```

**Post-Request Script** (Auto-save token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('auth_token', response.token);
    pm.environment.set('user_id', response.user.id);
}
```

**Validation Points**:
- ✅ Status code: 200
- ✅ JWT token diterima
- ✅ Token tersimpan di environment variable
- ✅ User ID tersimpan untuk request selanjutnya

---

## 👩‍⚕️ 2. Testing Flow Appointment & Pembayaran

### 2.1 Lihat Jadwal Optometris

**Endpoint**: `GET /schedules`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

**Expected Response** (200):
```json
[
  {
    "id": "schedule-uuid",
    "optometrist": {
      "id": "optometrist-uuid",
      "name": "Dr. Jane Smith",
      "specialization": "Optometri"
    },
    "date": "2024-01-20",
    "start_time": "09:00",
    "end_time": "10:00",
    "is_available": true
  }
]
```

### 2.2 Buat Appointment Baru

**Endpoint**: `POST /appointments`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

**Request Body**:
```json
{
  "optometrist_id": "optometrist-uuid-from-schedule",
  "schedule_id": "schedule-uuid-from-above",
  "type": "consultation",
  "method": "video",
  "notes": "Mata sering berair dan kabur"
}
```

**Expected Response** (201):
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": "appointment-uuid",
    "patient_id": "patient-uuid",
    "optometrist_id": "optometrist-uuid",
    "type": "consultation",
    "method": "video",
    "status": "pending",
    "payment_status": "unpaid",
    "notes": "Mata sering berair dan kabur",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Post-Request Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('appointment_id', response.appointment.id);
}
```

### 2.3 Simulasi Pembayaran Appointment (Xendit Webhook)

**Endpoint**: `POST /payment-appointment/xendit-webhook`

**Headers**:
```
Content-Type: application/json
X-CALLBACK-TOKEN: {{xendit_webhook_token}}
```

**Request Body**:
```json
{
  "id": "invoice-appointment-123",
  "external_id": "appointment-{{appointment_id}}-1640995200000",
  "user_id": "{{user_id}}",
  "status": "PAID",
  "merchant_name": "Halo Optom",
  "amount": 150000,
  "paid_amount": 150000,
  "paid_at": "2024-01-15T10:30:00.000Z",
  "payer_email": "john.doe@example.com",
  "description": "Pembayaran konsultasi optometri",
  "currency": "IDR",
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "BCA"
}
```

**Expected Response** (200):
```json
{
  "message": "Xendit webhook processed successfully",
  "appointment_id": "appointment-uuid",
  "payment_status": "paid",
  "xendit_invoice_id": "invoice-appointment-123",
  "amount": 150000,
  "paid_amount": 150000,
  "paid_at": "2024-01-15T10:30:00.000Z"
}
```

### 2.4 Verifikasi Status Appointment

**Endpoint**: `GET /appointments`

**Expected Response** - Appointment status berubah:
```json
[
  {
    "id": "appointment-uuid",
    "status": "confirmed",
    "payment_status": "paid",
    "video_room_id": "room-uuid-generated",
    "...": "other fields"
  }
]
```

**Validation Points**:
- ✅ `payment_status` berubah menjadi "paid"
- ✅ `video_room_id` ter-generate untuk video appointment
- ✅ Status appointment berubah sesuai business logic

---

## 🛒 3. Testing Flow Pembelian Produk

### 3.1 Lihat Katalog Produk

**Endpoint**: `GET /products`

**Expected Response** (200):
```json
[
  {
    "id": "product-uuid",
    "name": "Kacamata Anti Radiasi",
    "description": "Kacamata dengan lensa anti radiasi blue light",
    "price": 250000,
    "stock": 50,
    "category": "eyewear",
    "image_url": "https://example.com/image.jpg"
  }
]
```

### 3.2 Buat Order Produk

**Endpoint**: `POST /orders`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

**Request Body**:
```json
{
  "items": [
    {
      "product_id": "product-uuid-from-catalog",
      "quantity": 2
    },
    {
      "product_id": "another-product-uuid",
      "quantity": 1
    }
  ]
}
```

**Expected Response** (201):
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "order-uuid",
    "patient_id": "patient-uuid",
    "items": [
      {
        "product_id": "product-uuid",
        "quantity": 2,
        "price": 250000,
        "subtotal": 500000
      }
    ],
    "total": 500000,
    "status": "pending",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Post-Request Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('order_id', response.order.id);
}
```

### 3.3 Simulasi Pembayaran Order (Xendit Webhook)

**Endpoint**: `POST /payment-order/xendit-webhook`

**Headers**:
```
Content-Type: application/json
X-CALLBACK-TOKEN: {{xendit_webhook_token}}
```

**Request Body**:
```json
{
  "id": "invoice-order-456",
  "external_id": "order-{{order_id}}-1640995200000",
  "user_id": "{{user_id}}",
  "status": "PAID",
  "merchant_name": "Halo Optom",
  "amount": 500000,
  "paid_amount": 500000,
  "paid_at": "2024-01-15T11:30:00.000Z",
  "payer_email": "john.doe@example.com",
  "description": "Pembayaran pembelian kacamata",
  "currency": "IDR",
  "payment_method": "EWALLET",
  "payment_channel": "OVO"
}
```

**Expected Response** (200):
```json
{
  "message": "Xendit order webhook processed successfully",
  "order_id": "order-uuid",
  "status": "paid",
  "xendit_invoice_id": "invoice-order-456",
  "amount": 500000,
  "paid_amount": 500000,
  "paid_at": "2024-01-15T11:30:00.000Z"
}
```

### 3.4 Verifikasi Status Order

**Endpoint**: `GET /orders`

**Expected Response** - Order status berubah:
```json
[
  {
    "id": "order-uuid",
    "status": "paid",
    "total": 500000,
    "...": "other fields"
  }
]
```

---

## 💬 4. Testing Fitur Chat

### 4.1 Kirim Pesan

**Endpoint**: `POST /chat/{{room_id}}/message`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

**Request Body**:
```json
{
  "message": "Halo dokter, saya ingin konsultasi tentang mata saya",
  "to_user_id": "optometrist-uuid"
}
```

### 4.2 Ambil Riwayat Chat

**Endpoint**: `GET /chat/{{room_id}}/messages`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

---

## 🔔 5. Testing Notifikasi

### 5.1 Ambil Notifikasi User

**Endpoint**: `GET /notifications`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

### 5.2 Tandai Notifikasi Sudah Dibaca

**Endpoint**: `PUT /notifications/{{notification_id}}/read`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

---

## 📄 6. Testing Medical Records

### 6.1 Ambil Riwayat Medical Records

**Endpoint**: `GET /medical-records`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

### 6.2 Detail Medical Record

**Endpoint**: `GET /medical-records/{{medical_record_id}}`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

---

## ⭐ 7. Testing Review System

### 7.1 Buat Review untuk Optometris

**Endpoint**: `POST /reviews`

**Headers**:
```
Authorization: Bearer {{auth_token}}
```

**Request Body**:
```json
{
  "optometrist_id": "optometrist-uuid",
  "appointment_id": "{{appointment_id}}",
  "rating": 5,
  "comment": "Pelayanan sangat baik dan profesional"
}
```

### 7.2 Lihat Review Optometris

**Endpoint**: `GET /reviews/optometrist/{{optometrist_id}}`

---

## 🎥 8. Testing VideoSDK Integration

### 8.1 Buat Room Video

**Endpoint**: `POST /videosdk/room`

**Request Body**:
```json
{
  "customRoomId": "consultation-room-{{appointment_id}}"
}
```

### 8.2 Ambil Join Token

**Endpoint**: `GET /videosdk/token/{{room_id}}/{{participant_id}}`

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Patient Journey
1. ✅ Register → Login
2. ✅ Browse Schedules → Create Appointment
3. ✅ Simulate Payment → Verify Payment Status
4. ✅ Join Video Call (if video appointment)
5. ✅ Chat with Optometrist
6. ✅ Receive Medical Record
7. ✅ Give Review

### Scenario 2: Product Purchase Journey
1. ✅ Login
2. ✅ Browse Products → Create Order
3. ✅ Simulate Payment → Verify Order Status
4. ✅ Check Notifications

### Scenario 3: Error Handling
1. ❌ Invalid credentials
2. ❌ Unauthorized access
3. ❌ Invalid payment webhook signature
4. ❌ Expired/Failed payment status

---

## 🔧 Troubleshooting

### Common Issues

**1. Authentication Errors**
- Pastikan token tersimpan di environment variable
- Check token expiration
- Verify user role permissions

**2. Webhook Signature Errors**
- Pastikan `X-CALLBACK-TOKEN` header benar
- Verify webhook token di environment
- Check raw body format

**3. Database Errors**
- Pastikan PostgreSQL running
- Check database connection
- Verify migrations sudah dijalankan

**4. Payment Flow Issues**
- Verify external_id format: `{type}-{uuid}-{timestamp}`
- Check Xendit status mapping
- Ensure appointment/order exists before webhook

### Debug Tips

1. **Monitor Server Logs**
   ```bash
   # Check terminal output untuk error logs
   ```

2. **Postman Console**
   - Buka Postman Console untuk debug request/response
   - Check environment variables values

3. **Database Verification**
   ```sql
   -- Check appointment status
   SELECT id, status, payment_status FROM appointments WHERE id = 'uuid';
   
   -- Check order status
   SELECT id, status FROM orders WHERE id = 'uuid';
   ```

---

## 📊 Test Results Checklist

### Authentication ✅
- [ ] Register berhasil
- [ ] Login berhasil
- [ ] Token tersimpan
- [ ] Unauthorized access ditolak

### Appointments ✅
- [ ] List schedules berhasil
- [ ] Create appointment berhasil
- [ ] Payment webhook berhasil
- [ ] Status berubah ke "paid"
- [ ] Video room ter-generate (untuk video appointment)

### Orders ✅
- [ ] List products berhasil
- [ ] Create order berhasil
- [ ] Payment webhook berhasil
- [ ] Status berubah ke "paid"

### Additional Features ✅
- [ ] Chat system berfungsi
- [ ] Notifications berfungsi
- [ ] Medical records accessible
- [ ] Review system berfungsi
- [ ] VideoSDK integration berfungsi

---

## 🎯 Kesimpulan

Dokumentasi ini memberikan panduan lengkap untuk testing semua fitur utama Halo Optom API. Pastikan semua test case berhasil sebelum deployment ke production.

**Key Points:**
- ✅ Semua endpoint terintegrasi dengan authentication
- ✅ Payment flow dengan Xendit berfungsi dengan baik
- ✅ Real-time features (chat, notifications) aktif
- ✅ Business logic sesuai dengan flow pasien

**Next Steps:**
1. Jalankan automated testing dengan Postman Runner
2. Setup monitoring untuk production environment
3. Implement rate limiting untuk security
4. Add comprehensive logging untuk debugging

---

*Dokumentasi ini dibuat untuk memastikan kualitas dan reliability API Halo Optom sebelum go-live.*