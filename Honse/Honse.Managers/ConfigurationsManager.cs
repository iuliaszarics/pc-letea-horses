using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Managers
{
    public class ConfigurationsManager : IConfigurationsManager
    {
        private readonly IConfigurationResource _configurationResource;
        private readonly IRestaurantResource _restaurantResource;

        public ConfigurationsManager(
            IConfigurationResource configurationResource,
            IRestaurantResource restaurantResource)
        {
            _configurationResource = configurationResource;
            _restaurantResource = restaurantResource;
        }

        public async Task<List<Configuration>> GetAllConfigurations(Guid userId)
        {
            var result = await _configurationResource.GetAll(userId);
            return result.ToList();
        }

        public async Task<Configuration> AddConfiguration(CreateConfigurationRequest request)
        {
            var config = request.DeepCopyTo<Configuration>();
            config.Id = Guid.NewGuid();

            if(config.CategoryIds == null)
            {
                config.CategoryIds = new List<Guid>();
            }

            return await _configurationResource.Add(config);
        }
        public async Task<Configuration> UpdateConfiguration(UpdateConfigurationRequest request)
        {
            var config = request.DeepCopyTo<Configuration>();

            if(config.CategoryIds == null)
            {
                config.CategoryIds = new List<Guid>();
            }

            var updated = await _configurationResource.Update(request.Id, request.UserId, config);

            if (updated == null) throw new Exception("Configuration not found!");
            return updated;
        }
        public async Task DeleteConfiguration(Guid id, Guid userId)
        {
            // validation logic
            var restaurants = await _restaurantResource.GetAll(userId);
            if(restaurants.Any(r => r.ConfigurationId == id))
            {
                throw new Exception("Cannot delete this configuration because it is associated with one or more restaurants.");
            }

            bool result = await _configurationResource.Delete(id, userId);
            if (!result) throw new Exception("Configuration not found or could not be deleted.");
        }
    }
}
