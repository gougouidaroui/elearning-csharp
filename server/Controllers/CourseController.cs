using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Security.Claims;
using server.Models;
using System.Text;
using System.Linq;
using System;
using data;


[Route("api/[controller]")]
[ApiController]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public CoursesController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }



    // GET: api/Courses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
    {
        return await _context.Courses.ToListAsync();
    }

    [HttpGet("myCourses")]
    public async Task<ActionResult<IEnumerable<Course>>> GetMyCourses()
    {
        var token = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Authorization token is missing.");
        }

        // Extract the token part from "Bearer token"
        var bearerToken = token.StartsWith("Bearer ") ? token.Substring(7) : token;


        var userEmail = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized("User is not authenticated.");
        }

        var userCourses = await _context.Courses
            .Where(c => c.Instructor == userEmail)
            .ToListAsync();

        return Ok(userCourses);
    }

    // GET: api/Courses/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Course>> GetCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);

        if (course == null)
        {
            return NotFound();
        }

        return course;
    }

    // POST: api/Courses
    [HttpPost]
    public async Task<ActionResult<Course>> CreateCourse(Course course)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }


    [HttpPost("{courseId}/enroll")]
    public async Task<IActionResult> Enroll(int courseId)
    {
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier); // This gets "mohammed"

        // Look up the user by username instead of Id
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == username);
        if (user == null)
        {
            return NotFound(new { Message = "User not found" });
        }

        // Use the actual Identity user Id for the enrollment
        var userId = user.Id;  // This will be the GUID that Identity expects

        // Check for existing enrollment using the correct Id
        var existingEnrollment = await _context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (existingEnrollment)
        {
            return BadRequest(new { Message = "You are already enrolled in this course" });
        }

        var enrollment = new Enrollment
        {
            UserId = userId,  // Using the correct Identity user Id
                   CourseId = courseId
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Enrollment successful" });
    }


    // PUT: api/Courses/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(int id, Course course)
    {
        if (id != course.Id)
        {
            return BadRequest();
        }

        _context.Entry(course).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CourseExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Courses/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return NotFound();
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CourseExists(int id)
    {
        return _context.Courses.Any(e => e.Id == id);
    }

    [HttpGet("enrolled")]
    public async Task<ActionResult<IEnumerable<object>>> GetEnrolledCourses()
    {
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == username);

        if (user == null)
            return NotFound(new { Message = "User not found" });

        var enrolledCourses = await _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.UserId == user.Id)
            .Select(e => new
                    {
                    CourseId = e.CourseId,
                    Course = e.Course,
                    Status = e.Status,
                    IsCompleted = e.IsCompleted,
                    EnrollmentDate = e.EnrollmentDate,
                    CompletionDate = e.CompletionDate
                    })
        .ToListAsync();

        return Ok(enrolledCourses);
    }

    [HttpPut("complete/{courseId}")]
    public async Task<IActionResult> CompleteCourse(int courseId)
    {
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier); // This gets "mohammed"

        // Look up the user by username instead of Id
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == username);

        if (user == null)
            return NotFound(new { Message = "User not found" });

        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.UserId == user.Id && e.CourseId == courseId);

        if (enrollment == null)
            return NotFound(new { Message = "Enrollment not found" });

        enrollment.Status = EnrollmentStatus.Completed;
        enrollment.IsCompleted = true;
        enrollment.CompletionDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Course marked as completed" });
    }

    [HttpPost("submit-quiz/{courseId}")]
    public async Task<IActionResult> SubmitQuiz(int courseId, [FromBody] string answer)
    {
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == username);

        if (user == null)
            return NotFound(new { Message = "User not found" });

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == user.Id && e.CourseId == courseId);

        if (enrollment == null)
            return NotFound(new { Message = "Enrollment not found" });

        var submission = new QuizSubmission
        {
            EnrollmentId = enrollment.Id,
                         StudentId = user.Id,
                         Answer = answer
        };

        _context.QuizSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Quiz submitted successfully" });
    }

    [HttpPut("review-submission/{submissionId}")]
    public async Task<IActionResult> ReviewSubmission(int submissionId, [FromBody] ReviewDto review)
    {
        var submission = await _context.QuizSubmissions
            .Include(s => s.Enrollment)
            .ThenInclude(e => e.Course)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
            return NotFound();

        // Verify the current user is the course instructor

        submission.Status = review.Status;
        submission.InstructorFeedback = review.Feedback;

        if (review.Status == SubmissionStatus.Passed)
        {
            submission.Enrollment.IsCompleted = true;
            submission.Enrollment.CompletionDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Review submitted successfully" });
    }
    [HttpGet("submissions")]
    public async Task<ActionResult<IEnumerable<QuizSubmissionDTO>>> GetInstructorSubmissions()
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == username);
        var email = user.Email;

        if (string.IsNullOrEmpty(instructorId))
        {
            return Unauthorized();
        }

        var submissions = await _context.QuizSubmissions
            .Include(s => s.Student)
            .Include(s => s.Enrollment)
                .ThenInclude(e => e.Course)
            .Where(s => s.Enrollment.Course.Instructor == email)
            .Select(s => new QuizSubmissionDTO
            {
                Id = s.Id,
                StudentName = s.Student.UserName,
                CourseTitle = s.Enrollment.Course.Title,
                Answer = s.Answer,
                Status = s.Status,
                SubmissionDate = s.SubmissionDate,
                InstructorFeedback = s.InstructorFeedback
            })
            .OrderByDescending(s => s.SubmissionDate)
                .ToListAsync();

            return Ok(submissions);
    }

    public class ReviewDto
    {
        public SubmissionStatus Status { get; set; }
        public string Feedback { get; set; }
    }
    public class QuizSubmissionDTO
{
    public int Id { get; set; }
    public string StudentName { get; set; }
    public string CourseTitle { get; set; }
    public string Answer { get; set; }
    public SubmissionStatus Status { get; set; }
    public DateTime SubmissionDate { get; set; }
    public string? InstructorFeedback { get; set; }
}

}
