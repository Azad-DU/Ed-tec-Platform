const axios = require('axios');

async function testCreateCourse() {
  try {
    // 1. Login as Admin
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@edtech.bd',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('Login successful as Admin');

    // 2. Create Course
    const courseRes = await axios.post('http://localhost:5000/api/admin/courses', {
      title: 'Admin Created Course',
      description: 'Testing creation as admin',
      price: 100,
      currency: 'BDT',
      difficulty_level: 'beginner',
      duration_hours: 10,
      is_free: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Create Course Result:', courseRes.data);

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testCreateCourse();
