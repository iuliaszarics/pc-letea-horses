USE [Honse];

-- 1. Create the Order Table (Parent)
CREATE TABLE [Order](
    [Id] UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWID(),
    
    -- IDs and Relations
    [UserId] UNIQUEIDENTIFIER NOT NULL REFERENCES [AspNetUsers]([Id]),
    [RestaurantId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Restaurant]([Id]),
    
    -- Order Details
    [OrderNo] VARCHAR(50) NOT NULL, -- String as per diagram
    [Timestamp] DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    [Total] DECIMAL(19, 4) NOT NULL,
    
    -- JSON History as requested
    [OrderStatus] VARCHAR(MAX) NOT NULL, 
    
    -- Timings
    [PreparationTime] DATETIME2 NULL, -- Nullable as it might not be set initially
    [DeliveryTime] DATETIME2 NULL,

    -- Note: The 'Client' field in your diagram is handled by the [UserId] relation. 
    -- If you need a snapshot of client details (like name/address at time of order), 
    -- you could add a [ClientSnapshot] VARCHAR(MAX) column here.

    -- Optional: Ensure OrderStatus contains valid JSON
    CONSTRAINT [CK_Order_OrderStatus_JSON] CHECK (ISJSON([OrderStatus]) = 1)
)

-- 2. Create the OrderProductLight Table (Child/Items)
CREATE TABLE [OrderProductLight](
    [Id] UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWID(),
    
    -- Relationship to the Order (Necessary to link "Products: OrderProductLight[]")
    [OrderId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Order]([Id]) ON DELETE CASCADE,
    
    -- Fields from Diagram
    [UserId] UNIQUEIDENTIFIER NOT NULL REFERENCES [AspNetUsers]([Id]), -- Included per diagram
    [Name] VARCHAR(MAX) NOT NULL,
    [Quantity] DECIMAL(18, 2) NOT NULL, -- Using 18,2 for quantity (allows weights)
    [Price] DECIMAL(19, 4) NOT NULL,
    [VAT] DECIMAL(19, 4) NOT NULL,

    -- Computed Column: Automatically calculates Quantity * Price
    [Total] AS ([Quantity] * [Price]) PERSISTED
)

-- 3. Create Indexes for Performance
-- Optimize searching Orders by User and Restaurant
CREATE INDEX [IX_Order_UserId] ON [Order]([UserId])
CREATE INDEX [IX_Order_RestaurantId] ON [Order]([RestaurantId])

-- Optimize retrieving items for a specific order
CREATE INDEX [IX_OrderProductLight_OrderId] ON [OrderProductLight]([OrderId])