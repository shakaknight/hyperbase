import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

// Mock chart component
const Chart = ({ type, data, options }: { type: string, data: any, options: any }) => {
  // In a real implementation, this would use a chart library like Chart.js or Recharts
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-full">
      <h3 className="text-lg font-medium text-white mb-4">{options.title}</h3>
      <div className="flex items-center justify-center h-[200px]">
        {type === 'doughnut' && (
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              {data.datasets[0].data.map((value: number, index: number) => {
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = (value / total) * 100;
                const startAngle = index > 0 
                  ? data.datasets[0].data.slice(0, index).reduce((a: number, b: number) => a + b, 0) / total * 360
                  : 0;
                const endAngle = startAngle + (value / total * 360);
                
                // Convert angles to radians and calculate points
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                
                const x1 = 18 + 16 * Math.cos(startRad);
                const y1 = 18 + 16 * Math.sin(startRad);
                const x2 = 18 + 16 * Math.cos(endRad);
                const y2 = 18 + 16 * Math.sin(endRad);
                
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                
                const color = data.datasets[0].backgroundColor[index];
                
                return (
                  <path 
                    key={index}
                    d={`M 18 18 L ${x1} ${y1} A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                  />
                );
              })}
              <circle cx="18" cy="18" r="10" fill="#1e293b" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
              {data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)}
            </div>
          </div>
        )}
        
        {type === 'bar' && (
          <div className="w-full h-full flex items-end justify-between space-x-2">
            {data.labels.map((label: string, index: number) => {
              const max = Math.max(...data.datasets[0].data);
              const height = (data.datasets[0].data[index] / max) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-indigo-600 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="mt-2 text-xs text-gray-400">{label}</div>
                </div>
              );
            })}
          </div>
        )}
        
        {type === 'line' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-end">
                {data.datasets[0].data.map((value: number, index: number, array: number[]) => {
                  if (index === 0) return null;
                  
                  const max = Math.max(...array);
                  const min = Math.min(...array);
                  const range = max - min;
                  
                  const prevHeight = ((array[index - 1] - min) / range) * 100;
                  const currHeight = ((value - min) / range) * 100;
                  
                  const prevX = ((index - 1) / (array.length - 1)) * 100;
                  const currX = (index / (array.length - 1)) * 100;
                  
                  return (
                    <svg 
                      key={index} 
                      className="absolute bottom-0 left-0 w-full h-full overflow-visible"
                    >
                      <line 
                        x1={`${prevX}%`} 
                        y1={`${100 - prevHeight}%`} 
                        x2={`${currX}%`} 
                        y2={`${100 - currHeight}%`} 
                        stroke="#4f46e5" 
                        strokeWidth="2" 
                      />
                    </svg>
                  );
                })}
                
                {data.datasets[0].data.map((value: number, index: number, array: number[]) => {
                  const max = Math.max(...array);
                  const min = Math.min(...array);
                  const range = max - min;
                  
                  const height = ((value - min) / range) * 100;
                  const x = (index / (array.length - 1)) * 100;
                  
                  return (
                    <div 
                      key={index}
                      className="absolute w-2 h-2 bg-indigo-600 rounded-full -ml-1 -mb-1"
                      style={{ 
                        bottom: `${height}%`,
                        left: `${x}%`
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>
            <div className="h-6 flex justify-between">
              {data.labels.map((label: string, index: number) => (
                <div key={index} className="text-xs text-gray-400">{label}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      {options.showLegend && (
        <div className="mt-4">
          <div className="flex flex-wrap justify-center gap-4">
            {data.labels.map((label: string, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                ></div>
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Card component
const SummaryCard = ({ title, value, change, icon }: { title: string, value: string, change?: { value: string, positive: boolean }, icon: React.ReactNode }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-xs ${change.positive ? 'text-green-400' : 'text-red-400'} flex items-center mt-1`}>
              {change.positive ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {change.value}
            </p>
          )}
        </div>
        <div className="text-indigo-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalDocuments: 0,
    readOperations: 0,
    writeOperations: 0,
    topCollections: [] as { name: string, documentCount: number }[],
    operationsOverTime: [] as { date: string, reads: number, writes: number }[],
    storageUsage: [] as { collection: string, bytes: number }[]
  });
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be a call to your API
      // const response = await axios.get(`/api/analytics?timeRange=${timeRange}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setStats(response.data);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        // Mock data based on time range
        let operationsData: { date: string, reads: number, writes: number }[] = [];
        let labels: string[] = [];
        
        // Generate different data based on time range
        switch (timeRange) {
          case 'day':
            labels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
            operationsData = labels.map(hour => ({
              date: hour,
              reads: Math.floor(Math.random() * 500) + 100,
              writes: Math.floor(Math.random() * 200) + 50
            }));
            break;
          case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            operationsData = labels.map(day => ({
              date: day,
              reads: Math.floor(Math.random() * 3000) + 1000,
              writes: Math.floor(Math.random() * 1000) + 300
            }));
            break;
          case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            operationsData = labels.map(week => ({
              date: week,
              reads: Math.floor(Math.random() * 10000) + 5000,
              writes: Math.floor(Math.random() * 5000) + 1000
            }));
            break;
          case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            operationsData = labels.map(month => ({
              date: month,
              reads: Math.floor(Math.random() * 50000) + 20000,
              writes: Math.floor(Math.random() * 20000) + 8000
            }));
            break;
        }
        
        setStats({
          totalCollections: 15,
          totalDocuments: 2583,
          readOperations: operationsData.reduce((sum, item) => sum + item.reads, 0),
          writeOperations: operationsData.reduce((sum, item) => sum + item.writes, 0),
          topCollections: [
            { name: 'users', documentCount: 823 },
            { name: 'products', documentCount: 512 },
            { name: 'orders', documentCount: 418 },
            { name: 'inventory', documentCount: 256 },
            { name: 'settings', documentCount: 89 }
          ],
          operationsOverTime: operationsData,
          storageUsage: [
            { collection: 'users', bytes: 15728640 },  // 15 MB
            { collection: 'products', bytes: 31457280 },  // 30 MB
            { collection: 'orders', bytes: 20971520 },  // 20 MB
            { collection: 'inventory', bytes: 10485760 },  // 10 MB
            { collection: 'other', bytes: 5242880 }   // 5 MB
          ]
        });
        
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again.');
      setLoading(false);
    }
  };
  
  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Prepare chart data
  const storageChartData = {
    labels: stats.storageUsage.map(item => item.collection),
    datasets: [{
      data: stats.storageUsage.map(item => item.bytes),
      backgroundColor: [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'
      ]
    }]
  };
  
  const collectionChartData = {
    labels: stats.topCollections.map(item => item.name),
    datasets: [{
      data: stats.topCollections.map(item => item.documentCount),
      backgroundColor: [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'
      ]
    }]
  };
  
  const operationsChartData = {
    labels: stats.operationsOverTime.map(item => item.date),
    datasets: [{
      label: 'Operations',
      data: stats.operationsOverTime.map(item => item.reads + item.writes),
      backgroundColor: '#4f46e5'
    }]
  };
  
  const readWriteChartData = {
    labels: stats.operationsOverTime.map(item => item.date),
    datasets: [{
      label: 'Read/Write Operations',
      data: stats.operationsOverTime.map(item => item.reads),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      fill: true
    }]
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400">Monitor your database performance and usage</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
          {(['day', 'week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-white p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard 
              title="Total Collections" 
              value={stats.totalCollections.toString()} 
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>}
            />
            <SummaryCard 
              title="Total Documents" 
              value={stats.totalDocuments.toLocaleString()} 
              change={{ value: '12% increase', positive: true }}
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>}
            />
            <SummaryCard 
              title="Read Operations" 
              value={stats.readOperations.toLocaleString()} 
              change={{ value: '8% increase', positive: true }}
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>}
            />
            <SummaryCard 
              title="Write Operations" 
              value={stats.writeOperations.toLocaleString()}
              change={{ value: '5% decrease', positive: false }}
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>}
            />
          </div>
          
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Chart 
              type="line" 
              data={readWriteChartData}
              options={{ 
                title: 'Operations Over Time',
                showLegend: false,
              }} 
            />
            <Chart 
              type="bar" 
              data={operationsChartData}
              options={{ 
                title: 'Operations by ' + (
                  timeRange === 'day' ? 'Hour' : 
                  timeRange === 'week' ? 'Day' : 
                  timeRange === 'month' ? 'Week' : 'Month'
                ),
                showLegend: false,
              }} 
            />
          </div>
          
          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart 
              type="doughnut" 
              data={collectionChartData}
              options={{ 
                title: 'Documents by Collection',
                showLegend: true,
              }} 
            />
            <Chart 
              type="doughnut" 
              data={storageChartData}
              options={{ 
                title: 'Storage Usage by Collection',
                showLegend: true,
              }} 
            />
          </div>
          
          {/* Storage Details */}
          <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-4">Storage Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full table-auto">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="pb-3 text-sm font-medium text-gray-400">Collection</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Documents</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Storage Used</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Avg. Document Size</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.storageUsage.map((item, index) => {
                    const collection = stats.topCollections.find(c => c.name === item.collection);
                    const docCount = collection ? collection.documentCount : 0;
                    
                    return (
                      <tr key={item.collection} className="border-b border-slate-700">
                        <td className="py-3 text-white">{item.collection}</td>
                        <td className="py-3 text-white">{docCount.toLocaleString()}</td>
                        <td className="py-3 text-white">{formatBytes(item.bytes)}</td>
                        <td className="py-3 text-white">
                          {docCount > 0 ? formatBytes(item.bytes / docCount) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 