USE [Honse];

ALTER TABLE [dbo].[Restaurant]
DROP COLUMN [Address],
    [City],
    [PostalCode];

ALTER TABLE [dbo].[Restaurant]
ADD [Address] VARCHAR(MAX);

UPDATE [dbo].[Restaurant]
SET Address = '{"Street":"Str. Teodor Mihali","City":"Cluj-Napoca","Country":"Romania","PostalCode":"123456"}'
