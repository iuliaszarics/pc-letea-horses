namespace Honse.Resources.Interfaces
{
    public interface IOrderProductResource : IFilterResource<Entities.OrderProductLight>
    {
        Task<Entities.OrderProductLight?> GetByIdPublic(Guid id);
        Task<IEnumerable<Entities.OrderProductLight>> GetByOrderId(Guid orderId);
    }
}
