const axios = require('axios');

async function testCreateCourse() {
  try {
    // 1. Login as Instructor
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'instructor@edtech.bd',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('Login successful, token:', token.substring(0, 10) + '...');

    // 2. Create Course
    const courseRes = await axios.post('http://localhost:5000/api/admin/courses', {
      title: 'Instructor Course Test',
      description: 'Testing creation as instructor',
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
