using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using data;
using server.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Text;
using System.Linq;
using System;


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


            var userName = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized("User is not authenticated.");
        }

        var userCourses = await _context.Courses
            .Where(c => c.Instructor == userName)
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
        var userId = User.Claims.FirstOrDefault(c => c.Type == "jti")?.Value;
        Console.WriteLine($"userId: {userId}");


        if (userId == null)
        {
            return Unauthorized();
        }


        // Validate the course exists
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
        {
            return NotFound(new { Message = "Course not found" });
        }

        // Check if the user is already enrolled
        bool isAlreadyEnrolled = await _context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (isAlreadyEnrolled)
        {
            return BadRequest(new { Message = "You are already enrolled in this course" });
        }

        // Create new Enrollment
        var enrollment = new Enrollment
        {
            UserId = userId,
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
}
