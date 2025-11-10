# 🏪 Restaurant Database Schema

## Schema Definition

Tạo collection `restaurants` trong MongoDB với cấu trúc sau:

```javascript
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,        // Tên nhà hàng
      required: true,      // Bắt buộc
    },
    email: {
      type: String,        // Email đăng nhập
      unique: true,        // Không trùng lặp
      required: true,      // Bắt buộc
    },
    phoneNumber: {
      type: Number,        // Số điện thoại
    },
    address: {
      type: String,        // Địa chỉ
    },
    city: {
      type: String,        // Thành phố
    },
    password: {
      type: String,        // Mật khẩu đã mã hóa
      required: true,      // Bắt buộc
    },
    restaurantCode: {
      type: String,        // Mã nhà hàng
      unique: true,        // Không trùng lặp
      required: true,      // Bắt buộc
    },
    isActive: {
      type: Boolean,       // Trạng thái hoạt động
      default: true,       // Mặc định: true
    },
    rating: {
      type: Number,        // Đánh giá
      default: 0,          // Mặc định: 0
    },
    totalOrders: {
      type: Number,        // Tổng đơn hàng
      default: 0,          // Mặc định: 0
    },
  },
  { timestamps: true }   // Tự động tạo createdAt, updatedAt
);
```

## Các thuộc tính:

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| **name** | String | ✅ | ❌ | - | Tên nhà hàng |
| **email** | String | ✅ | ✅ | - | Email đăng nhập |
| **phoneNumber** | Number | ❌ | ❌ | - | Số điện thoại |
| **address** | String | ❌ | ❌ | - | Địa chỉ |
| **city** | String | ❌ | ❌ | - | Thành phố |
| **password** | String | ✅ | ❌ | - | Mật khẩu (bcrypt hashed) |
| **restaurantCode** | String | ✅ | ✅ | - | Mã nhà hàng duy nhất |
| **isActive** | Boolean | ❌ | ❌ | true | Trạng thái hoạt động |
| **rating** | Number | ❌ | ❌ | 0 | Đánh giá trung bình |
| **totalOrders** | Number | ❌ | ❌ | 0 | Tổng số đơn hàng |
| **createdAt** | Date | Auto | ❌ | Now | Thời gian tạo |
| **updatedAt** | Date | Auto | ❌ | Now | Thời gian cập nhật |

## Cách tạo database:

### Bước 1: Chạy seed script

```bash
cd database
node seed-restaurants.js
```

### Bước 2: Xác nhận kết quả

Script sẽ tạo 3 nhà hàng mẫu:

```
✅ Connected to MongoDB
✅ Inserted 3 restaurants successfully!

📋 Sample Restaurant Login Credentials:
==========================================

1. FoodFast Kitchen - District 1
   Email: district1@foodfast.com
   Password: RESTAURANT2024
   Code: FFKD1

2. FoodFast Kitchen - District 3
   Email: district3@foodfast.com
   Password: RESTAURANT2024
   Code: FFKD3

3. FoodFast Kitchen - Binh Thanh
   Email: binhthanh@foodfast.com
   Password: RESTAURANT2024
   Code: FFKBT

==========================================
```

## Ví dụ document trong MongoDB:

```json
{
  "_id": ObjectId("673123456789abcdef123456"),
  "name": "FoodFast Kitchen - District 1",
  "email": "district1@foodfast.com",
  "phoneNumber": 901234567,
  "address": "123 Nguyen Hue Street, Ben Nghe Ward",
  "city": "Ho Chi Minh City",
  "password": "$2b$12$abcdefghijklmnopqrstuvwxyz...",
  "restaurantCode": "FFKD1",
  "isActive": true,
  "rating": 0,
  "totalOrders": 0,
  "createdAt": ISODate("2025-11-10T10:00:00.000Z"),
  "updatedAt": ISODate("2025-11-10T10:00:00.000Z")
}
```

## Indexes tự động:

MongoDB sẽ tự động tạo indexes cho:
- `_id` (unique, auto)
- `email` (unique)
- `restaurantCode` (unique)

## Lưu ý:

1. **phoneNumber** dùng type `Number` thay vì `String` để dễ validate
2. **password** phải được hash bằng bcrypt trước khi lưu
3. **restaurantCode** phải unique để mỗi nhà hàng có mã riêng
4. **timestamps: true** tự động thêm `createdAt` và `updatedAt`
