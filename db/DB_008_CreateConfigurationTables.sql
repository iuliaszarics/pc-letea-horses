USE [Honse];
GO
-- config table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Configuration' AND xtype='U')
BEGIN
	CREATE TABLE [Configuration](
		[Id] UNIQUEIDENTIFIER PRIMARY KEY NONCLUSTERED DEFAULT NEWID(),
		[UserId] UNIQUEIDENTIFIER NOT NULL,
		[Name] NVARCHAR(255) NOT NULL,
		[CategoryIds] NVARCHAR(MAX) NOT NULL DEFAULT '[]',

		-- link to the user who owns this config
		CONSTRAINT [FK_Configuration_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
	);
END
GO

-- configId to the restaurant table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfigurationId' AND Object_ID = Object_ID(N'Restaurant'))
BEGIN
	ALTER TABLE [Restaurant]
	ADD [ConfigurationId] UNIQUEIDENTIFIER NULL;
END
GO

-- fk constraint linking restaurant -> config
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name='FK_Restaurant_Configuration')
BEGIN
	ALTER TABLE [Restaurant]
	ADD CONSTRAINT [FK_Restaurant_Configuration]
	FOREIGN KEY ([ConfigurationId]) REFERENCES [Configuration]([Id])
END
GO

-- index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name ='IX_Restaurant_ConfigurationId')
BEGIN
	CREATE INDEX [IX_Restaurant_ConfigurationId] ON [Restaurant]([ConfigurationId]);
END
GO