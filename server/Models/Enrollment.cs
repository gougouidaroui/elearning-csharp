using Microsoft.AspNetCore.Identity;
using server.Models;

public class Enrollment
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int CourseId { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.InProgress;
    public bool IsCompleted { get; set; } = false;
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public IdentityUser User { get; set; }
    public Course Course { get; set; }
}

public enum EnrollmentStatus
{
    InProgress,
    Completed
}
