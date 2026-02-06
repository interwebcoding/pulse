import { useParams, Link } from 'react-router-dom';

export default function SiteDetail() {
  const { id } = useParams();
  
  return (
    <div>
      <div className="mb-8">
        <Link to="/sites" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Sites
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Site Details</h1>
        <p className="text-gray-500 mt-1">Site ID: {id}</p>
      </div>
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Analytics Coming Soon</h3>
        <p className="text-gray-500">Detailed analytics for this site</p>
      </div>
    </div>
  );
}
