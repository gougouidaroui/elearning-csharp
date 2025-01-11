using server.Models;
using Microsoft.AspNetCore.Identity;

public class QuizSubmission
{
    public int Id { get; set; }
    public int EnrollmentId { get; set; }
    public string StudentId { get; set; }
    public string Answer { get; set; }  // Store as JSON string
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
    public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
    public string? InstructorFeedback { get; set; }

    // Navigation properties
    public Enrollment Enrollment { get; set; }
    public IdentityUser Student { get; set; }
}

public enum SubmissionStatus
{
    Pending,
    Passed,
    Failed
}
