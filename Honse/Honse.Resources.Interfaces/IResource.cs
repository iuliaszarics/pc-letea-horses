namespace Honse.Resources.Interfaces
{
    public interface IResource<T> where T : Entities.Entity
    {
        public Task<IEnumerable<T>> GetAll(Guid userId);

        public Task<T?> GetById(Guid id, Guid userId);

        public Task<T?> GetByIdNoTracking(Guid id, Guid userId);

        public Task<T> Add(T t);

        public Task<T?> Update(Guid id, Guid userId, T t);

        public Task<bool> Delete(Guid id, Guid userId);
    }
}
