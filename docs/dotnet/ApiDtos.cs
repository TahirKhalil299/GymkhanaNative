// DTOs for Member Info, Menu, and Cart along with a common ApiResponse envelope.
// You can drop this file into your ASP.NET Core project and adjust namespaces as needed.

namespace GymKhana.Api.Models;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new ApiResponse<T> { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message) =>
        new ApiResponse<T> { Success = false, Message = message };
}

// 1) Member Info
public sealed class MemberInfoDto
{
    public string MemberId { get; init; } = default!;
    public string MemberName { get; init; } = default!;
    public string MemberType { get; init; } = default!; // e.g. "Club Member", "Guest"
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public bool IsActive { get; init; }
    public decimal Balance { get; init; }
}

// 2) Menu
public sealed class MenuItemDto
{
    public int Id { get; init; }
    public string Name { get; init; } = default!;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public string Category { get; init; } = default!; // e.g. "Starters"
    public bool IsAvailable { get; init; }
}

public sealed class MenuListDto
{
    public string OutletName { get; init; } = default!;
    public IReadOnlyList<MenuItemDto> Items { get; init; } = Array.Empty<MenuItemDto>();
}

// 3) Cart
public sealed class CartItemDto
{
    public int Id { get; init; }
    public string Name { get; init; } = default!;
    public decimal Price { get; init; }
    public int Quantity { get; init; }
    public decimal LineTotal => Price * Quantity;
}

public sealed class CartDto
{
    public string OrderNumber { get; init; } = default!;
    public string MemberId { get; init; } = default!;
    public string MemberType { get; init; } = default!; // e.g. "Club Member"
    public string? MemberName { get; init; }
    public string? TableNo { get; init; }
    public string? WaiterId { get; init; }
    public string? WaiterName { get; init; }
    public string ServiceType { get; init; } = "DINING_IN"; // "DINING_IN" | "TAKE_AWAY"
    public string OutletName { get; init; } = default!;
    public IReadOnlyList<CartItemDto> Items { get; init; } = Array.Empty<CartItemDto>();
    public decimal SubTotal { get; init; }
    public decimal Tax { get; init; }
    public decimal ServiceCharge { get; init; }
    public decimal GrandTotal { get; init; }
    public int ItemCount { get; init; }
    public DateTime Timestamp { get; init; }
    public string Status { get; init; } = "Open"; // "Open" | "Processed" | "Closed"
}




