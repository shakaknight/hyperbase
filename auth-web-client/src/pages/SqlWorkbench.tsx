import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrganizationStore } from '../stores/organizationStore';
import PageTitle from '../components/PageTitle';

interface Table {
  name: string;
  schema: string;
  rowCount: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  affectedRows?: number;
}

const SqlWorkbench = () => {
  const { token } = useAuthStore();
  const { getCurrentOrganization, getCurrentProject } = useOrganizationStore();
  
  // Table management state
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [newTableSchema, setNewTableSchema] = useState(`CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

  // Query execution state
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<number | null>(null);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'history'>('tables');

  const currentOrg = getCurrentOrganization();
  const currentProject = getCurrentProject();

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableColumns(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // For demo purposes, we'll use dummy data
      setTimeout(() => {
        setTables([
          { name: 'users', schema: 'public', rowCount: 156 },
          { name: 'products', schema: 'public', rowCount: 89 },
          { name: 'orders', schema: 'public', rowCount: 423 },
          { name: 'order_items', schema: 'public', rowCount: 1067 },
          { name: 'categories', schema: 'public', rowCount: 24 }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchTableColumns = async (tableName: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      // For demo purposes, we'll use dummy data
      setTimeout(() => {
        if (tableName === 'users') {
          setColumns([
            { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
            { name: 'email', type: 'varchar(255)', nullable: false, isPrimaryKey: false },
            { name: 'password_hash', type: 'varchar(255)', nullable: false, isPrimaryKey: false },
            { name: 'full_name', type: 'varchar(100)', nullable: true, isPrimaryKey: false },
            { name: 'created_at', type: 'timestamp', nullable: false, isPrimaryKey: false },
            { name: 'last_login', type: 'timestamp', nullable: true, isPrimaryKey: false }
          ]);
        } else if (tableName === 'products') {
          setColumns([
            { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
            { name: 'name', type: 'varchar(100)', nullable: false, isPrimaryKey: false },
            { name: 'description', type: 'text', nullable: true, isPrimaryKey: false },
            { name: 'price', type: 'numeric(10,2)', nullable: false, isPrimaryKey: false },
            { name: 'category_id', type: 'integer', nullable: true, isPrimaryKey: false },
            { name: 'created_at', type: 'timestamp', nullable: false, isPrimaryKey: false }
          ]);
        } else {
          setColumns([
            { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
            { name: 'name', type: 'varchar(100)', nullable: false, isPrimaryKey: false },
            { name: 'created_at', type: 'timestamp', nullable: false, isPrimaryKey: false }
          ]);
        }
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error(`Error fetching columns for table ${tableName}:`, err);
      setError(`Failed to load columns for table ${tableName}. Please try again.`);
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Simulate query execution
      setTimeout(() => {
        let result: QueryResult;
        const executionTime = Math.random() * 0.5 + 0.1; // Between 0.1 and 0.6 seconds
        
        const lowerQuery = query.toLowerCase();
        
        // Simulate different types of queries
        if (lowerQuery.includes('select') && lowerQuery.includes('from users')) {
          result = {
            columns: ['id', 'name', 'email', 'role', 'created_at'],
            rows: [
              { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: '2023-01-20T10:30:00Z' },
              { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: '2023-02-15T14:20:00Z' },
              { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: '2023-03-10T09:45:00Z' }
            ],
            executionTime
          };
        } else if (lowerQuery.includes('select') && lowerQuery.includes('from products')) {
          result = {
            columns: ['id', 'name', 'price', 'category', 'stock'],
            rows: [
              { id: 'p1', name: 'Laptop', price: 1299.99, category: 'electronics', stock: 45 },
              { id: 'p2', name: 'Smartphone', price: 899.99, category: 'electronics', stock: 120 },
              { id: 'p3', name: 'Headphones', price: 199.99, category: 'electronics', stock: 78 }
            ],
            executionTime
          };
        } else if (lowerQuery.includes('insert') || lowerQuery.includes('update') || lowerQuery.includes('delete')) {
          const affectedRows = Math.floor(Math.random() * 5) + 1;
          result = {
            columns: [],
            rows: [],
            executionTime,
            affectedRows
          };
        } else if (lowerQuery.includes('create') || lowerQuery.includes('alter') || lowerQuery.includes('drop')) {
          result = {
            columns: [],
            rows: [],
            executionTime,
            affectedRows: 0
          };
        } else {
          // Generic empty result for other queries
          result = {
            columns: ['Empty result'],
            rows: [],
            executionTime
          };
        }
        
        setQueryResult(result);
        
        // Add to history if not a duplicate of the most recent query
        if (query !== queryHistory[0]) {
          setQueryHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 queries
        }
        
        setIsLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error executing query:', err);
      setError('Failed to execute query. Please check your syntax and try again.');
      setIsLoading(false);
    }
  };

  const createTable = async () => {
    if (!newTableSchema.trim()) {
      setError('Table schema cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Set the SQL query to the create table statement
      setQuery(newTableSchema);
      
      // Close the modal
      setShowCreateTableModal(false);
      
      // Execute the query
      await executeQuery();
    } catch (err) {
      console.error('Error creating table:', err);
      setError('Failed to create table. Please check your SQL syntax.');
      setIsLoading(false);
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

  // Helper function to generate common queries for a table
  const getCommonQueries = (tableName: string) => {
    return {
      select: `SELECT * FROM ${tableName} LIMIT 10;`,
      insert: `INSERT INTO ${tableName} (${columns.filter(c => !c.isPrimaryKey || c.type !== 'serial').map(c => c.name).join(', ')})
VALUES (${columns.filter(c => !c.isPrimaryKey || c.type !== 'serial').map(() => '?').join(', ')});`,
      update: `UPDATE ${tableName}
SET column_name = value
WHERE condition;`,
      delete: `DELETE FROM ${tableName}
WHERE condition;`,
    };
  };

  // Sample queries to help users get started
  const sampleQueries = [
    'SELECT * FROM users LIMIT 10',
    'SELECT * FROM products WHERE category = \'electronics\' ORDER BY price DESC',
    'SELECT orders.id, users.name, orders.total FROM orders JOIN users ON orders.user_id = users.id',
    'INSERT INTO products (name, price, category, stock) VALUES (\'New Product\', 49.99, \'accessories\', 100)',
    'UPDATE users SET role = \'admin\' WHERE id = \'u2\'',
    'DELETE FROM products WHERE stock = 0'
  ];

  const applySampleQuery = (query: string) => {
    setQuery(query);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {currentProject ? `SQL Workbench: ${currentProject.name}` : "SQL Workbench"}
          </h1>
          <p className="text-gray-400">
            {currentOrg ? `Organization: ${currentOrg.name}` : "Explore and modify your database with SQL"}
          </p>
        </div>
        <button
          onClick={() => setShowCreateTableModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Table
        </button>
      </div>
      
      {!currentProject && (
        <div className="bg-indigo-900/30 border border-indigo-500 text-indigo-200 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Please select a project</p>
              <p className="mt-1 text-sm">Use the organization and project selectors in the sidebar to choose where to create tables and run queries.</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-white p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden mb-6">
              <div className="border-b border-slate-700 px-4 py-3">
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      activeTab === 'tables' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`} 
                    onClick={() => setActiveTab('tables')}
                  >
                    Tables
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      activeTab === 'history' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`} 
                    onClick={() => setActiveTab('history')}
                  >
                    History
                  </button>
                </div>
              </div>
              <div className="p-2">
                {activeTab === 'tables' && (
                  <div className="space-y-1">
                    {tables.length === 0 ? (
                      <p className="text-gray-400 text-center p-4">No tables found</p>
                    ) : (
                      tables.map((table) => (
                        <button
                          key={table.name}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedTable === table.name
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-300 hover:bg-slate-700'
                          }`}
                          onClick={() => setSelectedTable(table.name)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{table.name}</span>
                            <span className="text-xs opacity-70">{table.rowCount} rows</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div>
                    {queryHistory.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No queries yet
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-end p-2">
                          <button 
                            onClick={clearHistory}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Clear
                          </button>
                        </div>
                        <ul>
                          {queryHistory.map((historyItem, index) => (
                            <li 
                              key={index}
                              className={`px-3 py-2 border-b border-slate-700 hover:bg-slate-700 cursor-pointer text-sm truncate ${
                                selectedHistory === index ? 'bg-slate-700' : ''
                              }`}
                              onClick={() => selectHistoryItem(index)}
                              title={historyItem}
                            >
                              {historyItem.length > 40 ? `${historyItem.substring(0, 40)}...` : historyItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sample Queries */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
              <div className="border-b border-slate-700 px-4 py-3">
                <h2 className="text-lg font-medium text-white">Sample Queries</h2>
              </div>
              <div className="p-2">
                <div className="space-y-1">
                  {sampleQueries.map((queryText, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      onClick={() => applySampleQuery(queryText)}
                    >
                      <div className="truncate" title={queryText}>
                        {queryText.length > 40 ? `${queryText.substring(0, 40)}...` : queryText}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Table schema panel */}
            {selectedTable && (
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
                <div className="border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-white">
                    Schema: <span className="text-indigo-400">{selectedTable}</span>
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setQuery(getCommonQueries(selectedTable).select)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => setQuery(getCommonQueries(selectedTable).insert)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => setQuery(getCommonQueries(selectedTable).update)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setQuery(getCommonQueries(selectedTable).delete)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setQuery(`DROP TABLE ${selectedTable};`)}
                      className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Drop
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Column
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Nullable
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Key
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {columns.map((column) => (
                        <tr key={column.name} className="hover:bg-slate-750">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-white">
                            {column.name}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">
                            {column.type}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">
                            {column.nullable ? 'YES' : 'NO'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">
                            {column.isPrimaryKey ? 'PK' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SQL Query Panel */}
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
              <div className="border-b border-slate-700 px-4 py-3">
                <h2 className="text-lg font-medium text-white">SQL Query</h2>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full h-40 bg-slate-900 text-white p-4 font-mono text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                ></textarea>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={executeQuery}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={!query.trim()}
                  >
                    Execute Query
                  </button>
                </div>
              </div>
            </div>

            {/* Query Results Panel */}
            {queryResult && (
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
                <div className="border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-white">Results</h2>
                  <div className="text-sm text-gray-400">
                    {queryResult.affectedRows !== undefined ? (
                      <span>{queryResult.affectedRows} rows affected</span>
                    ) : (
                      <span>{queryResult.rows.length} rows returned</span>
                    )}
                    <span className="ml-3">Execution time: {queryResult.executionTime.toFixed(3)}s</span>
                  </div>
                </div>
                <div className="p-4">
                  {queryResult.rows.length === 0 && queryResult.affectedRows === undefined ? (
                    <p className="text-gray-400 text-center p-4">No results returned</p>
                  ) : queryResult.rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700">
                          <tr>
                            {queryResult.columns.map((column, index) => (
                              <th 
                                key={index} 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                          {queryResult.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-750">
                              {Object.values(row).map((value: any, colIndex) => (
                                <td 
                                  key={colIndex}
                                  className="px-6 py-3 whitespace-nowrap text-sm text-gray-300"
                                >
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-green-900/30 border border-green-500 text-green-300 rounded-lg p-4">
                      Query executed successfully.
                      {queryResult.affectedRows !== undefined && 
                        ` ${queryResult.affectedRows} ${queryResult.affectedRows === 1 ? 'row' : 'rows'} affected.`
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75" onClick={() => setShowCreateTableModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-6 py-4 border-b border-slate-700">
                <h3 className="text-lg font-medium text-white">Create New Table</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Enter the SQL statement to create a new table:
                </p>
                <textarea
                  className="w-full h-64 bg-slate-900 text-white p-4 font-mono text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  value={newTableSchema}
                  onChange={(e) => setNewTableSchema(e.target.value)}
                ></textarea>
              </div>
              <div className="px-6 py-4 border-t border-slate-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTableModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createTable}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlWorkbench; 