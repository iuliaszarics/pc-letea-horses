USE [Honse];

DECLARE @burgersCategoryId uniqueidentifier;
DECLARE @sidesCategoryId uniqueidentifier;
DECLARE @chickenCategoryId uniqueidentifier;
DECLARE @drinksCategoryId uniqueidentifier;

DECLARE @kfcRestaurantId uniqueidentifier;
DECLARE @mcRestaurantId uniqueidentifier;

DECLARE @mcConfigId uniqueidentifier = NEWID();
DECLARE @kfcConfigId uniqueidentifier = NEWID();


DECLARE @userId uniqueidentifier;

SELECT @burgersCategoryId = ID FROM ProductCategory WHERE [Name] = 'Burgeri';
SELECT @sidesCategoryId = ID FROM ProductCategory WHERE [Name] = 'Garnituri';
SELECT @chickenCategoryId = ID FROM ProductCategory WHERE [Name] = 'Pui';
SELECT @drinksCategoryId = ID FROM ProductCategory WHERE [Name] = 'Băuturi';

SELECT @kfcRestaurantId = ID FROM Restaurant WHERE [Name] = 'KFC';
SELECT @mcRestaurantId = ID FROM Restaurant WHERE [Name] = 'McDonalds';

SELECT @userId = ID FROM AspNetUsers WHERE [UserName] = 'user1';
-- Create new configurations

INSERT INTO [Configuration](ID, UserId, [Name], CategoryIds) VALUES
(@kfcConfigId, @userId, 'KFC', 
'["' + CAST(@burgersCategoryId AS NVARCHAR(36)) + '", "' 
+ CAST(@sidesCategoryId   AS NVARCHAR(36)) + '", "' 
+ CAST(@drinksCategoryId  AS NVARCHAR(36)) + '"]'
),
(@mcConfigId, @userId, 'MC',
'["' + CAST(@chickenCategoryId AS NVARCHAR(36)) + '", "' 
+ CAST(@sidesCategoryId   AS NVARCHAR(36)) + '", "' 
+ CAST(@drinksCategoryId  AS NVARCHAR(36)) + '"]')

-- Update restaurants

UPDATE Restaurant
SET [ConfigurationId] = @kfcConfigId
WHERE [Name] = 'KFC';

UPDATE Restaurant
SET [ConfigurationId] = @mcConfigId
WHERE [Name] = 'McDonalds';
