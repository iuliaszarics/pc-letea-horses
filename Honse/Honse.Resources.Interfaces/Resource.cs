using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Honse.Resources.Interfaces
{
    public abstract class Resource<T> : IResource<T> where T : Entities.Entity
    {
        private readonly AppDbContext dbContext;

        protected DbSet<T> dbSet;
        protected List<Expression<Func<T, object>>> includeProperties = new List<Expression<Func<T, object>>>();

        public Resource(AppDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<T> Add(T t)
        {
            await dbSet.AddAsync(t);

            await dbContext.SaveChangesAsync();

            return t;
        }

        public async Task<bool> Delete(Guid id, Guid userId)
        {

            T? t = await dbSet.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (t == null)
                return false;

            dbSet.Remove(t);

            await dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<T>> GetAll(Guid userId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query.Where(t => t.UserId == userId).ToListAsync();
        }

        public async Task<T?> GetById(Guid id, Guid userId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<T?> GetByIdNoTracking(Guid id, Guid userId)
        {
            var query = dbSet.AsNoTracking().AsQueryable();
            query = ApplyIncludes(query);

            return await query.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<T?> Update(Guid id, Guid userId, T t)
        {
            T? existingT = await dbSet.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (existingT == null)
                return null;

            dbSet.Update(t);

            await dbContext.SaveChangesAsync();
            return t;
        }

        protected IQueryable<T> ApplyIncludes(IQueryable<T> query)
        {
            if (includeProperties.Any())
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            return query;
        }
    }
}
