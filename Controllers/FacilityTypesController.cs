using FPT_Booking_BE.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using FPT_Booking_BE.DTOs;

namespace FPT_Booking_BE.Controllers
{
    [Route("api/facility-types")] 
    [ApiController]
    [Authorize]
    public class FacilityTypesController : ControllerBase
    {
        private readonly IFacilityTypeService _typeService;

        public FacilityTypesController(IFacilityTypeService typeService)
        {
            _typeService = typeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _typeService.GetAllTypes());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FacilityTypeDto request)
        {
            await _typeService.CreateType(request.TypeName);
            return Ok("Tạo loại phòng thành công");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _typeService.DeleteType(id);
            return Ok("Đã xóa loại phòng");
        }
    }
}