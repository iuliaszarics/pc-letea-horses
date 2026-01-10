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
    [ClosingTime]
) VALUES 
(NEWID(), @userId, 'McDonalds', 
'McDonald’s® este cel mai mare lanț de restaurante cu servire rapidă din lume, cu peste 43.000 de restaurante care servesc zilnic peste 63 de milioane de oameni în peste 100 de țări.',
'-', '-', '-', '0123123421', 'test@gmail.com','http://res.cloudinary.com/dxzaegvyf/image/upload/v1767886703/jpw1kv2wctb3jaflscmn.png','Burgers', 1, '08:00', '23:59'),
(NEWID(), @userId, 'KFC', 
'KFC este cel mai popular lanţ de restaurante specializat în produse din carne de pui din lume şi face parte din grupul Yum! Brands la nivel internațional.',
'-', '-', '-', '0123123421', 'test@gmail.com','https://glovo.dhmedia.io/image/stores-glovo/stores/9e809008ca2da2a039c49f278d0c9c9fbd567b8ddd0216dc5208544de7f8110a?t=W3siYXV0byI6eyJxIjoibG93In19LHsicmVzaXplIjp7Im1vZGUiOiJsZml0Iiwid2lkdGgiOjEyODB9fV0=','Pui', 1, '08:00', '23:59');

PRINT 'Restaurant created successfully';

DECLARE @burgersCategoryId uniqueidentifier = NEWID();
DECLARE @sidesCategoryId uniqueidentifier = NEWID();
DECLARE @chickenCategoryId uniqueidentifier = NEWID();
DECLARE @drinksCategoryId uniqueidentifier = NEWID();

INSERT INTO [ProductCategory](
[Id],
[Name],
[UserId]
) VALUES
(@burgersCategoryId, 'Burgeri', @userId),
(@sidesCategoryId, 'Garnituri', @userId),
(@chickenCategoryId, 'Pui', @userId),
(@drinksCategoryId, 'Băuturi', @userId)

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
(NEWID(), 'Quarter Pounder', '', 25, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2022-07/QP.png?itok=Iqh4B8_h', 1, @userId, @burgersCategoryId),
(NEWID(), 'Big Mac', '', 18, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2022-07/BM.png?itok=JaRbeO6z', 1, @userId, @burgersCategoryId),
(NEWID(), 'Cheeseburger', '', 8, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2022-07/CB.png?itok=jtRojji4', 1, @userId, @burgersCategoryId),
(NEWID(), 'Big Tasty', '', 24, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2021-03/Big_Tasty.png?itok=6LR0k7_K', 1, @userId, @burgersCategoryId),
(NEWID(), 'Fresh Deluxe', '', 15, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2021-03/Royal_Deluxe.png?itok=1LEEFe8A', 1, @userId, @burgersCategoryId),

(NEWID(), 'Crispy strips', '', 30, 21, 'https://api.kfc.ro/uploads/medium_Cat_Det_Crispy_Strips_8_PC_1272x1272px_a89d217e77.png', 1, @userId, @chickenCategoryId),
(NEWID(), 'Fillet bites', '', 22, 21, 'https://api.kfc.ro/uploads/medium_Cat_Det_Fillet_Bites_9_PC_1272x1272px_6853e67101.png', 1, @userId, @chickenCategoryId),
(NEWID(), 'Hot wings', '', 22, 21, 'https://api.kfc.ro/uploads/medium_Hot_Wings_8_PC_1272x1272px_f2771e01aa.png', 1, @userId, @chickenCategoryId),

(NEWID(), 'Cartofi prăjiti', '', 10, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2023-01/Fries_Mari_500x500_0.png?itok=BHBGbQHf', 1, @userId, @sidesCategoryId),
(NEWID(), 'Ketchup', '', 5, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2020-10/Ketchup.png?itok=js7Wb-hB', 1, @userId, @sidesCategoryId),
(NEWID(), 'Maioneză', '', 5, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2020-10/Maioneza.png?itok=SNcAOjjE', 1, @userId, @sidesCategoryId),
(NEWID(), 'Sos de usturoi', '', 5, 21, 'https://www.mcdonalds.ro/sites/default/files/styles/500x500/public/field_product_image/2020-10/Usturoi.png?itok=NVz2LN3n', 1, @userId, @sidesCategoryId),

(NEWID(), 'Coca cola', '', 5, 11, 'https://api.kfc.ro/uploads/medium_Cat_Det_Drinks_Doza_Coke_Regular_1272x1272px_5760459dcb.png', 1, @userId, @drinksCategoryId),
(NEWID(), 'Fanta', '', 5, 11, 'https://api.kfc.ro/uploads/medium_Cat_Det_Drinks_Doza_Fanta_1272x1272px_7560545d67.png', 1, @userId, @drinksCategoryId),
(NEWID(), 'Sprite', '', 5, 11, 'https://api.kfc.ro/uploads/medium_Cat_Det_Drinks_Doza_Sprite_1272x1272px_00503af28b.png', 1, @userId, @drinksCategoryId),
(NEWID(), 'Apa', '', 4, 11, 'https://api.kfc.ro/uploads/medium_Cat_Det_Drinks_Dorna_Still_1272x1272px_c5e71329e8.png', 1, @userId, @drinksCategoryId),
(NEWID(), 'Vin caii din letea', '', 50, 11, 'https://s13emagst.akamaized.net/products/30135/30134224/images/res_bdcddcf3bece5c8910843298c47cdc3c.png?width=720&height=720&hash=BBA00C24CB56BB6E067C32FDC4824734', 1, @userId, @drinksCategoryId)

PRINT 'Products created successfully';