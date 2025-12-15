using FPT_Booking_BE.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using FPT_Booking_BE.DTOs;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CampusesController : ControllerBase
    {
        private readonly ICampusService _campusService;

        public CampusesController(ICampusService campusService)
        {
            _campusService = campusService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _campusService.GetAllCampuses());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var campus = await _campusService.GetCampusByIdAsync(id);
            if (campus == null) return NotFound("Không tìm thấy Campus.");
            return Ok(campus);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CampusDto request)
        {
            if (string.IsNullOrEmpty(request.CampusName))
                return BadRequest("Tên Campus không được để trống.");

            var newCampus = await _campusService.CreateCampusAsync(request);
            return Ok(new { message = "Tạo Campus thành công", data = newCampus });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CampusDto request)
        {
            var result = await _campusService.UpdateCampusAsync(id, request);
            if (!result) return NotFound("Không tìm thấy Campus.");

            return Ok(new { message = "Cập nhật thành công!" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _campusService.DeleteCampusAsync(id);
            if (!result) return NotFound("Không tìm thấy Campus.");

            return Ok(new { message = "Đã ẩn Campus thành công (Soft Delete)." });
        }
    }
}