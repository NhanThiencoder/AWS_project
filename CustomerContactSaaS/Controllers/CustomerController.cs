using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerContactSaaS.Data;
using CustomerContactSaaS.Models;

namespace CustomerContactSaaS.Controllers
{
	public class CustomerController : Controller
	{
		private readonly ApplicationDbContext _context;

		public CustomerController(ApplicationDbContext context)
		{
			_context = context;
		}

		// 1. READ: Lấy danh sách khách hàng
		public async Task<IActionResult> Index()
		{
			var customers = await _context.Customers.ToListAsync();
			return View(customers);
		}

		// GET: Hiển thị form Thêm mới
		public IActionResult Create()
		{
			return View();
		}

		// GET: Hiển thị form Sửa thông tin
		public async Task<IActionResult> Edit(int? id)
		{
			if (id == null) return NotFound();
			var customer = await _context.Customers.FindAsync(id);
			if (customer == null) return NotFound();
			return View(customer);
		}

		// GET: Hiển thị trang xác nhận Xóa
		public async Task<IActionResult> Delete(int? id)
		{
			if (id == null) return NotFound();
			var customer = await _context.Customers.FirstOrDefaultAsync(m => m.Id == id);
			if (customer == null) return NotFound();
			return View(customer);
		}


		// 2. CREATE: Lưu khách hàng mới vào Database (POST)
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Create(Customer customer)
		{
			if (ModelState.IsValid)
			{
				_context.Add(customer);
				await _context.SaveChangesAsync();
				return RedirectToAction(nameof(Index));
			}
			return View(customer);
		}

		// 3. UPDATE: Cập nhật thông tin (POST)
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Edit(int id, Customer customer)
		{
			if (id != customer.Id) return NotFound();

			if (ModelState.IsValid)
			{
				try
				{
					_context.Update(customer);
					await _context.SaveChangesAsync();
				}
				catch (DbUpdateConcurrencyException)
				{
					if (!_context.Customers.Any(e => e.Id == customer.Id)) return NotFound();
					else throw;
				}
				return RedirectToAction(nameof(Index));
			}
			return View(customer);
		}

		// 4. DELETE: Xóa khách hàng (POST)
		[HttpPost, ActionName("Delete")]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> DeleteConfirmed(int id)
		{
			var customer = await _context.Customers.FindAsync(id);
			if (customer != null)
			{
				_context.Customers.Remove(customer);
				await _context.SaveChangesAsync();
			}
			return RedirectToAction(nameof(Index));
		}
	}
}