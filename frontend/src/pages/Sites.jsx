import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Sites() {
  const { data, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => fetch('/api/sites').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { sites = [] } = data || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 mt-1">Manage your monitored websites</p>
        </div>
        <Link to="/sites/new" className="btn btn-primary">
          + Add Site
        </Link>
      </div>

      {sites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <Link
              key={site.id}
              to={`/sites/${site.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{site.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{site.url}</p>
                </div>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${site.category === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                `}>
                  {site.category}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Account</span>
                  <span className="text-gray-900">{site.account_type}</span>
                </div>
                {site.property_id && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Property ID</span>
                    <span className="text-gray-900 font-mono text-xs">{site.property_id}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-500 mb-6">Add your first website to start monitoring</p>
          <Link to="/sites/new" className="btn btn-primary">
            + Add Your First Site
          </Link>
        </div>
      )}
    </div>
  );
}
