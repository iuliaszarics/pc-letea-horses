using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Honse.Resources.Interfaces.Entities
{
    public class Configuration : Entity
    {
        public string Name { get; set; } = string.Empty;
        public List<Guid> CategoryIds { get; set; } = new List<Guid>();
    }
}
