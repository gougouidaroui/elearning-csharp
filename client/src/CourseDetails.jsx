import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams(); // Course ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
      const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/Courses/${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course details.");
        }

        const data = await response.json();
        setCourse(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

    const abbreviateText = (text, maxLength = 150) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };
    const handleTakeQuiz = () => {
        navigate(`/quiz/${id}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="course-details-container">
            <article className="course-details-article">
                {/* Title */}
                <h1 className="course-title">{course.title}</h1>

                {/* Instructor */}
                <p className="course-instructor">
                    <strong>Instructor:</strong> {course.instructor}
                </p>

                {/* Abbreviated Description */}
                <p className="course-description">
                    <strong>About this course:</strong> {abbreviateText(course.description)}
                </p>

                {/* Course Content */}
                <section className="course-content">
                    <h2>Course Content</h2>
                    {course.content && course.content.length > 0 ? (
                        <p>{course.content}</p>
                    ) : (
                            <p>No content available for this course.</p>
                        )}
                </section>
                <button className="take-quiz-button" onClick={handleTakeQuiz}>
                    Take Quiz
                </button>
            </article>
    </div>
  );
};

export default CourseDetails;
