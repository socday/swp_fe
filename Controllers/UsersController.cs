using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FPT_Booking_BE.Services;
using FPT_Booking_BE.DTOs;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserFilterRequest filter)
        {
            var result = await _userService.GetUsersFilterAsync(filter);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var result = await _userService.CreateUserAsync(request);
            if (!result) return BadRequest("Email đã tồn tại.");

            return Ok(new { message = "Tạo User mới thành công!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var result = await _userService.UpdateUserAsync(id, request);
            if (!result) return NotFound("User không tồn tại.");

            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var result = await _userService.UpdateUserRoleAsync(id, request.NewRoleId);
            if (!result) return BadRequest("Lỗi cập nhật Role.");
            return Ok(new { message = "Đã đổi quyền thành công." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result) return BadRequest("Không thể xóa user này (có thể do ràng buộc dữ liệu).");
            return Ok(new { message = "Xóa user thành công." });
        }
    }
}