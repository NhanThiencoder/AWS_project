using Microsoft.EntityFrameworkCore;
using CustomerContactSaaS.Data;
using CustomerContactSaaS.Services.Interfaces;
using CustomerContactSaaS.Services.AWSServices;
using Amazon.SimpleEmail;
using Amazon.SimpleNotificationService;
using Amazon.Runtime;

var builder = WebApplication.CreateBuilder(args);

// 1. Thêm kết nối Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Thêm AWS Services
var awsAccessKey = builder.Configuration["AWS:AccessKey"];
var awsSecretKey = builder.Configuration["AWS:SecretKey"];
var credentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);

var awsOptions = builder.Configuration.GetAWSOptions();
awsOptions.Credentials = credentials;
builder.Services.AddDefaultAWSOptions(awsOptions);

builder.Services.AddAWSService<IAmazonSimpleEmailService>();
builder.Services.AddAWSService<IAmazonSimpleNotificationService>();

// 3. Đăng ký các Service tự viết
builder.Services.AddScoped<IEmailService, SesEmailService>();
builder.Services.AddScoped<ISmsService, SnsSmsService>();

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Customer}/{action=Index}/{id?}");

app.Run();