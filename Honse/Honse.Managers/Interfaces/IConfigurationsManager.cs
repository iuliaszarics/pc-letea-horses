using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Managers.Interfaces
{
    public interface IConfigurationsManager
    {
        Task<List<Configuration>> GetAllConfigurations(Guid userId);
        Task<Configuration> AddConfiguration(CreateConfigurationRequest request);
        Task<Configuration> UpdateConfiguration(UpdateConfigurationRequest request);
        Task DeleteConfiguration(Guid id, Guid userId);
    }

    public class CreateConfigurationRequest
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<Guid> CategoryIds { get; set; } = new List<Guid>();
    }

    public class UpdateConfigurationRequest
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<Guid> CategoryIds { get; set; } = new List<Guid>();
    }
}
