import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  affectedRows?: number;
}

const QueryTool = () => {
  const { token } = useAuthStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<number | null>(null);

  const runQuery = async () => {
    if (!query.trim()) {
      setError('Query cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be a call to your API
      // const response = await axios.post('/api/database/query', 
      //   { query },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // For demo purposes, we'll simulate the API call with canned responses
      setTimeout(() => {
        let queryResult: QueryResult;
        const executionTime = Math.random() * 0.5 + 0.1; // Between 0.1 and 0.6 seconds
        
        const lowerQuery = query.toLowerCase();
        
        // Simulate different types of queries
        if (lowerQuery.includes('select') && lowerQuery.includes('from users')) {
          queryResult = {
            columns: ['id', 'name', 'email', 'role', 'created_at'],
            rows: [
              { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: '2023-01-20T10:30:00Z' },
              { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: '2023-02-15T14:20:00Z' },
              { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: '2023-03-10T09:45:00Z' }
            ],
            executionTime
          };
        } else if (lowerQuery.includes('select') && lowerQuery.includes('from products')) {
          queryResult = {
            columns: ['id', 'name', 'price', 'category', 'stock'],
            rows: [
              { id: 'p1', name: 'Laptop', price: 1299.99, category: 'electronics', stock: 45 },
              { id: 'p2', name: 'Smartphone', price: 899.99, category: 'electronics', stock: 120 },
              { id: 'p3', name: 'Headphones', price: 199.99, category: 'electronics', stock: 78 }
            ],
            executionTime
          };
        } else if (lowerQuery.includes('select') && lowerQuery.includes('from orders')) {
          queryResult = {
            columns: ['id', 'user_id', 'total', 'status', 'created_at'],
            rows: [
              { id: 'o1', user_id: 'u1', total: 1499.98, status: 'completed', created_at: '2023-02-10T14:25:00Z' },
              { id: 'o2', user_id: 'u2', total: 899.99, status: 'processing', created_at: '2023-03-15T09:30:00Z' },
              { id: 'o3', user_id: 'u3', total: 199.99, status: 'completed', created_at: '2023-03-20T16:45:00Z' },
              { id: 'o4', user_id: 'u1', total: 2199.98, status: 'shipped', created_at: '2023-04-05T11:15:00Z' }
            ],
            executionTime
          };
        } else if (lowerQuery.includes('insert') || lowerQuery.includes('update') || lowerQuery.includes('delete')) {
          const affectedRows = Math.floor(Math.random() * 5) + 1;
          queryResult = {
            columns: [],
            rows: [],
            executionTime,
            affectedRows
          };
        } else if (lowerQuery.includes('create') || lowerQuery.includes('alter') || lowerQuery.includes('drop')) {
          queryResult = {
            columns: [],
            rows: [],
            executionTime,
            affectedRows: 0
          };
        } else {
          // Generic empty result for other queries
          queryResult = {
            columns: ['Empty result'],
            rows: [],
            executionTime
          };
        }
        
        setResult(queryResult);
        
        // Add to history if not a duplicate of the most recent query
        if (query !== queryHistory[0]) {
          setQueryHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 queries
        }
        
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error executing query:', err);
      setError('Failed to execute query. Please check your syntax and try again.');
      setLoading(false);
    }
  };

  const selectHistoryItem = (index: number) => {
    setSelectedHistory(index);
    setQuery(queryHistory[index]);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your query history?')) {
      setQueryHistory([]);
      setSelectedHistory(null);
    }
  };

  // Sample queries to help users get started
  const sampleQueries = [
    'SELECT * FROM users LIMIT 10',
    'SELECT * FROM products WHERE category = "electronics" ORDER BY price DESC',
    'SELECT orders.id, users.name, orders.total FROM orders JOIN users ON orders.user_id = users.id',
    'INSERT INTO products (name, price, category, stock) VALUES ("New Product", 49.99, "accessories", 100)',
    'UPDATE users SET role = "admin" WHERE id = "u2"',
    'DELETE FROM products WHERE stock = 0'
  ];

  const applySampleQuery = (query: string) => {
    setQuery(query);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-gray-400 mt-1 mb-8">Run queries against your database collections</p>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-white p-4 rounded-lg">
          {error}
          <button 
            className="ml-4 text-red-300 hover:text-white"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with history and samples */}
        <div className="md:col-span-1 space-y-6">
          {/* Query History */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Query History</h2>
              {queryHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[250px]">
              {queryHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No queries yet
                </div>
              ) : (
                <ul>
                  {queryHistory.map((historyItem, index) => (
                    <li 
                      key={index}
                      className={`px-4 py-2 border-b border-slate-700 hover:bg-slate-700 cursor-pointer text-sm truncate ${
                        selectedHistory === index ? 'bg-slate-700' : ''
                      }`}
                      onClick={() => selectHistoryItem(index)}
                      title={historyItem}
                    >
                      {historyItem.length > 40 ? `${historyItem.substring(0, 40)}...` : historyItem}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sample Queries */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-3">
              <h2 className="text-lg font-medium text-white">Sample Queries</h2>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <ul>
                {sampleQueries.map((sampleQuery, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 border-b border-slate-700 hover:bg-slate-700 cursor-pointer text-sm"
                    onClick={() => applySampleQuery(sampleQuery)}
                  >
                    <div className="text-indigo-400 font-mono mb-1">
                      {sampleQuery.length > 40 ? `${sampleQuery.substring(0, 40)}...` : sampleQuery}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Click to use
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Query Editor and Results */}
        <div className="md:col-span-3 space-y-6">
          {/* Query Editor */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-3">
              <h2 className="text-lg font-medium text-white">Query Editor</h2>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-40 bg-slate-900 text-white p-4 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
              ></textarea>
              <div className="flex justify-end">
                <button
                  className="btn-primary py-2 px-4 flex items-center"
                  onClick={runQuery}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Run Query
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Query Results */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Results</h2>
              {result && (
                <div className="text-sm text-gray-400">
                  {result.affectedRows !== undefined ? (
                    `${result.affectedRows} row(s) affected • `
                  ) : (
                    `${result.rows.length} row(s) • `
                  )}
                  <span className="text-green-400">{result.executionTime.toFixed(3)}s</span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              {!result ? (
                <div className="p-8 text-center text-gray-400">
                  Run a query to see results
                </div>
              ) : result.affectedRows !== undefined ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center bg-green-900/30 text-green-400 px-4 py-3 rounded-lg">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Query executed successfully</span>
                  </div>
                  {result.affectedRows > 0 && (
                    <p className="mt-2 text-gray-400">
                      {result.affectedRows} row(s) affected
                    </p>
                  )}
                </div>
              ) : result.rows.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Query executed successfully, but no rows returned
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-700">
                      {result.columns.map((column, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {result.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-700">
                        {result.columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {typeof row[column] === 'object' 
                              ? JSON.stringify(row[column]) 
                              : String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryTool; 