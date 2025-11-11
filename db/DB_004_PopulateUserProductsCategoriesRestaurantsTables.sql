USE [Honse]

DECLARE @userId uniqueidentifier = NEWID();

INSERT INTO [AspNetUsers] (
    [Id],
    [UserName],
    [NormalizedUserName],
    [Email],
    [NormalizedEmail],
    [EmailConfirmed],
    [PasswordHash],
    [SecurityStamp],
    [ConcurrencyStamp],
    [PhoneNumber],
    [PhoneNumberConfirmed],
    [TwoFactorEnabled],
    [LockoutEnd],
    [LockoutEnabled],
    [AccessFailedCount]
) VALUES (
    @userId,
    'user1',
    'USER1',
    'user1.@gmail.com',
    'user1.@GMAIL.COM',
    1, -- EmailConfirmed
    
    -- Password: "User123!"
    -- This is a PBKDF2 hash for the password "User123!" with 10000 iterations
    'AQAAAAIAAYagAAAAEPbGeOj+Q4QHWKR6y/ULYMnUk+HuVF4/I24Qd6KEC5gVMeGHm6mrbMGHOUBa+XBruQ==',
    
    '6D6E8F9G-2B3C-5D4E-0F9G-1H2J3K4L5M6N', -- SecurityStamp
    NEWID(), -- ConcurrencyStamp
    NULL, -- PhoneNumber
    0, -- PhoneNumberConfirmed
    0, -- TwoFactorEnabled
    NULL, -- LockoutEnd
    1, -- LockoutEnabled
    0 -- AccessFailedCount
);

PRINT 'User created successfully';

DECLARE @restaurantId uniqueidentifier = NEWID();

INSERT INTO [Restaurant](
	[Id],
	[UserId],
	[Name],
	[Description],
    [Address],
    [City],
    [PostalCode],
    [Phone],
    [Email],
    [Image],
    [CuisineType], 
    [IsEnabled],
    [OpeningTime],
    [ClosingTime],[AverageRating]
) VALUES (@restaurantId, @userId, 'Restaurant test', '', '-', '-', '-', '0123123421', 'test@gmail.com','','Italian', 1, '08:00', '16 :00', 0);

PRINT 'Restaurant created successfully';

DECLARE @mainCategoryId uniqueidentifier = NEWID();
DECLARE @drinksCategoryId uniqueidentifier = NEWID();

INSERT INTO [ProductCategory](
[Id],
[Name],
[UserId],
[RestaurantId]
) VALUES
(@mainCategoryId, 'Fel principal', @userId, @restaurantId),
(@drinksCategoryId, 'Bauturi', @userId, @restaurantId)

PRINT 'Product categories created successfully';

INSERT INTO [Product](
[Id]
,[Name]
,[Description]
,[Price]
,[VAT]
,[Image]
,[IsEnabled]
,[UserId]
,[CategoryId]
)
VALUES
(NEWID(), 'Pizza', '', 25, 21, '', 1, @userId, @mainCategoryId),
(NEWID(), 'Burgir', '', 20, 21, '', 1, @userId, @mainCategoryId),
(NEWID(), 'Cartofi', '', 10, 21, '', 1, @userId, @mainCategoryId),
(NEWID(), 'Coca cola', '', 25, 11, '', 1, @userId, @drinksCategoryId),
(NEWID(), 'Apa', '', 20, 11, '', 1, @userId, @drinksCategoryId),
(NEWID(), 'Vin caii din letea', '', 50, 11, '', 1, @userId, @drinksCategoryId)

PRINT 'Products created successfully';