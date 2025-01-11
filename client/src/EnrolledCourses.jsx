// EnrolledCourses.js
import React, { useEffect, useState } from 'react';
import './Courses.css';

function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }

      const data = await response.json();
      setEnrolledCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/Courses/complete/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark course as complete');
      }

      setMessage("Course marked as completed!");
      fetchEnrolledCourses(); // Refresh the list
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="courses-container">
      <h2>My Enrolled Courses</h2>
      <div className="courses-list">
        {enrolledCourses.map(enrollment => (
          <div key={enrollment.courseId} className="course-card">
            <img src={enrollment.course.imageUrl || 'default-image.jpg'} alt={enrollment.course.title} />
            <h3>{enrollment.course.title}</h3>
            <p>Status: {enrollment.status}</p>
            <p>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
            {enrollment.completionDate && (
              <p>Completed: {new Date(enrollment.completionDate).toLocaleDateString()}</p>
            )}
            {!enrollment.isCompleted && (
              <button onClick={() => handleMarkComplete(enrollment.courseId)}>
                Mark as Complete
              </button>
            )}
          </div>
        ))}
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default EnrolledCourses;
