USE	[Honse];

CREATE TABLE [Restaurant](
    [Id] UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWID(),
    
    -- Basic Information
    [Name] VARCHAR(255) NOT NULL,
    [Description] VARCHAR(MAX) NULL,
	-- Address
    [Address] VARCHAR(500) NOT NULL,
    [City] VARCHAR(100) NOT NULL,
    [PostalCode] VARCHAR(20) NOT NULL,
    
    -- Contact Information
    [Phone] VARCHAR(50) NOT NULL,
    [Email] VARCHAR(255) NULL,
    
    -- Images
    [Image] VARCHAR(MAX) NULL,
    
    -- Business Details
    [CuisineType] VARCHAR(200) NOT NULL, -- e.g., "Italian, Pizza, Pasta"
    
    [IsEnabled] BIT NOT NULL,
    -- Operating Hours (stored as JSON for flexibility)
    [OpeningTime] TIME NOT NULL,
    [ClosingTime] TIME NOT NULL,
    -- Ownership
    [UserId] UNIQUEIDENTIFIER NOT NULL REFERENCES [AspNetUsers],
		
)

-- Index for searching by name and cuisine
CREATE INDEX [IX_Restaurant_Name] ON [Restaurant]([Name])
CREATE INDEX [IX_Restaurant_CuisineType] ON [Restaurant]([CuisineType])
CREATE INDEX [IX_Restaurant_UserId] ON [Restaurant]([UserId])
CREATE INDEX [IX_Restaurant_IsEnabled] ON [Restaurant]([IsEnabled]) WHERE [IsEnabled] = 1
