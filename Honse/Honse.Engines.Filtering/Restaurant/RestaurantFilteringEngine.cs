using Honse.Engines.Filtering.Interfaces;
using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Restaurant
{
    public class RestaurantFilteringEngine : IRestaurantFilteringEngine
    {
        public Specification<Resources.Interfaces.Entities.Restaurant> GetSpecification(RestaurantFilterRequest filter)
        {
            Specification<Resources.Interfaces.Entities.Restaurant> specification = new SpecificationRestaurantHasUser(filter.UserId);

            if (filter.SearchKey != null)
                specification = specification.And(new SpecificationRestaurantSearchKey(filter.SearchKey));

            if (filter.CuisineType != null)
                specification = specification.And(new SpecificationRestaurantCuisineType(filter.CuisineType));

            if (filter.City != null)
                specification = specification.And(new SpecificationRestaurantCity(filter.City));

            if (filter.IsEnabled.HasValue)
                specification = specification.And(new SpecificationRestaurantIsEnabled(filter.IsEnabled.Value));

            if (filter.MinRating.HasValue)
                specification = specification.And(new SpecificationRestaurantMinRating(filter.MinRating.Value));

            return specification;
        }

        public Specification<Resources.Interfaces.Entities.Restaurant> GetSpecification(PublicRestaurantFilterRequest filter)
        {
            // For public access, use AnySpecification (no userId filter) but always filter for enabled restaurants
            Specification<Resources.Interfaces.Entities.Restaurant> specification = new SpecificationRestaurantIsEnabled(true);

            if (filter.SearchKey != null)
                specification = specification.And(new SpecificationRestaurantSearchKey(filter.SearchKey));

            if (filter.CuisineType != null)
                specification = specification.And(new SpecificationRestaurantCuisineType(filter.CuisineType));

            if (filter.City != null)
                specification = specification.And(new SpecificationRestaurantCity(filter.City));

            if (filter.IsOpen.HasValue)
                specification = specification.And(new SpecificationRestaurantIsOpen(filter.IsOpen.Value));

            if (filter.MinRating.HasValue)
                specification = specification.And(new SpecificationRestaurantMinRating(filter.MinRating.Value));

            return specification;
        }
    }
}