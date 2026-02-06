import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <p className="text-sm mt-2">
          <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-gray-500 ml-1">vs last period</span>
        </p>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  );
}

function ClickIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, summary } = data || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your SEO performance at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={metrics?.users?.toLocaleString() || '0'}
          change={12}
          icon={UserIcon}
        />
        <StatCard
          title="Sessions"
          value={metrics?.sessions?.toLocaleString() || '0'}
          change={8}
          icon={ChartIcon}
        />
        <StatCard
          title="Search Clicks"
          value={metrics?.clicks?.toLocaleString() || '0'}
          change={-5}
          icon={ClickIcon}
        />
        <StatCard
          title="Impressions"
          value={metrics?.impressions?.toLocaleString() || '0'}
          change={15}
          icon={EyeIcon}
        />
      </div>

      {/* Sites Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sites */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Sites</h2>
            <Link to="/sites" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recentSites?.length > 0 ? (
              summary.recentSites.map(site => (
                <Link
                  key={site.id}
                  to={`/sites/${site.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{site.name}</p>
                    <p className="text-sm text-gray-500">{site.url}</p>
                  </div>
                  <span className="text-sm text-gray-400">→</span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No sites yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/sites/new"
              className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">+</div>
              <p className="font-medium text-gray-700">Add Site</p>
            </Link>
            <Link
              to="/analytics"
              className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-700">View Analytics</p>
            </Link>
            <Link
              to="/searchconsole"
              className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-medium text-gray-700">Search Console</p>
            </Link>
            <Link
              to="/settings"
              className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-medium text-gray-700">Settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
