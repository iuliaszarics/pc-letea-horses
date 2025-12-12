
namespace Honse.Resources.Interfaces
{
    public interface IOrderConfirmationTokenResource : IResource<Entities.OrderConfirmationToken>
    {
        public Task<IEnumerable<Entities.OrderConfirmationToken>> GetExpiredTokens();

        public Task<bool> DeleteRange(IEnumerable<Entities.OrderConfirmationToken> tokens);

        public Task<Entities.OrderConfirmationToken?> GetByIdPublic(Guid id);

    }
}
