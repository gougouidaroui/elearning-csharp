using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using server.Models;
using System.Text;
using System.Linq;
using System;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }
        private ClaimsPrincipal ValidateJwtToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            try
            {
                // Validate the token
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                        {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                        }, out SecurityToken validatedToken);

                return principal;
            }
            catch
            {
                // If validation fails, return null or throw exception
                return null;
            }
        }

        [HttpGet("roles")]
        [Authorize] // Ensure the user is authenticated
            public async Task<IActionResult> GetUserRoles([FromBody] LoginModel model)
            {
                // Validate user credentials
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    return Unauthorized(new { Message = "Invalid email or password" });
                }

                // If credentials are valid, get user roles
                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new
                        {
                        Message = "Roles checked",
                        Roles = roles // Send the roles in the response
                        });
            }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var user = new IdentityUser { UserName = model.Username, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = "User registered successfully" });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateToken([FromHeader(Name = "Authorization")] string token)
        {
            if (string.IsNullOrEmpty(token) || !token.StartsWith("Bearer "))
            {
                return Unauthorized(new { Message = "Token is required" });
            }

            token = token.Substring(7); // Remove "Bearer " from the token
            var claimsPrincipal = ValidateJwtToken(token);

            if (claimsPrincipal == null)
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            return Ok(new { Message = "Token is valid" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized(new { Message = "Invalid email or password" });

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(IdentityUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),  // Use the actual Id from Identity
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),  // Directly use user.Email here
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Get roles for the user and add them as claims
            var roles = _userManager.GetRolesAsync(user).Result; // Be careful with async blocking here
            claims = claims.Concat(roles.Select(role => new Claim(ClaimTypes.Role, role))).ToArray();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(3),
                    signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }

    public class RegisterModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
