import React, { useEffect, useState } from 'react';
import './Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch courses from the backend API
    fetch('/api/Courses', {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        return response.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/Courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Failed to enroll in course');
      }

      const data = await response.json();
      setMessage(`Successfully enrolled in course: ${data.Message}`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="courses-container">
      <h2>Our Courses</h2>
      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <img src={course.imageUrl || 'default-image.jpg'} alt={course.title} />
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p><strong>Instructor:</strong> {course.instructor}</p>
            <button onClick={() => handleEnroll(course.id)}>Enroll Now</button>
          </div>
        ))}
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default Courses;

