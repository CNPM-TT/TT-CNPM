# Restaurant Panel - FoodFast Delivery

Giao diện quản lý cho nhà hàng để:
- Nhận đơn hàng từ khách hàng
- Quản lý tiến trình nấu món ăn
- Cập nhật trạng thái món ăn (Received → Preparing → Ready → Drone Dispatched)
- Chuẩn bị món ăn cho drone giao hàng

## Chạy Restaurant Panel

```bash
cd restaurant
npm install
npm run dev
```

Restaurant Panel sẽ chạy tại: http://localhost:5175

## Tính năng

- **Kitchen Dashboard**: Xem tổng quan đơn hàng cần xử lý
- **New Orders**: Danh sách đơn hàng mới
- **In Progress**: Món đang nấu
- **Ready for Pickup**: Món đã sẵn sàng cho drone
- **Completed Orders**: Lịch sử đơn đã giao
