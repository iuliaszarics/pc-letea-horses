using Honse.Engines.Filtering.Interfaces;
using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Product
{
    public class ProductFilteringEngine : IProductFilteringEngine
    {
        public Specification<Resources.Interfaces.Entities.Product> GetSpecification(ProductFilterRequest filter)
        {
            Specification<Resources.Interfaces.Entities.Product> specification = new SpecificationProductHasUser(filter.UserId);

            if (filter.SearchKey != null)
                specification = specification.And(new SpecificationProductSearchKey(filter.SearchKey));

            if (filter.CategoryName != null)
                specification = specification.And(new SpecificationProductByCategory(filter.CategoryName));

            if (filter.CategoryId.HasValue)
                specification = specification.And(new SpecificationProductByCategoryId(filter.CategoryId.Value));

            if (filter.RestaurantId.HasValue)
                specification = specification.And(new SpecificationProductByRestaurantId(filter.RestaurantId.Value));

            if (filter.IsEnabled.HasValue)
                specification = specification.And(new SpecificationProductIsEnabled(filter.IsEnabled.Value));

            if (filter.MinPrice.HasValue || filter.MaxPrice.HasValue)
                specification = specification.And(new SpecificationProductPriceRange(filter.MinPrice, filter.MaxPrice));

            return specification;
        }
    }
}
