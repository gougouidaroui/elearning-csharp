using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;

        public RolesController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] RoleAssignmentModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var result = await _userManager.AddToRoleAsync(user, model.Role);
            if (!result.Succeeded)
            {
                return BadRequest(new { Errors = result.Errors });
            }

            return Ok(new { Message = $"Role '{model.Role}' assigned to user '{user.Email}' successfully." });
        }
    }

    public class RoleAssignmentModel
    {
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
