import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sitesAPI } from '../api';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
    property_id: '',
    account_type: 'silvertubes',
    category: 'client'
  });
  const [error, setError] = useState(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await sitesAPI.list();
      setSites(response.data.sites || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError(err.response?.data?.error || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    try {
      const response = await sitesAPI.create(newSite);
      setSites([response.data.site, ...sites]);
      setShowAddForm(false);
      setNewSite({
        name: '',
        url: '',
        property_id: '',
        account_type: 'silvertubes',
        category: 'client'
      });
    } catch (err) {
      console.error('Error adding site:', err);
      setError(err.response?.data?.error || 'Failed to add site');
    }
  };

  const handleDeleteSite = async (id) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    
    try {
      await sitesAPI.delete(id);
      setSites(sites.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting site:', err);
      setError(err.response?.data?.error || 'Failed to delete site');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 mt-1">Manage your website analytics</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Site
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Site</h2>
          <form onSubmit={handleAddSite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="My Website"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  required
                  className="input"
                  placeholder="https://example.com"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GA4 Property ID
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="372302012"
                  value={newSite.property_id}
                  onChange={(e) => setNewSite({ ...newSite, property_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  className="input"
                  value={newSite.account_type}
                  onChange={(e) => setNewSite({ ...newSite, account_type: e.target.value })}
                >
                  <option value="silvertubes">silvertubes</option>
                  <option value="interwebcoding">interwebcoding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="input"
                  value={newSite.category}
                  onChange={(e) => setNewSite({ ...newSite, category: e.target.value })}
                >
                  <option value="client">Client</option>
                  <option value="own">Own</option>
                  <option value="test">Test</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Site
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sites...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites added yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first website</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            Add Your First Site
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <div key={site.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      site.category === 'client' 
                        ? 'bg-blue-100 text-blue-700' 
                        : site.category === 'own'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {site.category}
                    </span>
                  </div>
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-primary-600"
                  >
                    {site.url}
                  </a>
                  {site.property_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      GA4: {site.property_id}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/sites/${site.id}`}
                    className="btn btn-secondary text-sm py-1"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete site"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
