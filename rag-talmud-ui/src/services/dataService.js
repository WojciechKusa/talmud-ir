// services/dataService.js
class DataService {
  constructor() {
    this.cache = new Map();
    this.baseUrl = '';
  }

  async fetchData(source) {
    // Check cache first
    if (this.cache.has(source)) {
      return this.cache.get(source);
    }

    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate data structure
      this.validateDataStructure(data);
      
      // Cache the result
      this.cache.set(source, data);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data from ${source}: ${error.message}`);
    }
  }

  validateDataStructure(data) {
    const requiredFields = ['query', 'answer', 'snippets'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid data structure. Missing fields: ${missingFields.join(', ')}`);
    }

    // Validate snippets structure
    if (typeof data.snippets !== 'object' || data.snippets === null) {
      throw new Error('Snippets must be an object');
    }

    // Validate each snippet
    Object.entries(data.snippets).forEach(([refId, snippets]) => {
      if (!Array.isArray(snippets)) {
        throw new Error(`Snippets for ${refId} must be an array`);
      }
      
      snippets.forEach((snippet, index) => {
        const requiredSnippetFields = ['text', 'source', 'page'];
        const missingSnippetFields = requiredSnippetFields.filter(
          field => !(field in snippet)
        );
        
        if (missingSnippetFields.length > 0) {
          throw new Error(
            `Invalid snippet structure in ${refId}[${index}]. Missing: ${missingSnippetFields.join(', ')}`
          );
        }
      });
    });
  }

  async saveData(source, data) {
    // For future implementation - save data back to server
    this.validateDataStructure(data);
    this.cache.set(source, data);
    
    // In a real app, this would make a POST/PUT request
    console.log('Data would be saved to:', source, data);
    return data;
  }

  clearCache(source = null) {
    if (source) {
      this.cache.delete(source);
    } else {
      this.cache.clear();
    }
  }

  // For testing different data sources
  setBaseUrl(url) {
    this.baseUrl = url;
  }
}

export const dataService = new DataService();