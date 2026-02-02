import { useState } from 'react';
import { testBackend, testFirestore } from '../services/api';

function ConnectionTest() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [firestoreStatus, setFirestoreStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const result = await testBackend();
      setBackendStatus({ success: true, data: result });
    } catch (error) {
      setBackendStatus({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const testFirestoreConnection = async () => {
    setLoading(true);
    try {
      const result = await testFirestore();
      setFirestoreStatus({ success: true, data: result });
    } catch (error) {
      setFirestoreStatus({ success: false, error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Connection Tests</h2>
      
      {/* Backend Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Backend Connection</h3>
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Test Backend
        </button>
        
        {backendStatus && (
          <div className={`mt-4 p-3 rounded ${backendStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">
              {backendStatus.success ? '✅ Success' : '❌ Failed'}
            </p>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(backendStatus.success ? backendStatus.data : backendStatus.error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Firestore Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Firestore Connection</h3>
        <button
          onClick={testFirestoreConnection}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Test Firestore
        </button>
        
        {firestoreStatus && (
          <div className={`mt-4 p-3 rounded ${firestoreStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">
              {firestoreStatus.success ? '✅ Success' : '❌ Failed'}
            </p>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(firestoreStatus.success ? firestoreStatus.data : firestoreStatus.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionTest;
