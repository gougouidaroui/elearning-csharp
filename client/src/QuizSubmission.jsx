// QuizSubmission.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function QuizSubmission() {
    const [answer, setAnswer] = useState('');
    const { id } = useParams(); // Course ID from URL
    const [course, setCourse] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/Courses/submit-quiz/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(answer)
            });

            if (!response.ok) {
                throw new Error('Failed to submit quiz');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return <div>Loading quiz...</div>;
    }

    if (success) {
        return <div className="success-message">Quiz submitted successfully! Awaiting instructor review.</div>;
    }

    return (
        <div className="quiz-submission">
            <h3>Course Quiz</h3>
            <div className="quiz-question">
                <p>{course.quiz}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    required
                    className="w-full p-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
}

export default QuizSubmission;
