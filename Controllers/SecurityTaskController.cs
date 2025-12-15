using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FPT_Booking_BE.Models;
using FPT_Booking_BE.DTOs;
using FPT_Booking_BE.Services;
using System.Security.Claims;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SecurityTaskController : ControllerBase
    {
        private readonly ISecurityTaskService _taskService;

        public SecurityTaskController(ISecurityTaskService taskService)
        {
            _taskService = taskService;
        }
        
        [HttpPost("assign")]
        [Authorize(Roles = "Admin,Manager,FacilityAdmin")] 
        public async Task<IActionResult> AssignTask([FromBody] CreateTaskRequest request)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            var task = new SecurityTask
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                AssignedToUserId = request.AssignedToId,
                CreatedBy = userId,
                Status = "Pending"
            };

            await _taskService.CreateTaskAsync(task);
            return Ok(new { message = "Đã giao việc cho Security thành công!" });
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Security,Admin,Manager")]
        public async Task<IActionResult> GetPendingTasks()
        {
            var tasks = await _taskService.GetPendingTasksAsync();
            return Ok(tasks);
        }

        [HttpPut("complete/{taskId}")]
        [Authorize(Roles = "Security")] 
        public async Task<IActionResult> CompleteTask(int taskId, [FromBody] CompleteTaskRequest request)
        {
            var result = await _taskService.CompleteTaskAsync(taskId, request.ReportNote);
            if (!result) return NotFound("Không tìm thấy task.");

            return Ok(new { message = "Đã báo cáo hoàn thành nhiệm vụ!" });
        }
    }
}