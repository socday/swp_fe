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
    public class FacilitiesController : ControllerBase
    {
        private readonly IFacilityService _facilityService;

        public FacilitiesController(IFacilityService facilityService)
        {
            _facilityService = facilityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? name, [FromQuery] int? campusId, [FromQuery] int? typeId)
        {
            var facilities = await _facilityService.GetAllFacilities(name, campusId, typeId);
            return Ok(facilities);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FacilityCreateRequest request)
        {
            var result = await _facilityService.CreateFacility(request);
            if (result != "Success") return BadRequest(new { message = result });

            return Ok(new { message = "Tạo phòng mới thành công!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FacilityUpdateRequest request)
        {
            var result = await _facilityService.UpdateFacility(id, request);
            if (result != "Success") return NotFound(new { message = result });

            return Ok(new { message = "Cập nhật thông tin phòng thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _facilityService.DeleteFacility(id);
            if (result != "Success") return NotFound(new { message = result });

            return Ok(new { message = "Đã vô hiệu hóa phòng này thành công!" });
        }
    }
}