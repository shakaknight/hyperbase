import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'any';
  required: boolean;
  defaultValue?: any;
  array?: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'any';
  };
  object?: {
    properties: SchemaField[];
  };
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  
  // Add Data Relationships
  relation?: {
    collection: string;  // Target collection
    field: string;       // Field to match in target collection
    cascade?: 'delete' | 'set-null' | 'restrict'; // Cascade behavior
  };
  
  // Custom validation
  customValidation?: {
    function: string;  // JavaScript function as string
    errorMessage: string; // Custom error message
  };
  conditionalValidation?: {
    condition: string; // Condition under which validation applies
    validations: Array<{
      type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
      value?: any;
      function?: string;
      errorMessage: string;
    }>;
  };
}

interface CollectionSchema {
  name: string;
  fields: SchemaField[];
}

type PermissionType = 'read' | 'write' | 'update' | 'delete';

interface Permission {
  type: PermissionType;
  roles: string[];
}

interface PermissionTarget {
  permissions: Permission[];
}

interface Collection {
  id: string;
  name: string;
  document_count: number;
  created_at: string;
  schema?: CollectionSchema;
  permissions?: Permission[];
}

interface Document {
  id: string;
  data: any;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

// Realtime mock implementation
class RealtimeService {
  private callbacks: Map<string, Array<(data: any) => void>> = new Map();
  private connected: boolean = false;
  private reconnectTimer: any = null;
  
  constructor() {
    this.connect();
  }
  
  private connect() {
    // In a real implementation, this would establish a WebSocket connection
    console.log('Establishing realtime connection...');
    
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      console.log('Realtime connection established');
      
      // Notify all listeners that connection is ready
      if (this.callbacks.has('$connection.ready')) {
        this.callbacks.get('$connection.ready')?.forEach(callback => {
          callback({ type: 'connected' });
        });
      }
    }, 1000);
  }
  
  public subscribe(collection: string, callback: (data: any) => void): () => void {
    const key = `collections.${collection}.documents`;
    
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    
    this.callbacks.get(key)?.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  public subscribeConnection(callback: (data: any) => void): () => void {
    const key = '$connection.ready';
    
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    
    this.callbacks.get(key)?.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  // Method to simulate database events for testing
  public simulateEvent(collection: string, eventType: 'create' | 'update' | 'delete', document: Document) {
    const key = `collections.${collection}.documents`;
    
    if (this.callbacks.has(key)) {
      this.callbacks.get(key)?.forEach(callback => {
        callback({
          type: eventType,
          data: document
        });
      });
    }
  }
}

// Create a singleton instance of the realtime service
const realtimeService = new RealtimeService();

// Helper function for JSON syntax highlighting
const JsonHighlight = ({ json }: { json: any }) => {
  // Convert the JSON to a string with proper formatting
  const jsonString = JSON.stringify(json, null, 2);
  
  // Create the highlighted HTML
  const highlighted = jsonString.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-yellow-300'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-indigo-300'; // key
        } else {
          cls = 'text-green-300'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-pink-300'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-red-300'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
  
  return (
    <div 
      className="bg-slate-900 text-white p-4 font-mono text-sm rounded-lg overflow-auto h-[calc(100vh-350px)]" 
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

// Query condition interfaces
interface QueryCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

interface QueryGroup {
  conditions: QueryCondition[];
  operator: 'AND' | 'OR';
}

// Predefined roles for demo purposes
const AVAILABLE_ROLES = ['admin', 'editor', 'viewer', 'owner'];

const Explorer = () => {
  const { token } = useAuthStore();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [jsonEditorContent, setJsonEditorContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [documentSearch, setDocumentSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [queryConditions, setQueryConditions] = useState<QueryGroup>({
    conditions: [],
    operator: 'AND'
  });
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isQueryApplied, setIsQueryApplied] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [schemaEditorContent, setSchemaEditorContent] = useState('');
  const [schemaValidationEnabled, setSchemaValidationEnabled] = useState(false);
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<string[]>([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionTarget, setPermissionTarget] = useState<'collection'>('collection');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'fuzzy' | 'fulltext'>('basic');
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.7); // 0.0 to 1.0, higher = more strict
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocumentsForCollection(selectedCollection.id);
    } else {
      setDocuments([]);
      setFilteredDocuments([]);
      setSelectedDocument(null);
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (documentSearch.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const searchTerm = documentSearch.toLowerCase();
      setFilteredDocuments(
        documents.filter(doc => 
          doc.id.toLowerCase().includes(searchTerm) || 
          JSON.stringify(doc.data).toLowerCase().includes(searchTerm)
        )
      );
    }
  }, [documents, documentSearch]);

  // Realtime subscription effect
  useEffect(() => {
    if (!realtimeEnabled || !selectedCollection) return;
    
    setConnectionStatus('connecting');
    
    // Subscribe to connection status
    const connectionUnsubscribe = realtimeService.subscribeConnection((data) => {
      if (data.type === 'connected') {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    });
    
    // Subscribe to collection changes
    const unsubscribe = realtimeService.subscribe(selectedCollection.id, (event) => {
      if (event.type === 'create') {
        // Add new document
        setDocuments(prev => [...prev, event.data]);
        // Update collection count
        setCollections(prev => 
          prev.map(col => 
            col.id === selectedCollection.id 
              ? { ...col, document_count: col.document_count + 1 }
              : col
          )
        );
      } else if (event.type === 'update') {
        // Update existing document
        setDocuments(prev => 
          prev.map(doc => doc.id === event.data.id ? event.data : doc)
        );
        
        // Update selected document if it's the one that was updated
        if (selectedDocument && selectedDocument.id === event.data.id) {
          setSelectedDocument(event.data);
          if (!isEditing) {
            setJsonEditorContent(JSON.stringify(event.data.data, null, 2));
          }
        }
      } else if (event.type === 'delete') {
        // Remove document
        setDocuments(prev => prev.filter(doc => doc.id !== event.data.id));
        
        // Unselect if the current document was deleted
        if (selectedDocument && selectedDocument.id === event.data.id) {
          setSelectedDocument(null);
        }
        
        // Update collection count
        setCollections(prev => 
          prev.map(col => 
            col.id === selectedCollection.id 
              ? { ...col, document_count: Math.max(0, col.document_count - 1) }
              : col
          )
        );
      }
    });
    
    // For demo purposes, simulate some realtime events after a delay
    let timeoutId: NodeJS.Timeout;
    if (documents.length > 0) {
      timeoutId = setTimeout(() => {
        // Simulate an update to a random document
        const randomIndex = Math.floor(Math.random() * documents.length);
        const docToUpdate = { ...documents[randomIndex] };
        const updatedData = { ...docToUpdate.data, lastUpdated: new Date().toISOString() };
        
        const updatedDoc = {
          ...docToUpdate,
          data: updatedData,
          updated_at: new Date().toISOString()
        };
        
        realtimeService.simulateEvent(selectedCollection.id, 'update', updatedDoc);
      }, 10000); // Simulate update after 10 seconds
    }
    
    return () => {
      unsubscribe();
      connectionUnsubscribe();
      clearTimeout(timeoutId);
      setConnectionStatus('disconnected');
    };
  }, [realtimeEnabled, selectedCollection, documents.length]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + / - Show help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowHelpModal(true);
        return;
      }

      if (selectedCollection) {
        // Ctrl/Cmd + F - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder="Search documents..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          return;
        }

        // Ctrl/Cmd + N - New document
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          createDocument();
          return;
        }

        // Ctrl/Cmd + E - Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          exportCollection();
          return;
        }

        // Ctrl/Cmd + I - Import
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          fileInputRef.current?.click();
          return;
        }
      }

      if (selectedDocument) {
        // Ctrl/Cmd + D - Duplicate document
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          duplicateDocument(selectedDocument);
          return;
        }

        // Enter - Edit document (when not already editing)
        if (e.key === 'Enter' && !isEditing) {
          e.preventDefault();
          setIsEditing(true);
          return;
        }

        // Escape - Cancel editing (when editing)
        if (e.key === 'Escape' && isEditing) {
          e.preventDefault();
          setIsEditing(false);
          setJsonEditorContent(JSON.stringify(selectedDocument.data, null, 2));
          return;
        }

        // Ctrl/Cmd + S - Save document (when editing)
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
          e.preventDefault();
          saveDocument();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCollection, selectedDocument, isEditing]);

  // Add effect to extract available fields from documents for the query builder
  useEffect(() => {
    if (documents.length > 0) {
      // Extract all unique fields from document data
      const fields = new Set<string>();
      
      documents.forEach(doc => {
        Object.keys(doc.data).forEach(key => {
          fields.add(key);
        });
      });
      
      setAvailableFields(Array.from(fields).sort());
    } else {
      setAvailableFields([]);
    }
  }, [documents]);
  
  // Add a function to apply the query conditions
  const applyQueryConditions = useCallback(() => {
    if (!selectedCollection || queryConditions.conditions.length === 0) {
      // If no conditions, show all documents
      setFilteredDocuments(documents);
      setIsQueryApplied(false);
      return;
    }
    
    // Filter documents based on conditions
    const filtered = documents.filter(doc => {
      // Check if the document satisfies the conditions based on the operator
      return queryConditions.operator === 'AND'
        ? queryConditions.conditions.every(condition => 
            evaluateCondition(doc.data, condition)
          )
        : queryConditions.conditions.some(condition => 
            evaluateCondition(doc.data, condition)
          );
    });
    
    setFilteredDocuments(filtered);
    setIsQueryApplied(true);
    setShowQueryBuilder(false);
  }, [documents, queryConditions, selectedCollection]);
  
  // Helper function to evaluate a single condition
  const evaluateCondition = (data: any, condition: QueryCondition): boolean => {
    const { field, operator, value } = condition;
    
    // Handle nested fields with dot notation
    const fieldValue = field.split('.').reduce((obj, key) => 
      obj && typeof obj === 'object' ? obj[key] : undefined, data);
    
    if (fieldValue === undefined) {
      return false;
    }
    
    switch (operator) {
      case '==':
        return fieldValue == value;
      case '!=':
        return fieldValue != value;
      case '>':
        return fieldValue > value;
      case '>=':
        return fieldValue >= value;
      case '<':
        return fieldValue < value;
      case '<=':
        return fieldValue <= value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'endsWith':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
      default:
        return false;
    }
  };
  
  // Add function to add a new condition
  const addCondition = () => {
    if (availableFields.length === 0) return;
    
    setQueryConditions(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          field: availableFields[0],
          operator: '==',
          value: ''
        }
      ]
    }));
  };
  
  // Add function to update a condition
  const updateCondition = (index: number, field: keyof QueryCondition, value: any) => {
    setQueryConditions(prev => {
      const newConditions = [...prev.conditions];
      newConditions[index] = {
        ...newConditions[index],
        [field]: value
      };
      return {
        ...prev,
        conditions: newConditions
      };
    });
  };
  
  // Add function to remove a condition
  const removeCondition = (index: number) => {
    setQueryConditions(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };
  
  // Add function to toggle the operator (AND/OR)
  const toggleOperator = () => {
    setQueryConditions(prev => ({
      ...prev,
      operator: prev.operator === 'AND' ? 'OR' : 'AND'
    }));
  };
  
  // Add function to clear all query conditions
  const clearQuery = () => {
    setQueryConditions({
      conditions: [],
      operator: 'AND'
    });
    setFilteredDocuments(documents);
    setIsQueryApplied(false);
  };
  
  // Modify useEffect that handles document search to respect applied queries
  useEffect(() => {
    if (isQueryApplied) {
      // If a query is applied, we should search within the filtered set
      if (documentSearch.trim() === '') {
        // Just use the query-filtered documents without additional filtering
        return;
      }
      
      const searchTerm = documentSearch.toLowerCase();
      
      if (advancedSearchEnabled) {
        // Apply advanced search within the query results
        switch (searchMode) {
          case 'fuzzy':
            setFilteredDocuments(prev => applyFuzzySearch(prev, searchTerm));
            break;
          case 'fulltext':
            setFilteredDocuments(prev => applyFullTextSearch(prev, searchTerm));
            break;
          default:
            setFilteredDocuments(prev => 
              prev.filter(doc => 
                doc.id.toLowerCase().includes(searchTerm) || 
                JSON.stringify(doc.data).toLowerCase().includes(searchTerm)
              )
            );
        }
      } else {
        // Use basic search
        setFilteredDocuments(prev => 
          prev.filter(doc => 
            doc.id.toLowerCase().includes(searchTerm) || 
            JSON.stringify(doc.data).toLowerCase().includes(searchTerm)
          )
        );
      }
    } else {
      // No query applied, just use the normal search behavior
      if (documentSearch.trim() === '') {
        setFilteredDocuments(documents);
      } else {
        const searchTerm = documentSearch.toLowerCase();
        
        if (advancedSearchEnabled) {
          // Apply advanced search on all documents
          switch (searchMode) {
            case 'fuzzy':
              setFilteredDocuments(applyFuzzySearch(documents, searchTerm));
              break;
            case 'fulltext':
              setFilteredDocuments(applyFullTextSearch(documents, searchTerm));
              break;
            default:
              setFilteredDocuments(
                documents.filter(doc => 
                  doc.id.toLowerCase().includes(searchTerm) || 
                  JSON.stringify(doc.data).toLowerCase().includes(searchTerm)
                )
              );
          }
        } else {
          // Use basic search
          setFilteredDocuments(
            documents.filter(doc => 
              doc.id.toLowerCase().includes(searchTerm) || 
              JSON.stringify(doc.data).toLowerCase().includes(searchTerm)
            )
          );
        }
      }
    }
  }, [documents, documentSearch, isQueryApplied, advancedSearchEnabled, searchMode, searchFields, fuzzyThreshold]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, this would be a call to your API
      // const response = await axios.get('/api/database/collections', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setCollections(response.data);
      
      // For demo purposes, we'll use dummy data
      setTimeout(() => {
        setCollections([
          { id: '1', name: 'users', document_count: 156, created_at: '2023-01-15T12:00:00Z' },
          { id: '2', name: 'products', document_count: 89, created_at: '2023-01-20T14:30:00Z' },
          { id: '3', name: 'orders', document_count: 423, created_at: '2023-02-05T09:15:00Z' },
          { id: '4', name: 'inventory', document_count: 64, created_at: '2023-03-10T16:45:00Z' },
          { id: '5', name: 'settings', document_count: 12, created_at: '2023-04-22T11:20:00Z' }
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections. Please try again.');
      setLoading(false);
    }
  };

  const fetchDocumentsForCollection = async (collectionId: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsQueryApplied(false);
      setQueryConditions({
        conditions: [],
        operator: 'AND'
      });
      
      // In a real app, this would be a call to your API
      // const response = await axios.get(`/api/database/collections/${collectionId}/documents`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setDocuments(response.data);
      
      // For demo purposes, we'll use dummy data
      setTimeout(() => {
        if (collectionId === '1') { // users collection
          setDocuments([
            {
              id: 'u1',
              data: { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: '2023-01-20T10:30:00Z' },
              created_at: '2023-01-20T10:30:00Z',
              updated_at: '2023-01-20T10:30:00Z'
            },
            {
              id: 'u2',
              data: { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: '2023-02-15T14:20:00Z' },
              created_at: '2023-02-15T14:20:00Z',
              updated_at: '2023-02-15T14:20:00Z'
            },
            {
              id: 'u3',
              data: { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: '2023-03-10T09:45:00Z' },
              created_at: '2023-03-10T09:45:00Z',
              updated_at: '2023-03-10T09:45:00Z'
            }
          ]);
        } else if (collectionId === '2') { // products collection
          setDocuments([
            {
              id: 'p1',
              data: { id: 'p1', name: 'Laptop', price: 1299.99, category: 'electronics', stock: 45 },
              created_at: '2023-01-25T11:30:00Z',
              updated_at: '2023-01-25T11:30:00Z'
            },
            {
              id: 'p2',
              data: { id: 'p2', name: 'Smartphone', price: 899.99, category: 'electronics', stock: 120 },
              created_at: '2023-02-05T13:15:00Z',
              updated_at: '2023-02-05T13:15:00Z'
            },
            {
              id: 'p3',
              data: { id: 'p3', name: 'Headphones', price: 199.99, category: 'electronics', stock: 78 },
              created_at: '2023-02-10T16:20:00Z',
              updated_at: '2023-02-10T16:20:00Z'
            }
          ]);
        } else {
          setDocuments([
            {
              id: 'd1',
              data: { id: 'd1', sample: 'data', number: 42 },
              created_at: '2023-03-15T10:30:00Z',
              updated_at: '2023-03-15T10:30:00Z'
            },
            {
              id: 'd2',
              data: { id: 'd2', sample: 'information', active: true },
              created_at: '2023-03-16T11:45:00Z',
              updated_at: '2023-03-16T11:45:00Z'
            }
          ]);
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(`Error fetching documents for collection ${collectionId}:`, err);
      setError('Failed to load documents. Please try again.');
      setLoading(false);
    }
  };

  const selectDocument = (document: Document) => {
    setSelectedDocument(document);
    setJsonEditorContent(JSON.stringify(document.data, null, 2));
    setIsEditing(false);
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        const newCollection = {
          id: `new-${Date.now()}`,
          name: newCollectionName,
          document_count: 0,
          created_at: new Date().toISOString(),
          permissions: generateDefaultPermissions()
        };
        
        setCollections(prev => [...prev, newCollection]);
        setNewCollectionName('');
        setIsCreatingCollection(false);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection. Please try again.');
      setLoading(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be a call to your API
      // await axios.delete(`/api/database/collections/${collectionId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        setCollections(prev => prev.filter(collection => collection.id !== collectionId));
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(null);
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection. Please try again.');
      setLoading(false);
    }
  };

  const createDocument = async () => {
    if (!selectedCollection) return;

    try {
      setLoading(true);
      setError(null);
      
      // Create a document with default values if schema is enabled
      let initialData: any = { created: new Date().toISOString() };
      
      if (schemaValidationEnabled && selectedCollection.schema) {
        // Populate with default values from schema
        selectedCollection.schema.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          } else if (field.required) {
            // Provide sensible defaults for required fields
            switch (field.type) {
              case 'string': initialData[field.name] = ''; break;
              case 'number': initialData[field.name] = 0; break;
              case 'boolean': initialData[field.name] = false; break;
              case 'array': initialData[field.name] = []; break;
              case 'object': initialData[field.name] = {}; break;
              case 'null': initialData[field.name] = null; break;
              default: initialData[field.name] = undefined;
            }
          }
        });
      }
      
      // Rest of the existing create document logic with permissions
      setTimeout(() => {
        const newDocument = {
          id: `new-doc-${Date.now()}`,
          data: initialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          permissions: generateDefaultPermissions()
        };
        
        setDocuments(prev => [...prev, newDocument]);
        setLoading(false);
        selectDocument(newDocument);
        
        // If realtime is enabled, simulate the create event for other clients
        if (realtimeEnabled) {
          setTimeout(() => {
            realtimeService.simulateEvent(selectedCollection.id, 'create', newDocument);
          }, 500);
        }
      }, 500);
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document. Please try again.');
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!selectedCollection || !selectedDocument) return;

    try {
      setLoading(true);
      setError(null);
      setSchemaValidationErrors([]);
      
      let updatedData;
      try {
        updatedData = JSON.parse(jsonEditorContent);
      } catch (parseError) {
        setError('Invalid JSON. Please check your syntax.');
        setLoading(false);
        return;
      }
      
      // Validate against schema if enabled
      if (schemaValidationEnabled && selectedCollection.schema) {
        const validationErrors = validateDocument(updatedData, selectedCollection.schema);
        
        if (validationErrors.length > 0) {
          setSchemaValidationErrors(validationErrors);
          setLoading(false);
          return;
        }
      }
      
      // Rest of existing save logic...
      setTimeout(() => {
        const updatedDocument = {
          ...selectedDocument,
          data: updatedData,
          updated_at: new Date().toISOString()
        };
        
        setDocuments(prev => 
          prev.map(doc => doc.id === selectedDocument.id ? updatedDocument : doc)
        );
        setSelectedDocument(updatedDocument);
        setIsEditing(false);
        setLoading(false);
        
        // If realtime is enabled, simulate the update event for other clients
        if (realtimeEnabled) {
          setTimeout(() => {
            realtimeService.simulateEvent(selectedCollection.id, 'update', updatedDocument);
          }, 500);
        }
      }, 500);
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!selectedCollection) return;
    
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Find the document to be deleted for the realtime event
      const documentToDelete = documents.find(doc => doc.id === documentId);
      
      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setFilteredDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
        
        // Update collection document count
        setCollections(prev => 
          prev.map(col => 
            col.id === selectedCollection.id 
              ? { ...col, document_count: col.document_count - 1 }
              : col
          )
        );
        
        setLoading(false);
        
        // If realtime is enabled, simulate the delete event for other clients
        if (realtimeEnabled && documentToDelete) {
          setTimeout(() => {
            realtimeService.simulateEvent(selectedCollection.id, 'delete', documentToDelete);
          }, 500);
        }
      }, 500);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      setLoading(false);
    }
  };

  const duplicateDocument = async (originalDoc: Document) => {
    if (!selectedCollection) return;

    try {
      setLoading(true);
      setError(null);
      
      // Create a copy of the document data
      const newData = { ...originalDoc.data };
      if (newData.id) {
        newData.id = `${newData.id}-copy`;
      }
      
      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        const newDocument = {
          id: `${originalDoc.id}-copy`,
          data: newData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDocument]);
        setLoading(false);
        selectDocument(newDocument);
      }, 500);
    } catch (err) {
      console.error('Error duplicating document:', err);
      setError('Failed to duplicate document. Please try again.');
      setLoading(false);
    }
  };

  const exportCollection = () => {
    if (!selectedCollection || documents.length === 0) return;
    
    // Create a JSON string of all documents
    const jsonData = JSON.stringify(documents.map(doc => doc.data), null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection.name}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  const importDocuments = async () => {
    if (!selectedCollection) return;
    
    try {
      setImportError(null);
      let documentsToImport: any[] = [];
      
      try {
        documentsToImport = JSON.parse(importJson);
        if (!Array.isArray(documentsToImport)) {
          documentsToImport = [documentsToImport];
        }
      } catch (err) {
        setImportError('Invalid JSON format. Please check your input.');
        return;
      }
      
      if (documentsToImport.length === 0) {
        setImportError('No documents found to import.');
        return;
      }
      
      setLoading(true);
      
      // In a real app, this would be a call to your API to import documents
      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        const newDocs = documentsToImport.map((data, index) => ({
          id: `imported-${Date.now()}-${index}`,
          data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setDocuments(prev => [...prev, ...newDocs]);
        
        // Update collection document count
        setCollections(prev => 
          prev.map(col => 
            col.id === selectedCollection.id 
              ? { ...col, document_count: col.document_count + newDocs.length }
              : col
          )
        );
        
        setShowImportModal(false);
        setImportJson('');
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error importing documents:', err);
      setImportError('Failed to import documents. Please try again.');
      setLoading(false);
    }
  };
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  // Initialize schema editor content when selecting a collection
  useEffect(() => {
    if (selectedCollection) {
      if (selectedCollection.schema) {
        setSchemaEditorContent(JSON.stringify(selectedCollection.schema, null, 2));
      } else {
        // Create default schema template based on the first document if available
        if (documents.length > 0) {
          const firstDoc = documents[0];
          const generatedSchema = generateSchemaFromDocument(firstDoc.data);
          setSchemaEditorContent(JSON.stringify({
            name: selectedCollection.name,
            fields: generatedSchema
          }, null, 2));
        } else {
          // Empty template
          setSchemaEditorContent(JSON.stringify({
            name: selectedCollection.name,
            fields: []
          }, null, 2));
        }
      }
    }
  }, [selectedCollection, documents]);
  
  // Helper function to generate a schema from a document
  const generateSchemaFromDocument = (doc: any): SchemaField[] => {
    return Object.entries(doc).map(([key, value]) => {
      const field: SchemaField = {
        name: key,
        type: determineType(value),
        required: true
      };
      
      if (field.type === 'array' && Array.isArray(value) && value.length > 0) {
        const elementType = determineType(value[0]);
        field.array = {
          type: elementType === 'array' || elementType === 'null' ? 'any' : elementType
        };
      } else if (field.type === 'object' && value !== null && typeof value === 'object') {
        field.object = {
          properties: generateSchemaFromDocument(value)
        };
      }
      
      return field;
    });
  };
  
  // Helper function to determine the type of a value
  const determineType = (value: any): SchemaField['type'] => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'any';
  };
  
  // Function to save the schema
  const saveSchema = () => {
    try {
      const schema = JSON.parse(schemaEditorContent) as CollectionSchema;
      
      // Validate schema structure
      if (!schema.name || !Array.isArray(schema.fields)) {
        setError('Invalid schema format. Schema must have a name and fields array.');
        return;
      }
      
      // Update the collection with the schema
      setCollections(prev => 
        prev.map(col => 
          col.id === selectedCollection?.id 
            ? { ...col, schema } 
            : col
        )
      );
      
      setShowSchemaEditor(false);
      setError(null);
      setSchemaValidationEnabled(true);
    } catch (err) {
      setError('Invalid JSON schema format. Please check your syntax.');
    }
  };
  
  // Function to validate a document against the schema
  const validateDocument = (document: any, schema: CollectionSchema): string[] => {
    const errors: string[] = [];
    
    // Check each field in the schema
    schema.fields.forEach(field => {
      const value = document[field.name];
      
      // Check required fields
      if (field.required && (value === undefined || value === null)) {
        errors.push(`Field '${field.name}' is required but not provided.`);
        return;
      }
      
      // Skip validation if field is not present and not required
      if (value === undefined) return;
      
      // Process conditional validation if specified
      if (field.conditionalValidation && value !== undefined) {
        try {
          // Create a function that evaluates the condition with the document as context
          const conditionFn = new Function('doc', `return ${field.conditionalValidation.condition}`);
          
          // If condition is true, apply the validations
          if (conditionFn(document)) {
            for (const validation of field.conditionalValidation.validations) {
              const error = applyValidation(validation, field.name, value, document);
              if (error) errors.push(error);
            }
          }
        } catch (err) {
          console.error(`Error evaluating condition for field '${field.name}':`, err);
          errors.push(`Error in conditional validation for field '${field.name}'.`);
        }
      }
      
      // Apply custom validation if specified
      if (field.customValidation && value !== undefined) {
        try {
          // Create a function from the string
          const validateFn = new Function('value', 'doc', `return ${field.customValidation.function}`);
          
          // Execute the validation function
          const isValid = validateFn(value, document);
          
          if (!isValid) {
            errors.push(field.customValidation.errorMessage || `Field '${field.name}' failed custom validation.`);
          }
        } catch (err) {
          console.error(`Error in custom validation for field '${field.name}':`, err);
          errors.push(`Error in custom validation for field '${field.name}'.`);
        }
      }
      
      // Continue with existing validations
      // Validate type
      if (field.type !== 'any' && field.type !== 'null' && determineType(value) !== field.type) {
        errors.push(`Field '${field.name}' must be of type '${field.type}', got '${determineType(value)}'.`);
      }
      
      // Type-specific validations
      switch (field.type) {
        case 'string':
          if (typeof value === 'string') {
            if (field.min !== undefined && value.length < field.min) {
              errors.push(`Field '${field.name}' must be at least ${field.min} characters long.`);
            }
            if (field.max !== undefined && value.length > field.max) {
              errors.push(`Field '${field.name}' must be at most ${field.max} characters long.`);
            }
            if (field.pattern && !new RegExp(field.pattern).test(value)) {
              errors.push(`Field '${field.name}' does not match the required pattern.`);
            }
            if (field.enum && !field.enum.includes(value)) {
              errors.push(`Field '${field.name}' must be one of the allowed values.`);
            }
          }
          break;
        case 'number':
          if (typeof value === 'number') {
            if (field.min !== undefined && value < field.min) {
              errors.push(`Field '${field.name}' must be at least ${field.min}.`);
            }
            if (field.max !== undefined && value > field.max) {
              errors.push(`Field '${field.name}' must be at most ${field.max}.`);
            }
            if (field.enum && !field.enum.includes(value)) {
              errors.push(`Field '${field.name}' must be one of the allowed values.`);
            }
          }
          break;
        case 'array':
          if (Array.isArray(value)) {
            if (field.min !== undefined && value.length < field.min) {
              errors.push(`Array '${field.name}' must have at least ${field.min} items.`);
            }
            if (field.max !== undefined && value.length > field.max) {
              errors.push(`Array '${field.name}' must have at most ${field.max} items.`);
            }
            if (field.array && field.array.type !== 'any') {
              value.forEach((item, index) => {
                if (determineType(item) !== field.array!.type) {
                  errors.push(`Item at index ${index} in array '${field.name}' must be of type '${field.array!.type}'.`);
                }
              });
            }
          }
          break;
        case 'object':
          if (typeof value === 'object' && value !== null && field.object) {
            // Recursively validate object properties
            field.object.properties.forEach(propField => {
              const propValue = value[propField.name];
              
              if (propField.required && (propValue === undefined || propValue === null)) {
                errors.push(`Property '${field.name}.${propField.name}' is required but not provided.`);
              }
              
              // More detailed validation could be added here
            });
          }
          break;
      }
    });
    
    return errors;
  };

  // Helper function to apply a single validation rule
  const applyValidation = (
    validation: { type: string; value?: any; function?: string; errorMessage: string },
    fieldName: string,
    fieldValue: any,
    document: any
  ): string | null => {
    switch (validation.type) {
      case 'required':
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          return validation.errorMessage || `Field '${fieldName}' is required.`;
        }
        break;
      case 'min':
        if (typeof fieldValue === 'number' && fieldValue < validation.value) {
          return validation.errorMessage || `Field '${fieldName}' must be at least ${validation.value}.`;
        } else if (typeof fieldValue === 'string' && fieldValue.length < validation.value) {
          return validation.errorMessage || `Field '${fieldName}' must be at least ${validation.value} characters.`;
        }
        break;
      case 'max':
        if (typeof fieldValue === 'number' && fieldValue > validation.value) {
          return validation.errorMessage || `Field '${fieldName}' must be at most ${validation.value}.`;
        } else if (typeof fieldValue === 'string' && fieldValue.length > validation.value) {
          return validation.errorMessage || `Field '${fieldName}' must be at most ${validation.value} characters.`;
        }
        break;
      case 'pattern':
        if (typeof fieldValue === 'string' && !new RegExp(validation.value).test(fieldValue)) {
          return validation.errorMessage || `Field '${fieldName}' does not match the required pattern.`;
        }
        break;
      case 'custom':
        try {
          if (!validation.function) return null;
          
          const validateFn = new Function('value', 'doc', `return ${validation.function}`);
          const isValid = validateFn(fieldValue, document);
          
          if (!isValid) {
            return validation.errorMessage || `Field '${fieldName}' failed custom validation.`;
          }
        } catch (err) {
          console.error(`Error in custom validation for field '${fieldName}':`, err);
          return `Error in custom validation for field '${fieldName}'.`;
        }
        break;
    }
    
    return null;
  };

  // Function to load permissions when opening modal
  const openPermissionsModal = () => {
    if (selectedCollection) {
      setPermissions(selectedCollection.permissions || generateDefaultPermissions());
      setShowPermissionsModal(true);
    }
  };
  
  // Generate default permissions for new collections/documents
  const generateDefaultPermissions = (): Permission[] => {
    return [
      { type: 'read', roles: ['admin', 'editor', 'viewer', 'owner'] },
      { type: 'write', roles: ['admin', 'editor', 'owner'] },
      { type: 'update', roles: ['admin', 'editor', 'owner'] },
      { type: 'delete', roles: ['admin', 'owner'] }
    ];
  };
  
  // Function to save permissions
  const savePermissions = () => {
    if (selectedCollection) {
      setCollections(prev => 
        prev.map(col => 
          col.id === selectedCollection.id 
            ? { ...col, permissions } 
            : col
        )
      );
    }
    
    setShowPermissionsModal(false);
  };
  
  // Function to toggle a role for a permission type
  const togglePermissionRole = (type: PermissionType, role: string) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      const permIndex = newPermissions.findIndex(p => p.type === type);
      
      if (permIndex >= 0) {
        const roles = [...newPermissions[permIndex].roles];
        const roleIndex = roles.indexOf(role);
        
        if (roleIndex >= 0) {
          roles.splice(roleIndex, 1);
        } else {
          roles.push(role);
        }
        
        newPermissions[permIndex] = {
          ...newPermissions[permIndex],
          roles
        };
      }
      
      return newPermissions;
    });
  };
  
  // Function to check if a permission is granted for a role
  const hasPermission = (permissions: Permission[] | undefined, type: PermissionType, role: string): boolean => {
    if (!permissions) return false;
    
    const permission = permissions.find(p => p.type === type);
    return permission ? permission.roles.includes(role) : false;
  };

  // Add a function to check if the current user can perform an action
  const userCan = (action: PermissionType, target: Collection | Document | null): boolean => {
    // For now, return true to allow all actions regardless of permissions
    return true;
  };

  // Add these functions for advanced search
  const applyFuzzySearch = (docs: Document[], searchTerm: string): Document[] => {
    if (searchTerm.trim() === '') return docs;
    
    // Simple fuzzy search function
    const fuzzyMatch = (text: string, pattern: string, threshold: number): boolean => {
      if (!text) return false;
      text = text.toLowerCase();
      pattern = pattern.toLowerCase();
      
      // Exact match
      if (text.includes(pattern)) return true;
      
      // Fuzzy matching for short patterns can be error-prone, require stricter matching
      if (pattern.length <= 3) {
        threshold = Math.max(threshold, 0.8);
      }
      
      let score = 0;
      let lastIndex = -1;
      
      // Check if the characters in the pattern appear in the same order in the text
      for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        const index = text.indexOf(char, lastIndex + 1);
        
        if (index > -1) {
          score += 1;
          lastIndex = index;
        }
      }
      
      // Calculate match percentage
      const matchPercentage = score / pattern.length;
      return matchPercentage >= threshold;
    };
    
    return docs.filter(doc => {
      // Always check the ID
      if (fuzzyMatch(doc.id, searchTerm, fuzzyThreshold)) return true;
      
      // Check the fields
      if (searchFields.length > 0) {
        // Only search in the specified fields
        return searchFields.some(field => {
          const value = getNestedValue(doc.data, field);
          return typeof value === 'string' && fuzzyMatch(value, searchTerm, fuzzyThreshold);
        });
      } else {
        // Search all string values
        const jsonString = JSON.stringify(doc.data);
        return fuzzyMatch(jsonString, searchTerm, fuzzyThreshold);
      }
    });
  };
  
  const applyFullTextSearch = (docs: Document[], searchTerm: string): Document[] => {
    if (searchTerm.trim() === '') return docs;
    
    // Split search term into words for full-text search
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) return docs;
    
    return docs.filter(doc => {
      // Always check the ID
      if (searchWords.every(word => doc.id.toLowerCase().includes(word))) return true;
      
      if (searchFields.length > 0) {
        // Only search in the specified fields
        return searchFields.some(field => {
          const value = getNestedValue(doc.data, field);
          if (typeof value !== 'string') return false;
          
          // Check if all words exist in the field value
          return searchWords.every(word => value.toLowerCase().includes(word));
        });
      } else {
        // Search all string values in the document
        const jsonString = JSON.stringify(doc.data).toLowerCase();
        return searchWords.every(word => jsonString.includes(word));
      }
    });
  };
  
  // Helper function to get nested values using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  };
  
  // Function to open advanced search modal
  const openAdvancedSearch = () => {
    // Initialize search fields with available fields
    if (searchFields.length === 0 && availableFields.length > 0) {
      setSearchFields([...availableFields]);
    }
    setShowAdvancedSearchModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mt-1 mb-8">
        <p className="text-gray-400">Explore and manage your database collections and documents</p>
        <div className="flex items-center space-x-4">
          {selectedCollection && (
            <>
              <div className="flex items-center">
                <span className="text-gray-400 text-sm mr-2">Realtime:</span>
                <button
                  onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    realtimeEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      realtimeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {realtimeEnabled && (
                  <span className="ml-2 flex items-center text-sm">
                    <span 
                      className={`inline-block h-2 w-2 rounded-full mr-1 ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-500' 
                          : connectionStatus === 'connecting' 
                          ? 'bg-yellow-500 animate-pulse' 
                          : 'bg-red-500'
                      }`}
                    ></span>
                    <span className="text-gray-400">
                      {connectionStatus === 'connected' 
                        ? 'Live' 
                        : connectionStatus === 'connecting' 
                        ? 'Connecting' 
                        : 'Disconnected'}
                    </span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-400 text-sm mr-2">Schema Validation:</span>
                <button
                  onClick={() => {
                    if (!selectedCollection.schema && !schemaValidationEnabled) {
                      setShowSchemaEditor(true);
                    } else {
                      setSchemaValidationEnabled(!schemaValidationEnabled);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    schemaValidationEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      schemaValidationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                {selectedCollection.schema && (
                  <button
                    onClick={() => setShowSchemaEditor(true)}
                    className="ml-2 text-indigo-400 hover:text-indigo-300"
                    title="Edit Schema"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={() => setShowHelpModal(true)}
            className="text-gray-400 hover:text-white flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Help
          </button>
        </div>
      </div>

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

      {loading && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-4 rounded-lg shadow-xl flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
            <span className="text-white">Loading...</span>
          </div>
        </div>
      )}

      {/* Schema validation errors */}
      {schemaValidationErrors.length > 0 && (
        <div className="mb-6 bg-yellow-900/50 border border-yellow-500 text-white p-4 rounded-lg">
          <h4 className="font-medium mb-2">Schema Validation Errors:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {schemaValidationErrors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
          <button 
            className="mt-2 text-yellow-300 hover:text-yellow-200 text-sm"
            onClick={() => setSchemaValidationErrors([])}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collections Panel */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700 px-4 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Collections</h2>
            <button 
              onClick={() => setIsCreatingCollection(true)}
              className="btn-primary text-sm py-1 px-3"
            >
              New Collection
            </button>
          </div>

          {isCreatingCollection && (
            <div className="p-4 bg-slate-700">
              <input
                type="text"
                className="input w-full mb-2"
                placeholder="Collection Name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  className="btn-primary flex-1 text-sm py-1"
                  onClick={createCollection}
                >
                  Create
                </button>
                <button
                  className="btn-secondary flex-1 text-sm py-1"
                  onClick={() => {
                    setIsCreatingCollection(false);
                    setNewCollectionName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            {collections.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No collections found
              </div>
            ) : (
              <ul>
                {collections.map(collection => (
                  <li 
                    key={collection.id}
                    className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer ${
                      selectedCollection?.id === collection.id ? 'bg-slate-700' : ''
                    }`}
                    onClick={() => setSelectedCollection(collection)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{collection.name}</div>
                        <div className="text-gray-400 text-sm">{collection.document_count} documents</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPermissionsModal();
                          }}
                          title="Manage permissions"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCollection(collection.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Documents Panel with query builder */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700 px-4 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">
              {selectedCollection ? `${selectedCollection.name} Documents` : 'Documents'}
            </h2>
            {selectedCollection && (
              <div className="flex space-x-2">
                <button 
                  onClick={createDocument}
                  className="btn-primary text-sm py-1 px-3"
                >
                  New
                </button>
                <div className="relative">
                  <button 
                    className="btn-secondary text-sm py-1 px-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Import
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                      handleFileImport(e);
                      setShowImportModal(true);
                    }}
                  />
                </div>
                <button 
                  onClick={exportCollection}
                  className="btn-secondary text-sm py-1 px-3"
                  disabled={documents.length === 0}
                >
                  Export
                </button>
              </div>
            )}
          </div>
          
          {selectedCollection && (
            <div className="border-b border-slate-700">
              {/* Search and query toggle */}
              <div className="p-3 flex items-center">
                <div className="flex-1 flex">
                  <input
                    type="text"
                    className="w-full bg-slate-700 text-white border-0 rounded-l-md px-3 py-2 text-sm"
                    placeholder="Search documents..."
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                  />
                  <button
                    onClick={openAdvancedSearch}
                    className={`bg-slate-700 border-l border-slate-600 px-3 py-2 rounded-r-md ${
                      advancedSearchEnabled ? 'text-indigo-400' : 'text-gray-400'
                    }`}
                    title="Advanced search options"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="ml-2">
                  <button
                    onClick={() => setShowQueryBuilder(!showQueryBuilder)}
                    className={`text-sm px-2 py-1 rounded ${
                      isQueryApplied 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                    title="Advanced query"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Query builder panel */}
              {showQueryBuilder && (
                <div className="p-3 bg-slate-700 border-t border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white text-sm font-medium">Query Builder</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleOperator}
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded"
                      >
                        {queryConditions.operator}
                      </button>
                      <button
                        onClick={clearQuery}
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded"
                        disabled={queryConditions.conditions.length === 0}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  {/* Conditions */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {queryConditions.conditions.length === 0 ? (
                      <div className="text-gray-400 text-xs text-center py-2">
                        No conditions added yet
                      </div>
                    ) : (
                      queryConditions.conditions.map((condition, index) => (
                        <div key={index} className="flex space-x-2 items-center">
                          <select
                            className="bg-slate-800 text-white text-xs rounded border-0 px-2 py-1"
                            value={condition.field}
                            onChange={(e) => updateCondition(index, 'field', e.target.value)}
                          >
                            {availableFields.map(field => (
                              <option key={field} value={field}>{field}</option>
                            ))}
                          </select>
                          
                          <select
                            className="bg-slate-800 text-white text-xs rounded border-0 px-2 py-1"
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          >
                            <option value="==">equals</option>
                            <option value="!=">not equals</option>
                            <option value=">">greater than</option>
                            <option value=">=">greater or equals</option>
                            <option value="<">less than</option>
                            <option value="<=">less or equals</option>
                            <option value="contains">contains</option>
                            <option value="startsWith">starts with</option>
                            <option value="endsWith">ends with</option>
                          </select>
                          
                          <input
                            className="bg-slate-800 text-white text-xs rounded border-0 px-2 py-1 flex-1"
                            value={condition.value.toString()}
                            onChange={(e) => {
                              let value: string | number | boolean = e.target.value;
                              
                              // Try to convert to appropriate type
                              if (value === 'true') value = true;
                              else if (value === 'false') value = false;
                              else if (!isNaN(Number(value)) && value.trim() !== '') value = Number(value);
                              
                              updateCondition(index, 'value', value);
                            }}
                            placeholder="Value"
                          />
                          
                          <button
                            onClick={() => removeCondition(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add condition and apply buttons */}
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={addCondition}
                      className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded"
                      disabled={availableFields.length === 0}
                    >
                      + Add Condition
                    </button>
                    
                    <button
                      onClick={applyQueryConditions}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                      disabled={queryConditions.conditions.length === 0}
                    >
                      Apply Query
                    </button>
                  </div>
                  
                  {isQueryApplied && (
                    <div className="text-xs text-indigo-300 mt-2">
                      Showing {filteredDocuments.length} of {documents.length} documents
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {!selectedCollection ? (
              <div className="p-4 text-center text-gray-400">
                Select a collection to view documents
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {documents.length === 0 ? 'No documents found in this collection' : 'No documents match your search'}
              </div>
            ) : (
              <ul>
                {filteredDocuments.map(document => (
                  <li 
                    key={document.id}
                    className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer ${
                      selectedDocument?.id === document.id ? 'bg-slate-700' : ''
                    }`}
                    onClick={() => selectDocument(document)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium truncate max-w-[200px]">
                          {document.id}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Updated: {new Date(document.updated_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateDocument(document);
                          }}
                          title="Duplicate document"
                          disabled={!userCan('write', selectedCollection)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                          </svg>
                        </button>
                        <button
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove document permissions button functionality
                          }}
                          style={{ visibility: 'hidden' }}
                          title="Permissions not available for documents"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(document.id);
                          }}
                          title="Delete document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Document Viewer/Editor */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700 px-4 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">
              {selectedDocument ? 'Document Details' : 'Document Viewer'}
            </h2>
            {selectedDocument && (
              <div className="space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveDocument}
                      className="btn-primary text-sm py-1 px-3"
                      disabled={!userCan('update', selectedDocument)}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setJsonEditorContent(JSON.stringify(selectedDocument.data, null, 2));
                      }}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary text-sm py-1 px-3"
                      disabled={!userCan('update', selectedDocument)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => duplicateDocument(selectedDocument)}
                      className="btn-secondary text-sm py-1 px-3"
                      title="Duplicate document"
                      disabled={!userCan('write', selectedCollection)}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => openPermissionsModal()}
                      className="btn-secondary text-sm py-1 px-3"
                      style={{ display: 'none' }}
                      title="Permissions not available for documents"
                    >
                      Permissions
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="h-[calc(100vh-250px)] overflow-y-auto">
            {!selectedDocument ? (
              <div className="p-4 text-center text-gray-400">
                Select a document to view its contents
              </div>
            ) : (
              <div className="p-4">
                <div className="bg-slate-700 p-2 rounded-lg mb-4 text-xs text-gray-400">
                  <div>ID: <span className="text-white">{selectedDocument.id}</span></div>
                  <div>Created: <span className="text-white">{new Date(selectedDocument.created_at).toLocaleString()}</span></div>
                  <div>Updated: <span className="text-white">{new Date(selectedDocument.updated_at).toLocaleString()}</span></div>
                </div>
                {isEditing ? (
                  <textarea
                    className="w-full h-[calc(100vh-350px)] bg-slate-900 text-white p-4 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={jsonEditorContent}
                    onChange={(e) => setJsonEditorContent(e.target.value)}
                  ></textarea>
                ) : (
                  <JsonHighlight json={selectedDocument.data} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Import Documents</h3>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                  setImportError(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {importError && (
              <div className="mb-4 bg-red-900/50 border border-red-500 text-white p-3 rounded-lg text-sm">
                {importError}
              </div>
            )}
            
            <p className="text-gray-400 mb-4">
              Paste your JSON data below. The data should be an array of objects or a single object.
            </p>
            
            <textarea
              className="w-full h-64 bg-slate-900 text-white p-4 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[
  {
    "name": "Example",
    "value": 123
  }
]'
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                  setImportError(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={importDocuments}
                className="btn-primary"
                disabled={!importJson.trim()}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">General</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Show help</span>
                    <span className="text-indigo-400 font-mono">Ctrl + /</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Search documents</span>
                    <span className="text-indigo-400 font-mono">Ctrl + F</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">New document</span>
                    <span className="text-indigo-400 font-mono">Ctrl + N</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Export collection</span>
                    <span className="text-indigo-400 font-mono">Ctrl + E</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Import documents</span>
                    <span className="text-indigo-400 font-mono">Ctrl + I</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Document Editing</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Edit document</span>
                    <span className="text-indigo-400 font-mono">Enter</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Duplicate document</span>
                    <span className="text-indigo-400 font-mono">Ctrl + D</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Save changes</span>
                    <span className="text-indigo-400 font-mono">Ctrl + S</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Cancel editing</span>
                    <span className="text-indigo-400 font-mono">Esc</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              <p className="mb-2">Note: On Mac, use <span className="font-mono">⌘</span> (Command) instead of Ctrl.</p>
              <p>Keyboard shortcuts only work when not actively typing in an input field or text area.</p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="btn-primary"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Editor Modal */}
      {showSchemaEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedCollection?.schema ? 'Edit Schema' : 'Create Schema'}
              </h3>
              <button 
                onClick={() => setShowSchemaEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 mb-4">
              Define the schema for the {selectedCollection?.name} collection. This schema will be used to validate documents before saving.
            </p>

            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <textarea
                  className="w-full h-96 bg-slate-900 text-white p-4 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={schemaEditorContent}
                  onChange={(e) => setSchemaEditorContent(e.target.value)}
                ></textarea>
              </div>
              
              <div className="w-64 bg-slate-900 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-3">Data Relationships</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Define relationships between collections for referential integrity.
                </p>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Example relationship:</div>
                  <div className="bg-slate-800 p-2 rounded text-xs font-mono">
                    <div className="text-indigo-300">"relation": {`{`}</div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"collection":</span> <span className="text-green-300">"users"</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"field":</span> <span className="text-green-300">"id"</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"cascade":</span> <span className="text-green-300">"delete"</span>
                    </div>
                    <div className="text-indigo-300">{`}`}</div>
                  </div>
                </div>
                
                <h4 className="text-white font-medium mb-3 border-t border-slate-700 pt-3">Custom Validation</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Create custom validation rules with JavaScript.
                </p>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Example custom validation:</div>
                  <div className="bg-slate-800 p-2 rounded text-xs font-mono">
                    <div className="text-indigo-300">"customValidation": {`{`}</div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"function":</span> <span className="text-green-300">"(value, doc) =&gt; value.length &gt;= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)"</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"errorMessage":</span> <span className="text-green-300">"Password must be at least 8 characters with uppercase and numbers"</span>
                    </div>
                    <div className="text-indigo-300">{`}`}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Example conditional validation:</div>
                  <div className="bg-slate-800 p-2 rounded text-xs font-mono">
                    <div className="text-indigo-300">"conditionalValidation": {`{`}</div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"condition":</span> <span className="text-green-300">"doc.type === 'business'"</span>,
                    </div>
                    <div className="pl-2">
                      <span className="text-indigo-300">"validations":</span> <span className="text-yellow-300">[{`{`}</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-indigo-300">"type":</span> <span className="text-green-300">"required"</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-indigo-300">"errorMessage":</span> <span className="text-green-300">"Business ID is required for business accounts"</span>
                    </div>
                    <div className="pl-2"><span className="text-yellow-300">{`}`}]</span></div>
                    <div className="text-indigo-300">{`}`}</div>
                  </div>
                </div>
                
                <h5 className="text-white text-sm font-medium mb-2">Available Collections:</h5>
                <ul className="text-sm text-gray-400 mb-4">
                  {collections.map(col => (
                    <li key={col.id} className="mb-1">{col.name}</li>
                  ))}
                </ul>
                
                <h5 className="text-white text-sm font-medium mb-2">Cascade Options:</h5>
                <ul className="text-sm text-gray-400">
                  <li className="mb-1"><span className="text-indigo-300">delete</span>: Delete related documents</li>
                  <li className="mb-1"><span className="text-indigo-300">set-null</span>: Set field to null</li>
                  <li className="mb-1"><span className="text-indigo-300">restrict</span>: Prevent deletion</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSchemaEditor(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveSchema}
                className="btn-primary"
              >
                Save Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Manage Collection Permissions
              </h3>
              <button 
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 mb-4">
              Define who can access and modify this collection. Check the roles that should have each permission type.
            </p>
            
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-gray-400">Permission</th>
                    {AVAILABLE_ROLES.map(role => (
                      <th key={role} className="text-center py-2 text-gray-400">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(permission => (
                    <tr key={permission.type} className="border-t border-slate-600">
                      <td className="py-3 text-white">
                        {permission.type.charAt(0).toUpperCase() + permission.type.slice(1)}
                      </td>
                      {AVAILABLE_ROLES.map(role => (
                        <td key={role} className="py-3 text-center">
                          <button
                            onClick={() => togglePermissionRole(permission.type, role)}
                            className={`w-5 h-5 rounded ${
                              permission.roles.includes(role)
                                ? 'bg-indigo-600'
                                : 'bg-slate-800 border border-gray-600'
                            }`}
                          >
                            {permission.roles.includes(role) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="white">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 1.414L8 12.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={savePermissions}
                className="btn-primary"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Advanced Search</h3>
              <button 
                onClick={() => setShowAdvancedSearchModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enable-advanced-search"
                  className="mr-2"
                  checked={advancedSearchEnabled}
                  onChange={(e) => setAdvancedSearchEnabled(e.target.checked)}
                />
                <label htmlFor="enable-advanced-search" className="text-white">
                  Enable Advanced Search
                </label>
              </div>

              <div className={!advancedSearchEnabled ? "opacity-50 pointer-events-none" : ""}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Search Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="search-mode"
                        value="basic"
                        checked={searchMode === 'basic'}
                        onChange={() => setSearchMode('basic')}
                        className="mr-2"
                      />
                      <span className="text-white">Basic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="search-mode"
                        value="fuzzy"
                        checked={searchMode === 'fuzzy'}
                        onChange={() => setSearchMode('fuzzy')}
                        className="mr-2"
                      />
                      <span className="text-white">Fuzzy</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="search-mode"
                        value="fulltext"
                        checked={searchMode === 'fulltext'}
                        onChange={() => setSearchMode('fulltext')}
                        className="mr-2"
                      />
                      <span className="text-white">Full-text</span>
                    </label>
                  </div>
                </div>

                {searchMode === 'fuzzy' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Fuzzy Match Threshold: {fuzzyThreshold.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={fuzzyThreshold}
                      onChange={(e) => setFuzzyThreshold(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Loose</span>
                      <span>Strict</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Search in Fields
                  </label>
                  <div className="mb-2 flex items-center">
                    <button
                      onClick={() => setSearchFields(availableFields)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSearchFields([])}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-slate-900 rounded p-2">
                    {availableFields.map(field => (
                      <label key={field} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={searchFields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSearchFields(prev => [...prev, field]);
                            } else {
                              setSearchFields(prev => prev.filter(f => f !== field));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-white">{field}</span>
                      </label>
                    ))}
                    {availableFields.length === 0 && (
                      <p className="text-gray-500 text-sm">No fields available</p>
                    )}
                  </div>
                  {searchFields.length === 0 && (
                    <p className="text-yellow-400 text-xs mt-1">
                      No fields selected. Search will be performed on all fields.
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Search Tips
                  </label>
                  <div className="bg-slate-900 rounded p-3 text-xs text-gray-300">
                    <p className="mb-2">
                      <strong>Basic:</strong> Simple text matching.
                    </p>
                    <p className="mb-2">
                      <strong>Fuzzy:</strong> Finds approximate matches, good for typos or 
                      partially known terms.
                    </p>
                    <p>
                      <strong>Full-text:</strong> Searches for documents containing all words in 
                      any order, for more natural language queries.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAdvancedSearchModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAdvancedSearchModal(false)}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer; 