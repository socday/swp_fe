namespace FPT_Booking_BE.DTOs
{
    public class UpdateRoleRequest
    {
        public int NewRoleId { get; set; }
    }
    public class UserResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string RoleName { get; set; } = "N/A"; 
        public bool IsActive { get; set; } 
    }
    public class UserFilterRequest
    {
        public string? Keyword { get; set; }
        public int? RoleId { get; set; }   
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalRecords { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!; 
        public string FullName { get; set; } = null!;
        public int RoleId { get; set; }
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; }
    }
}