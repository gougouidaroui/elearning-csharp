import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login'; // import the Login component
import Home from './Home';
import Courses from './Courses';
import Register from './Register';
import useUserRoles from "./hooks/roles";
import useAuth from './auth';
import CourseManagement from './Course';

function App() {
    const { isAuthenticated, loading } = useAuth();
    const isAdmin = useUserRoles();


    if (loading) {
        return <div>Loading...</div>;
    }
    const handleLogout = () => {
        // Clear token from local storage on logout
        localStorage.removeItem('token');
        window.location.href = '/'; // Redirect to home or login page
    };

  return (
    <>
            <header>
                <ul>
                    <li><a href="/"><h1>Elearning</h1></a></li>
                     {isAuthenticated ? (
                            <button onClick={handleLogout}>Logout</button> // Show logout button if authenticated
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
                        {/* Add other routes here as your app grows */}
                                                {/* Admin-only routes */}
                        {isAuthenticated && isAdmin ? (
                            <>
                                {/* Admin routes only accessible to Admin */}
                                <Route path="/admin" element={<div>Admin Dashboard</div>} />
                                <Route path="/admin/course" element={<CourseManagement />} />
                                {/* Add other admin-specific routes here */}
                            </>
                        ) : (
                            // Redirect non-admin users to home or another page
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
