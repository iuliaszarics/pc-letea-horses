using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", configurePolicy =>
    {
        configurePolicy.AllowAnyHeader().AllowAnyMethod()
        .AllowAnyOrigin();
         //.WithOrigins("http://localhost:3000");
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

// Database

builder.Services.AddDbContext<Honse.Resources.Interfaces.AppDbContext>(opt
        => opt.UseSqlServer(builder.Configuration.GetConnectionString("DataSource") + 
            builder.Configuration.GetConnectionString("DefaultConnection")), ServiceLifetime.Transient);

// Identity 
builder.Services.AddIdentity<Honse.Global.User, IdentityRole<Guid>>(options =>
{
    //options.Password.RequireDigit = false;
    //options.Password.RequireNonAlphanumeric = false;
    //options.Password.RequireLowercase = true;
    //options.Password.RequireUppercase = true;

    options.Password.RequireDigit = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 4;
})
    .AddEntityFrameworkStores<Honse.Resources.Interfaces.AppDbContext>()
    .AddDefaultTokenProviders();

//Authentication

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        options.DefaultScheme =
            JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"])
        )
    };
});

// Dependency Injection

// Resources
builder.Services.AddScoped<Honse.Resources.Interfaces.IProductResource, Honse.Resources.ProductResource>();
builder.Services.AddScoped<Honse.Resources.Interfaces.IProductCategoryResource, Honse.Resources.ProductCategoryResource>();
builder.Services.AddScoped<Honse.Resources.Interfaces.IRestaurantResource, Honse.Resources.RestaurantResource>();

// Engines
builder.Services.AddScoped<Honse.Engines.Filtering.Interfaces.IProductFilteringEngine, Honse.Engines.Filtering.Product.ProductFilteringEngine>();
builder.Services.AddScoped<Honse.Engines.Validation.Interfaces.IProductValidationEngine, Honse.Engines.Validation.ProductValidationEngine>();
builder.Services.AddScoped<Honse.Engines.Validation.Interfaces.IUserValidationEngine, Honse.Engines.Validation.UserValidationEngine>();
builder.Services.AddScoped<Honse.Engines.Validation.Interfaces.IRestaurantValidationEngine, Honse.Engines.Validation.RestaurantValidationEngine>();
builder.Services.AddScoped<Honse.Engines.Validation.Interfaces.IProductCategoryValidationEngine, Honse.Engines.Validation.ProductCategoryValidationEngine>();
builder.Services.AddScoped<Honse.Engines.Filtering.Interfaces.IRestaurantFilteringEngine, Honse.Engines.Filtering.Restaurant.RestaurantFilteringEngine>();


// Managers
builder.Services.AddScoped<Honse.Managers.Interfaces.IUserManager, Honse.Managers.UserManager>();
builder.Services.AddScoped<Honse.Managers.Interfaces.IProductManager, Honse.Managers.ProductManager>();
builder.Services.AddScoped<Honse.Managers.Interfaces.IProductCategoryManager, Honse.Managers.ProductCategoryManager>();
builder.Services.AddScoped<Honse.Managers.Interfaces.IRestaurantManager, Honse.Managers.RestaurantManager>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
