import React, { createContext, useContext } from 'react';
import { useTheme } from './ThemeContext';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  English: {
    // Navigation
    dashboard: 'Dashboard',
    materials: 'Materials',
    furniture: 'Furniture',
    workers: 'Workers',
    production: 'Production',
    sales: 'Sales',
    payments: 'Payments',
    calendar: 'Calendar',
    reports: 'Reports',
    settings: 'Settings',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    
    // Dashboard
    totalSales: 'Total Sales',
    totalProfit: 'Total Profit',
    materialValue: 'Material Value',
    activeWorkers: 'Active Workers',
    lowStockItems: 'Low Stock Items',
    pendingPayments: 'Pending Payments',
    thisMonthProduction: 'This Month Production',
    totalOrders: 'Total Orders',
    
    // Forms
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    quantity: 'Quantity',
    price: 'Price',
    date: 'Date',
    status: 'Status',
    notes: 'Notes',
  },
  Hindi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    materials: 'सामग्री',
    furniture: 'फर्नीचर',
    workers: 'कर्मचारी',
    production: 'उत्पादन',
    sales: 'बिक्री',
    payments: 'भुगतान',
    calendar: 'कैलेंडर',
    reports: 'रिपोर्ट',
    settings: 'सेटिंग्स',
    
    // Common
    add: 'जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    search: 'खोजें',
    export: 'निर्यात',
    import: 'आयात',
    loading: 'लोड हो रहा है...',
    
    // Dashboard
    totalSales: 'कुल बिक्री',
    totalProfit: 'कुल लाभ',
    materialValue: 'सामग्री मूल्य',
    activeWorkers: 'सक्रिय कर्मचारी',
    lowStockItems: 'कम स्टॉक आइटम',
    pendingPayments: 'लंबित भुगतान',
    thisMonthProduction: 'इस महीने का उत्पादन',
    totalOrders: 'कुल ऑर्डर',
    
    // Forms
    name: 'नाम',
    phone: 'फोन',
    email: 'ईमेल',
    address: 'पता',
    quantity: 'मात्रा',
    price: 'कीमत',
    date: 'तारीख',
    status: 'स्थिति',
    notes: 'नोट्स',
  },
  Gujarati: {
    // Navigation
    dashboard: 'ડેશબોર્ડ',
    materials: 'સામગ્રી',
    furniture: 'ફર્નિચર',
    workers: 'કામદારો',
    production: 'ઉત્પાદન',
    sales: 'વેચાણ',
    payments: 'ચુકવણી',
    calendar: 'કેલેન્ડર',
    reports: 'રિપોર્ટ',
    settings: 'સેટિંગ્સ',
    
    // Common
    add: 'ઉમેરો',
    edit: 'સંપાદિત કરો',
    delete: 'કાઢી નાખો',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    search: 'શોધો',
    export: 'નિકાસ',
    import: 'આયાત',
    loading: 'લોડ થઈ રહ્યું છે...',
    
    // Dashboard
    totalSales: 'કુલ વેચાણ',
    totalProfit: 'કુલ નફો',
    materialValue: 'સામગ્રી મૂલ્ય',
    activeWorkers: 'સક્રિય કામદારો',
    lowStockItems: 'ઓછા સ્ટોક આઇટમ',
    pendingPayments: 'બાકી ચુકવણી',
    thisMonthProduction: 'આ મહિનાનું ઉત્પાદન',
    totalOrders: 'કુલ ઓર્ડર',
    
    // Forms
    name: 'નામ',
    phone: 'ફોન',
    email: 'ઈમેલ',
    address: 'સરનામું',
    quantity: 'જથ્થો',
    price: 'કિંમત',
    date: 'તારીખ',
    status: 'સ્થિતિ',
    notes: 'નોંધો',
  },
};

export const LanguageProvider = ({ children }) => {
  const { language } = useTheme();

  const t = (key) => {
    return translations[language]?.[key] || translations.English[key] || key;
  };

  const value = {
    t,
    currentLanguage: language,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};