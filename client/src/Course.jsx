import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import * as jwt_decode from 'jwt-decode'; // Ensure this is installed
import './Course.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    quiz: '',
    imageUrl: ''
  });

  const getInstructorFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwt_decode.jwtDecode(token);
      return decoded.name || decoded.email || decoded.unique_name || decoded.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return `http://localhost:5029${data.imageUrl}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Courses/myCourses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const token = localStorage.getItem('token');
      const instructor = getInstructorFromToken();

      if (!instructor) {
        alert('Could not determine instructor. Please log in again.');
        return;
      }

      const endpoint = isEditing ? `/api/Courses/${currentCourse.id}` : '/api/Courses';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          instructor
        })
      });

      if (response.ok) {
        fetchCourses();
        setFormData({ title: '', description: '', content: '', quiz: '', imageUrl: '' });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setCurrentCourse(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/Courses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Form Section */}
      <div style={{backgroundColor: "var(--feeling-blue-4-hex)"}} className="rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Course' : 'Create New Course'}</h2>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Course Title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <textarea
            name="content"
            placeholder="Course Content"
            value={formData.content}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <textarea
            name="quiz"
            placeholder="Course Quiz"
            value={formData.quiz}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <label>
            Course Image:
            <input type="file" accept="image/*" onChange={handleImageChange} className="block mt-2" />
          </label>
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded-md" />}
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            {isEditing ? 'Update Course' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* Courses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{course.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setCurrentCourse(course);
                      setFormData({
                        title: course.title,
                        description: course.description,
                        imageUrl: course.imageUrl
                      });
                      setImagePreview(course.imageUrl);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-500"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-gray-600 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <img
                src={course.imageUrl || "https://placehold.co/400x200"}
                alt={course.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-gray-600 mb-2">{course.description}</p>
              <p className="text-sm font-medium">Instructor: {course.instructor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;
