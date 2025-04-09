import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
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

const SqlManager = () => {
  const { token } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [newTableSchema, setNewTableSchema] = useState(`CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

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
      
      // In a real app, this would be a call to your API
      // const response = await axios.get('/api/database/sql/tables', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setTables(response.data);
      
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
      
      // In a real app, this would be a call to your API
      // const response = await axios.get(`/api/database/sql/tables/${tableName}/columns`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setColumns(response.data);
      
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

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Replace with actual API call to execute SQL
      const response = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute query');
      }
      
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the query');
      setResults([]);
    } finally {
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
      
      // Set the SQL query to the create table statement and execute it
      setQuery(newTableSchema);
      
      // Close the modal
      setShowCreateTableModal(false);
      
      // Execute the query (which will handle the API call and state updates)
      await executeQuery();
    } catch (err) {
      console.error('Error creating table:', err);
      setError('Failed to create table. Please check your SQL syntax.');
      setIsLoading(false);
    }
  };

  // Helper function to generate table creation SQL
  const generateTableCreationSQL = (tableName: string, columns: { name: string; type: string; nullable: boolean; isPrimaryKey: boolean }[]) => {
    const columnDefinitions = columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.isPrimaryKey) def += ' PRIMARY KEY';
      if (!col.nullable) def += ' NOT NULL';
      return def;
    }).join(',\n  ');
    
    return `CREATE TABLE ${tableName} (\n  ${columnDefinitions}\n);`;
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SQL Workbench</h1>
          <p className="text-gray-400">Manage and query your SQL database</p>
        </div>
        <button
          onClick={() => setShowCreateTableModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Table
        </button>
      </div>
      
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
          {/* Tables Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
              <div className="border-b border-slate-700 px-4 py-3">
                <h2 className="text-lg font-medium text-white">Tables</h2>
              </div>
              <div className="p-2">
                {tables.length === 0 ? (
                  <p className="text-gray-400 text-center p-4">No tables found</p>
                ) : (
                  <div className="space-y-1">
                    {tables.map((table) => (
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Schema Panel */}
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
                        <tr key={column.name} className="hover:bg-slate-700">
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
                  onChange={handleQueryChange}
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
          </div>
        </div>
      )}
      
      {/* Query Results Panel */}
      {results.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden mb-8">
          <div className="border-b border-slate-700 px-4 py-3">
            <h2 className="text-lg font-medium text-white">Results</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {results.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-700">
                      {Object.values(row).map((value: any, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
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

export default SqlManager; 