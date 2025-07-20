export const BASE_URL = 'https://sms.sniperbuisnesscenter.com'; 
export const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com/api/v1'; 

// Utility function for safe currency formatting
export const formatCurrency = (amount: any): string => {
  // Handle undefined, null, empty string, or invalid values
  if (amount === undefined || amount === null || amount === '' || amount === 'undefined') {
    return '0 FCFA';
  }
  
  // Convert to number safely
  const numAmount = Number(amount);
  
  // Check if conversion resulted in NaN
  if (isNaN(numAmount)) {
    return '0 FCFA';
  }
  
  // Format with locale string
  return `${numAmount.toLocaleString()} FCFA`;
};

// Utility function for safe number formatting (without currency)
export const formatNumber = (value: any): string => {
  // Handle undefined, null, empty string, or invalid values
  if (value === undefined || value === null || value === '' || value === 'undefined') {
    return '0';
  }
  
  // Convert to number safely
  const numValue = Number(value);
  
  // Check if conversion resulted in NaN
  if (isNaN(numValue)) {
    return '0';
  }
  
  // Format with locale string
  return numValue.toLocaleString();
};

// Utility function for safe number calculation
export const safeNumber = (value: any): number => {
  // Handle undefined, null, empty string, or invalid values
  if (value === undefined || value === null || value === '' || value === 'undefined') {
    return 0;
  }
  
  // Convert to number safely
  const numValue = Number(value);
  
  // Check if conversion resulted in NaN
  if (isNaN(numValue)) {
    return 0;
  }
  
  return numValue;
}; 