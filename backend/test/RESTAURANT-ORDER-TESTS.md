# Restaurant Order Filtering Tests

This directory contains comprehensive tests for the restaurant-specific order filtering feature.

## Overview

The restaurant order filtering system allows:
- Orders with items from multiple restaurants to be tracked separately
- Each restaurant to see only orders containing their items
- Each restaurant to update only their portion of the order status
- Automatic aggregation of restaurant statuses to determine overall order status

## Test Structure

### Unit Tests

**File:** `unit/restaurant-order.controller.unit.test.js`

Tests isolated functions with mocked dependencies (no database or network calls).

**Test Coverage:**
1. ✅ **Extract Restaurant IDs** - Extracts unique restaurant IDs from order items
2. ✅ **Initialize Restaurant Status** - Creates status Map for each restaurant
3. ✅ **Place Multi-Restaurant Order** - Creates order with multiple restaurants
4. ✅ **Get Restaurant Orders Filtering** - Filters orders by restaurant ID
5. ✅ **Update Status Permission Check** - Verifies restaurants can only update their portion
6. ✅ **Order Status Aggregation** - Tests status progression across all restaurants
7. ✅ **Unauthorized Access** - Blocks access without authentication

**Run Unit Tests:**
```bash
# Run only restaurant order unit tests
node backend/test/unit/restaurant-order.controller.unit.test.js

# Run all unit tests
npm run test:unit
```

### Integration Tests

**File:** `integration/restaurant-order.test.js`

Tests complete workflows with real API calls and database interactions.

**Test Coverage:**
1. ✅ **Place Multi-Restaurant Order** - Creates order via API with items from 3 restaurants
2. ✅ **Verify Multi-Restaurant Order** - Confirms payment and order creation
3. ✅ **Get Restaurant 1 Orders** - Restaurant 1 sees the order
4. ✅ **Get Restaurant 2 Orders** - Restaurant 2 sees the order
5. ✅ **Get Restaurant 3 Orders** - Restaurant 3 sees the order
6. ✅ **Restaurant 1 Update Status** - Updates status to "Preparing"
7. ✅ **Unauthorized Status Update** - Each restaurant updates only their status
8. ✅ **Complete Order Flow** - Full lifecycle from "Food Processing" to "Delivered"
9. ✅ **Unauthorized Access** - Blocks access without token

**Run Integration Tests:**
```bash
# Make sure backend server is running first!
npm run dev

# In another terminal:
# Run only restaurant order integration tests
node backend/test/integration/restaurant-order.test.js

# Run all integration tests
npm run test
```

## Test Data Setup

Integration tests automatically create:
- 1 test user account
- 3 test restaurant accounts
- 3 test food items (one per restaurant)
- 1 multi-restaurant order

All test data is cleaned up after tests complete.

## Expected Results

### Unit Tests
```
============================================================
📊 Restaurant Order Unit Test Summary:
   ✅ Passed: 7
   ❌ Failed: 0
   📝 Total:  7
============================================================
```

### Integration Tests
```
============================================================
📊 Restaurant Order Integration Test Summary:
   ✅ Passed: 9
   ❌ Failed: 0
   📝 Total:  9
============================================================
```

## Key Features Tested

### 1. Restaurant ID Extraction
```javascript
// Order items contain restaurantId field
items: [
  { name: "Pizza", restaurantId: "rest1" },
  { name: "Burger", restaurantId: "rest2" },
]

// Extracted unique IDs: ["rest1", "rest2"]
```

### 2. Restaurant Status Tracking
```javascript
// Each restaurant has independent status
restaurantStatus: {
  "rest1": "Preparing",
  "rest2": "Ready for Pickup",
  "rest3": "Food Processing"
}
```

### 3. Status Aggregation Logic
- If ANY restaurant is "Preparing" → Main status: "Preparing"
- If ANY restaurant is "Ready for Pickup" → Main status: "Ready for Pickup"
- If ANY restaurant is "Out for Delivery" → Main status: "Out for Delivery"
- If ALL restaurants are "Delivered" → Main status: "Delivered"

### 4. Permission Control
- Restaurant can only update their own status
- Restaurant can only see orders containing their items
- 403 error if trying to update another restaurant's portion

## CI/CD Integration

Tests run automatically on:
- Pull requests to main branch
- Pushes to milestone/ci-setup branch
- Manual workflow dispatch

## Troubleshooting

**Integration tests fail with connection error:**
- Make sure backend server is running on correct port
- Check `.env` file has correct database credentials
- Verify `DOMAIN` environment variable is set

**Unit tests fail:**
- Unit tests should never fail due to external factors
- Check for syntax errors in test file
- Ensure all imports are correct

**Test cleanup fails:**
- Check database connection
- Manually delete test data if needed:
  ```javascript
  // In MongoDB
  db.users.deleteMany({ email: /test_rest_order_/ })
  db.restaurants.deleteMany({ email: /test_rest/ })
  db.orders.deleteMany({ /* test orders */ })
  ```

## Test Maintenance

When adding new features:
1. Add unit test for isolated logic
2. Add integration test for API endpoints
3. Update this README with new test cases
4. Run all tests before committing:
   ```bash
   npm run test:unit && npm run test
   ```

## Related Documentation

- [Testing Guide](../../docs/TESTING-GUIDE.md)
- [Restaurant Auth Guide](../../docs/RESTAURANT-AUTH-GUIDE.md)
- [API Documentation](../../docs/API.md)
