import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [productions, setProductions] = useState([]);
  const [sales, setSales] = useState([]);
  const [udharTransactions, setUdharTransactions] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalMaterialValue: 0,
    lowStockItems: 0,
    activeWorkers: 0,
    pendingPayments: 0,
    thisMonthProduction: 0,
    topSellingFurniture: [],
    topWorkers: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedMaterials = localStorage.getItem('furniture_materials');
        const storedWorkers = localStorage.getItem('furniture_workers');
        const storedFurniture = localStorage.getItem('furniture_furniture');
        const storedProductions = localStorage.getItem('furniture_productions');
        const storedSales = localStorage.getItem('furniture_sales');
        const storedUdhar = localStorage.getItem('furniture_udhar');

        if (storedMaterials) setMaterials(JSON.parse(storedMaterials));
        if (storedWorkers) setWorkers(JSON.parse(storedWorkers));
        if (storedFurniture) setFurniture(JSON.parse(storedFurniture));
        if (storedProductions) setProductions(JSON.parse(storedProductions));
        if (storedSales) setSales(JSON.parse(storedSales));
        if (storedUdhar) setUdharTransactions(JSON.parse(storedUdhar));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('furniture_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('furniture_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('furniture_furniture', JSON.stringify(furniture));
  }, [furniture]);

  useEffect(() => {
    localStorage.setItem('furniture_productions', JSON.stringify(productions));
  }, [productions]);

  useEffect(() => {
    localStorage.setItem('furniture_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('furniture_udhar', JSON.stringify(udharTransactions));
  }, [udharTransactions]);

  // Recalculate metrics whenever data changes
  useEffect(() => {
    refreshMetrics();
  }, [materials, workers, furniture, productions, sales, udharTransactions]);

  const refreshMetrics = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalMaterialValue = materials.reduce((sum, material) => sum + material.totalValue, 0);
    const lowStockItems = materials.filter(material => material.quantity <= material.lowStockThreshold).length;
    const activeWorkers = workers.filter(worker => worker.isActive).length;
    const pendingPayments = sales.filter(sale => sale.paymentStatus !== 'paid').length;
    
    const currentMonth = new Date().getMonth();
    const thisMonthProduction = productions.filter(
      production => new Date(production.productionDate).getMonth() === currentMonth
    ).reduce((sum, production) => sum + production.quantity, 0);

    setDashboardMetrics({
      totalSales,
      totalProfit,
      totalMaterialValue,
      lowStockItems,
      activeWorkers,
      pendingPayments,
      thisMonthProduction,
      topSellingFurniture: [],
      topWorkers: [],
    });
  };

  // Material operations
  const addMaterial = (materialData) => {
    const newMaterial = {
      ...materialData,
      id: Date.now().toString(),
      totalValue: materialData.quantity * materialData.pricePerUnit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id, updates) => {
    setMaterials(prev => prev.map(material => 
      material.id === id 
        ? { 
            ...material, 
            ...updates, 
            totalValue: (updates.quantity || material.quantity) * (updates.pricePerUnit || material.pricePerUnit),
            updatedAt: new Date().toISOString()
          }
        : material
    ));
  };

  const deleteMaterial = (id) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  // Worker operations
  const addWorker = (workerData) => {
    const newWorker = {
      ...workerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  const updateWorker = (id, updates) => {
    setWorkers(prev => prev.map(worker => 
      worker.id === id ? { ...worker, ...updates } : worker
    ));
  };

  const deleteWorker = (id) => {
    setWorkers(prev => prev.filter(worker => worker.id !== id));
  };

  // Furniture operations
  const addFurniture = (furnitureData) => {
    const newFurniture = {
      ...furnitureData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFurniture(prev => [...prev, newFurniture]);
  };

  const updateFurniture = (id, updates) => {
    setFurniture(prev => prev.map(furniture => 
      furniture.id === id 
        ? { ...furniture, ...updates, updatedAt: new Date().toISOString() }
        : furniture
    ));
  };

  const deleteFurniture = (id) => {
    setFurniture(prev => prev.filter(furniture => furniture.id !== id));
  };

  // Production operations
  const addProduction = (productionData) => {
    const newProduction = {
      ...productionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProductions(prev => [...prev, newProduction]);
    
    // Update material quantities
    const furnitureItem = furniture.find(f => f.id === productionData.furnitureId);
    if (furnitureItem && furnitureItem.materials) {
      furnitureItem.materials.forEach(material => {
        const totalUsed = material.quantity * productionData.quantity;
        const currentMaterial = materials.find(m => m.id === material.materialId);
        if (currentMaterial && currentMaterial.quantity >= totalUsed) {
          updateMaterial(material.materialId, {
            quantity: currentMaterial.quantity - totalUsed
          });
        }
      });
    }
  };

  const updateProduction = (id, updates) => {
    setProductions(prev => prev.map(production => 
      production.id === id ? { ...production, ...updates } : production
    ));
  };

  // Sales operations
  const addSale = (saleData) => {
    const newSale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [...prev, newSale]);
  };

  const updateSale = (id, updates) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...updates } : sale
    ));
  };

  const deleteSale = (id) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  // Udhar operations
  const addUdharTransaction = (transactionData) => {
    const newTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUdharTransactions(prev => [...prev, newTransaction]);
    
    // Update worker udhar balance if it's a worker payment
    if (transactionData.type === 'worker' && transactionData.workerId) {
      const worker = workers.find(w => w.id === transactionData.workerId);
      if (worker) {
        const currentBalance = worker.udharBalance || 0;
        const newBalance = transactionData.status === 'paid' 
          ? currentBalance - transactionData.amount 
          : currentBalance + transactionData.amount;
        
        updateWorker(transactionData.workerId, {
          udharBalance: Math.max(0, newBalance),
          totalEarnings: (worker.totalEarnings || 0) + (transactionData.status === 'paid' ? transactionData.amount : 0)
        });
      }
    }
  };

  const exportData = () => {
    const data = {
      materials,
      workers,
      furniture,
      productions,
      sales,
      udharTransactions,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `furniture_business_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data) => {
    try {
      if (data.materials) setMaterials(data.materials);
      if (data.workers) setWorkers(data.workers);
      if (data.furniture) setFurniture(data.furniture);
      if (data.productions) setProductions(data.productions);
      if (data.sales) setSales(data.sales);
      if (data.udharTransactions) setUdharTransactions(data.udharTransactions);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const value = {
    materials,
    workers,
    furniture,
    productions,
    sales,
    udharTransactions,
    dashboardMetrics,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addWorker,
    updateWorker,
    deleteWorker,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    addProduction,
    updateProduction,
    addSale,
    updateSale,
    deleteSale,
    addUdharTransaction,
    refreshMetrics,
    exportData,
    importData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};