import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Certificate.css';  // Style sheet for the page
import * as jwt_decode from 'jwt-decode';

const CertificatePage = () => {
  const { id } = useParams();  // Get course ID from URL
  const [courseDetails, setCourseDetails] = useState(null);

  // Fetch course details when component mounts
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/Courses/${id}`); // API request to get course details
        if (response.ok) {
          const data = await response.json();
          setCourseDetails(data);
        } else {
          console.error('Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    fetchCourseDetails();
  }, [id]);
const token = localStorage.getItem('token');
    const decoded = jwt_decode.jwtDecode(token).sub;
    console.log(decoded);

  if (!courseDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="certificate-container">
      <div className="certificate-header">
        <h1>Certificate of Completion</h1>
      </div>
      <div className="certificate-body">
        <p className="certificate-text">This is to certify that</p>
        <h2 className="user-name">{decoded}</h2>
        <p className="certificate-text">has successfully completed the course</p>
        <h3 className="course-name">{courseDetails.title}</h3>
      </div>
      <div className="certificate-footer">
        <p>Instructor: {courseDetails.instructor}</p>
        <p>eLearning App</p>
      </div>
    </div>
  );
};

export default CertificatePage;
