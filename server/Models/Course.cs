using System.Collections.Generic;

namespace server.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Instructor { get; set; }
        public string ImageUrl { get; set; }
        public string Content { get; set; } // New property
        public string Quiz { get; set; }

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}

