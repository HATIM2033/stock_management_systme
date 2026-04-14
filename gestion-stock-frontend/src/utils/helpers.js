// Format currency
export const formatCurrency = (amount, currency = 'FCFA') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount).replace('XOF', currency);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  return new Date(date).toLocaleDateString('fr-FR', {
    ...defaultOptions,
    ...options,
  });
};

// Format date and time
export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(date).toLocaleString('fr-FR', {
    ...defaultOptions,
    ...options,
  });
};

// Format time
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(date).toLocaleTimeString('fr-FR', {
    ...defaultOptions,
    ...options,
  });
};

// Calculate relative time
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Check if object is empty
export const isEmpty = (obj) => {
  return obj === null || obj === undefined || 
    (typeof obj === 'object' && Object.keys(obj).length === 0);
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert to title case
export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Truncate text
export const truncate = (str, length, ending = '...') => {
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }
  return str;
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number (basic validation)
export const isValidPhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone);
};

// Get stock status
export const getStockStatus = (currentStock, minStock) => {
  if (currentStock === 0) {
    return {
      text: 'Rupture',
      color: 'text-red-600 bg-red-100',
      severity: 'critical'
    };
  }
  if (currentStock < minStock) {
    return {
      text: 'Faible',
      color: 'text-yellow-600 bg-yellow-100',
      severity: 'warning'
    };
  }
  return {
    text: 'Disponible',
    color: 'text-green-600 bg-green-100',
    severity: 'normal'
  };
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Generate color based on percentage
export const getColorByPercentage = (percentage) => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 50) return 'text-yellow-600';
  if (percentage >= 20) return 'text-orange-600';
  return 'text-red-600';
};

// Sort array by property
export const sortByProperty = (array, property, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'desc') {
      return b[property] > a[property] ? 1 : -1;
    }
    return a[property] > b[property] ? 1 : -1;
  });
};

// Filter array by property
export const filterByProperty = (array, property, value) => {
  return array.filter(item => {
    if (typeof value === 'string') {
      return item[property].toString().toLowerCase().includes(value.toLowerCase());
    }
    return item[property] === value;
  });
};

// Group array by property
export const groupByProperty = (array, property) => {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

// Calculate total from array of objects
export const calculateTotal = (array, property) => {
  return array.reduce((total, item) => total + (item[property] || 0), 0);
};

// Download file from blob
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random color
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

// Check if color is light or dark
export const isLightColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
};

// Get contrast color
export const getContrastColor = (bgColor) => {
  return isLightColor(bgColor) ? '#000000' : '#FFFFFF';
};
