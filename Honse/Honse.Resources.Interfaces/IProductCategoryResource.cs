
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources.Interfaces
{
    public interface IProductCategoryResource : IResource<Entities.ProductCategory>
    {
        Task<IEnumerable<ProductCategory>> GetConfigurationCategories(Configuration configuration);
    }
}
