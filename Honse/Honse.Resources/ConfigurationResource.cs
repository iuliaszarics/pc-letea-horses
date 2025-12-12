using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;  

namespace Honse.Resources
{
    public class ConfigurationResource : Resource<Configuration>, IConfigurationResource
    {
        public ConfigurationResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.Configuration;
        }
    }
}
