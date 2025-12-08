USE [Honse];

-- 1. Create the Order Table with JSON Address
CREATE TABLE [Order](
    [Id] UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWID(),
    
    -- Link to User Account
    [UserId] UNIQUEIDENTIFIER NOT NULL REFERENCES [AspNetUsers]([Id]),
    
    -- CLIENT SNAPSHOT
    -- We keep Name/Email separate for easier searching, but Address is now a flexible JSON
    [ClientName] NVARCHAR(255) NOT NULL,
    [ClientEmail] NVARCHAR(255) NOT NULL,
    
    -- JSON ADDRESS
    -- Example format: { "Street": "123 Main St", "City": "New York", "Zip": "10001", "Floor": 2 }
    [DeliveryAddress] NVARCHAR(MAX) NOT NULL, 

    -- ORDER DETAILS
    [RestaurantId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Restaurant]([Id]),
    [OrderNo] VARCHAR(50) NOT NULL, 
    [Timestamp] DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    [Total] DECIMAL(19, 4) NOT NULL,
    
    -- JSON STATUS HISTORY
    [OrderStatus] VARCHAR(MAX) NOT NULL, 
    
    -- Timings
    [PreparationTime] DATETIME2 NULL,
    [DeliveryTime] DATETIME2 NULL,

    -- VALIDATION: Ensure the text fields actually contain valid JSON
    CONSTRAINT [CK_Order_OrderStatus_JSON] CHECK (ISJSON([OrderStatus]) = 1),
    CONSTRAINT [CK_Order_Address_JSON] CHECK (ISJSON([DeliveryAddress]) = 1)
)

-- 3. Indexes
CREATE INDEX [IX_Order_UserId] ON [Order]([UserId])
CREATE INDEX [IX_Order_RestaurantId] ON [Order]([RestaurantId])