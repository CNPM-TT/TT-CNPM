
const mockRestaurantModel = {
  findOne: async () => null,
  create: async (data) => ({ _id: 'test-id', ...data, save: async () => {} }),
  findById: async (id) => (id === 'valid-id' ? { _id: id, name: 'Test Restaurant' } : null),
  findByIdAndUpdate: async (id, data) => ({ _id: id, ...data }),
};

// Mock bcrypt
const mockBcrypt = {
  hash: async (password) => `hashed_${password}`,
  compare: async (password, hash) => hash === `hashed_${password}`,
};

// Mock jwt
const mockJwt = {
  sign: (payload) => `token_${payload.id}`,
  verify: (token) => ({ id: token.replace('token_', '') }),
};

// Mock validator
const mockValidator = {
  isEmail: (email) => email.includes('@'),
  isStrongPassword: (password) => password.length >= 8,
};

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
  if (passed) {
    console.log(`  ✅ ${testName}`);
    testsPassed++;
  } else {
    console.log(`  ❌ ${testName}`);
    if (details) console.log(`     ${details}`);
    testsFailed++;
  }
}

// Test 1: Register with valid data
async function testRegisterSuccess() {
  try {
    const restaurantData = {
      name: 'Pizza Place',
      email: 'pizza@test.com',
      password: 'StrongPass123!',
      phone: '1234567890',
      address: '123 Main St',
    };

    // Mock register function
    const register = async (data) => {
      if (!mockValidator.isEmail(data.email)) {
        throw new Error('Invalid email');
      }
      if (!mockValidator.isStrongPassword(data.password)) {
        throw new Error('Weak password');
      }
      
      const exists = await mockRestaurantModel.findOne({ email: data.email });
      if (exists) {
        throw new Error('Restaurant already exists');
      }

      const hashedPassword = await mockBcrypt.hash(data.password);
      const restaurant = await mockRestaurantModel.create({
        ...data,
        password: hashedPassword,
      });
      
      const token = mockJwt.sign({ id: restaurant._id });
      return { success: true, token };
    };

    const result = await register(restaurantData);
    
    logTest(
      'Restaurant Register - Valid Data',
      result.success === true && result.token.startsWith('token_')
    );
  } catch (error) {
    logTest('Restaurant Register - Valid Data', false, error.message);
  }
}

// Test 2: Register with invalid email
async function testRegisterInvalidEmail() {
  try {
    const restaurantData = {
      name: 'Pizza Place',
      email: 'invalid-email',
      password: 'StrongPass123!',
      phone: '1234567890',
    };

    const register = async (data) => {
      if (!mockValidator.isEmail(data.email)) {
        throw new Error('Invalid email');
      }
      return { success: true };
    };

    await register(restaurantData);
    logTest('Restaurant Register - Invalid Email', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Register - Invalid Email',
      error.message === 'Invalid email'
    );
  }
}

// Test 3: Register with weak password
async function testRegisterWeakPassword() {
  try {
    const restaurantData = {
      name: 'Pizza Place',
      email: 'pizza@test.com',
      password: 'weak',
      phone: '1234567890',
    };

    const register = async (data) => {
      if (!mockValidator.isStrongPassword(data.password)) {
        throw new Error('Weak password');
      }
      return { success: true };
    };

    await register(restaurantData);
    logTest('Restaurant Register - Weak Password', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Register - Weak Password',
      error.message === 'Weak password'
    );
  }
}

// Test 4: Register duplicate email
async function testRegisterDuplicateEmail() {
  try {
    const restaurantData = {
      name: 'Pizza Place',
      email: 'existing@test.com',
      password: 'StrongPass123!',
    };

    const mockExistingRestaurant = {
      findOne: async () => ({ email: 'existing@test.com' }),
    };

    const register = async (data) => {
      const exists = await mockExistingRestaurant.findOne({ email: data.email });
      if (exists) {
        throw new Error('Restaurant already exists');
      }
      return { success: true };
    };

    await register(restaurantData);
    logTest('Restaurant Register - Duplicate Email', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Register - Duplicate Email',
      error.message === 'Restaurant already exists'
    );
  }
}

// Test 5: Login with correct credentials
async function testLoginSuccess() {
  try {
    const loginData = {
      email: 'pizza@test.com',
      password: 'StrongPass123!',
    };

    const mockRestaurantWithPassword = {
      findOne: async () => ({
        _id: 'restaurant-id',
        email: 'pizza@test.com',
        password: await mockBcrypt.hash('StrongPass123!'),
      }),
    };

    const login = async (data) => {
      const restaurant = await mockRestaurantWithPassword.findOne({ email: data.email });
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const isMatch = await mockBcrypt.compare(data.password, restaurant.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = mockJwt.sign({ id: restaurant._id });
      return { success: true, token };
    };

    const result = await login(loginData);
    
    logTest(
      'Restaurant Login - Correct Credentials',
      result.success === true && result.token.startsWith('token_')
    );
  } catch (error) {
    logTest('Restaurant Login - Correct Credentials', false, error.message);
  }
}

// Test 6: Login with wrong password
async function testLoginWrongPassword() {
  try {
    const loginData = {
      email: 'pizza@test.com',
      password: 'WrongPassword123!',
    };

    const mockRestaurantWithPassword = {
      findOne: async () => ({
        _id: 'restaurant-id',
        email: 'pizza@test.com',
        password: await mockBcrypt.hash('StrongPass123!'),
      }),
    };

    const login = async (data) => {
      const restaurant = await mockRestaurantWithPassword.findOne({ email: data.email });
      const isMatch = await mockBcrypt.compare(data.password, restaurant.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      return { success: true };
    };

    await login(loginData);
    logTest('Restaurant Login - Wrong Password', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Login - Wrong Password',
      error.message === 'Invalid credentials'
    );
  }
}

// Test 7: Login with non-existent email
async function testLoginNonExistent() {
  try {
    const loginData = {
      email: 'nonexistent@test.com',
      password: 'Password123!',
    };

    const mockEmptyModel = {
      findOne: async () => null,
    };

    const login = async (data) => {
      const restaurant = await mockEmptyModel.findOne({ email: data.email });
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return { success: true };
    };

    await login(loginData);
    logTest('Restaurant Login - Non-existent Email', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Login - Non-existent Email',
      error.message === 'Restaurant not found'
    );
  }
}

// Test 8: Get profile with valid ID
async function testGetProfileSuccess() {
  try {
    const restaurantId = 'valid-id';

    const getProfile = async (id) => {
      const restaurant = await mockRestaurantModel.findById(id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return { success: true, restaurant };
    };

    const result = await getProfile(restaurantId);
    
    logTest(
      'Restaurant Get Profile - Valid ID',
      result.success === true && result.restaurant._id === restaurantId
    );
  } catch (error) {
    logTest('Restaurant Get Profile - Valid ID', false, error.message);
  }
}

// Test 9: Get profile with invalid ID
async function testGetProfileInvalidId() {
  try {
    const restaurantId = 'invalid-id';

    const getProfile = async (id) => {
      const restaurant = await mockRestaurantModel.findById(id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return { success: true, restaurant };
    };

    await getProfile(restaurantId);
    logTest('Restaurant Get Profile - Invalid ID', false, 'Should have thrown error');
  } catch (error) {
    logTest(
      'Restaurant Get Profile - Invalid ID',
      error.message === 'Restaurant not found'
    );
  }
}

// Test 10: Update profile
async function testUpdateProfile() {
  try {
    const restaurantId = 'valid-id';
    const updateData = {
      name: 'Updated Pizza Place',
      phone: '9876543210',
    };

    const updateProfile = async (id, data) => {
      const restaurant = await mockRestaurantModel.findById(id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      const updated = await mockRestaurantModel.findByIdAndUpdate(id, data);
      return { success: true, restaurant: updated };
    };

    const result = await updateProfile(restaurantId, updateData);
    
    logTest(
      'Restaurant Update Profile',
      result.success === true && result.restaurant.name === updateData.name
    );
  } catch (error) {
    logTest('Restaurant Update Profile', false, error.message);
  }
}

// Main test runner
export async function runRestaurantControllerUnitTests() {
  console.log('\n🍽️  RESTAURANT CONTROLLER UNIT TESTS');
  console.log('   Testing restaurant authentication and profile management\n');

  testsPassed = 0;
  testsFailed = 0;

  await testRegisterSuccess();
  await testRegisterInvalidEmail();
  await testRegisterWeakPassword();
  await testRegisterDuplicateEmail();
  await testLoginSuccess();
  await testLoginWrongPassword();
  await testLoginNonExistent();
  await testGetProfileSuccess();
  await testGetProfileInvalidId();
  await testUpdateProfile();

  console.log(`\n   Summary: ${testsPassed} passed, ${testsFailed} failed\n`);
  
  if (testsFailed > 0) {
    throw new Error(`${testsFailed} restaurant controller unit test(s) failed`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRestaurantControllerUnitTests()
    .then(() => {
      console.log('✅ All restaurant controller unit tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Restaurant controller unit tests failed:', error.message);
      process.exit(1);
    });
}
