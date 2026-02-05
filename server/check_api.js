const axios = require('axios');

async function checkApi() {
  try {
    const response = await axios.get('http://localhost:5000/api/courses');
    const courses = response.data.data;
    console.log('Total courses:', courses.length);
    if (courses.length > 0) {
      console.log('Most recent course:', {
        id: courses[0].course_id,
        title: courses[0].title,
        mentor_name: courses[0].mentor_name,
        instructor_name: courses[0].instructor_name
      });
    }
  } catch (error) {
    console.error('Error fetching API:', error.message);
  }
}

checkApi();
