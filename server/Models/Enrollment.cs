using Microsoft.AspNetCore.Identity;
using server.Models;

public class Enrollment
{
    public int Id { get; set; }

    // Foreign keys
    public string UserId { get; set; } // Reference to the user
    public int CourseId { get; set; }  // Reference to the course

    // Navigation properties
    public IdentityUser User { get; set; }
    public Course Course { get; set; }

    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
}
