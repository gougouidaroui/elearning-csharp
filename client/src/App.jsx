import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Courses from './Courses';
import Register from './Register';
import useUserRoles from "./hooks/roles";
import useAuth from './auth';
import CourseManagement from './Course';
import EnrolledCourses from './EnrolledCourses';
import CourseDetails from './CourseDetails';
import QuizSubmission from './QuizSubmission';
import InstructorReview from './InstructorReview';

function App() {
    const { isAuthenticated, loading } = useAuth();
    const isAdmin = useUserRoles();

    if (loading) {
        return <div>Loading...</div>;
    }
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <>
            <header>
                <ul>
                    <li><a href="/"><h1>Elearning</h1></a></li>
                    {isAuthenticated ? (
                        <button onClick={handleLogout}>Logout</button>
                    ) : (
                            <>
                                <li><a href="login">login</a></li>
                                <li><a href="register">register</a></li>
                            </>
                        )}
                </ul>
            </header>
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/courses" element={<Courses />} />
                        {isAuthenticated ? (
                            <>
                                <Route path="/enrolled" element={<EnrolledCourses />} />
                                <Route path="/courses/:id" element={<CourseDetails />} />
                                <Route path="/quiz/:id" element={<QuizSubmission />} />
                            </>
                        ) : (
                                <>
                                </>
                            )}
                        {isAuthenticated && isAdmin ? (
                            <>
                                <Route path="/admin" element={<div>Admin Dashboard</div>} />
                                <Route path="/admin/course" element={<CourseManagement />} />
                                <Route path="/admin/review" element={<InstructorReview />} />
                            </>
                        ) : (
                                <Route path="/admin" element={<Home />} />
                            )}
                    </Routes>
                </div>
            </Router>
            <footer>
                <p>&copy; 2024 eLearning Platform. All rights reserved.</p>
                <ul>
                </ul>
            </footer>
        </>
    )
}

export default App
