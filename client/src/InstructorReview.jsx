import React, { useState, useEffect } from 'react';

function InstructorReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Courses/submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleReview = async (submissionId, status, feedback) => {
        try {
            const token = localStorage.getItem('token');
            feedback = feedback?.trim() ? feedback : "No feedback";
            const response = await fetch(`/api/Courses/review-submission/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                            body: JSON.stringify({ Status: status, Feedback: feedback })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Review submission error:', errorData);
                throw new Error('Failed to submit review');
            }

            await fetchSubmissions();
        } catch (err) {
            console.error(err);
        }
    };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="quiz-reviews">
      <h2>Quiz Submissions</h2>
            {submissions
                .filter(submission => submission.status !== 1 && submission.status !== 2)
                .map(submission => (
                    <div key={submission.id} className="submission-card p-4 border rounded mb-4">
                        <h3>Student Answer:</h3>
                        <p>{submission.answer}</p>
                        <textarea
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Provide feedback..."
                            onChange={(e) => submission.feedback = e.target.value}
                        />
                        <div className="mt-4">
                            <button
                                onClick={() => handleReview(submission.id, 1, submission.feedback)}
                                className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Pass
                            </button>
                            <button
                                onClick={() => handleReview(submission.id, 2, submission.feedback)}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Fail
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default InstructorReview;
