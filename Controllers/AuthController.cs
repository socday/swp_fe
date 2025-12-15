using FPT_Booking_BE.DTOs;
using FPT_Booking_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.Login(request);

            if (token == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng!" });
            }

            return Ok(new { token = token });
        }
    }
}