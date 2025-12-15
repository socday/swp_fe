using FPT_Booking_BE.DTOs;
using FPT_Booking_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService service)
        {
            _reportService = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] ReportCreateRequest request)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var result = await _reportService.CreateReport(userId, request);

            if (result == "Success")
            {
                return Ok(new { message = "Gửi báo cáo thành công! Cảm ơn phản hồi của bạn." });
            }

            return BadRequest(new { message = result });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst("UserId");
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);

            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            string role = roleClaim?.Value ?? "Student";

            var reports = await _reportService.GetReports(userId, role);
            return Ok(reports);
        }

        // Admin/Manager duyệt báo cáo
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Manager")] 
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ReportStatusUpdate request)
        {
            var result = await _reportService.UpdateReportStatus(id, request.Status);
            if (!result) return NotFound(new { message = "Không tìm thấy báo cáo." });

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

    }
}