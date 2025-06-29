import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data, filename, title, columns) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Add table
  doc.autoTable({
    head: [columns],
    body: data.map(item => columns.map(col => item[col] || '')),
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportSalesReport = (sales) => {
  const salesData = sales.map(sale => ({
    'Sale ID': sale.id.slice(-6),
    'Customer Name': sale.customerName,
    'Customer Phone': sale.customerPhone,
    'Total Amount': sale.totalAmount,
    'Paid Amount': sale.paidAmount,
    'Balance': sale.totalAmount - sale.paidAmount,
    'Profit': sale.profit,
    'Payment Status': sale.paymentStatus,
    'Sale Date': new Date(sale.saleDate).toLocaleDateString(),
  }));
  
  return salesData;
};

export const exportInventoryReport = (materials) => {
  const inventoryData = materials.map(material => ({
    'Material Name': material.name,
    'Subtype': material.subtype,
    'Quantity': material.quantity,
    'Unit': material.unit,
    'Price per Unit': material.pricePerUnit,
    'Total Value': material.totalValue,
    'Supplier': material.supplier,
    'Low Stock Threshold': material.lowStockThreshold,
    'Stock Status': material.quantity <= material.lowStockThreshold ? 'Low Stock' : 'In Stock',
    'Purchase Date': new Date(material.purchaseDate).toLocaleDateString(),
  }));
  
  return inventoryData;
};

export const exportProductionReport = (productions, furniture, workers) => {
  const productionData = productions.map(production => {
    const furnitureItem = furniture.find(f => f.id === production.furnitureId);
    const mainWorker = workers.find(w => w.id === production.mainWorkerId);
    
    return {
      'Production ID': production.id.slice(-6),
      'Furniture': furnitureItem?.name || 'Unknown',
      'Category': furnitureItem?.category || 'N/A',
      'Quantity': production.quantity,
      'Main Worker': mainWorker?.name || 'Unknown',
      'Status': production.status,
      'Material Cost': production.materialCost,
      'Labor Cost': production.laborCost,
      'Total Cost': production.totalCost,
      'Production Date': new Date(production.productionDate).toLocaleDateString(),
    };
  });
  
  return productionData;
};

export const exportWorkersReport = (workers) => {
  const workersData = workers.map(worker => ({
    'Worker Name': worker.name,
    'Phone': worker.phone,
    'Role': worker.role,
    'Daily Wage': worker.dailyWage,
    'Total Earnings': worker.totalEarnings || 0,
    'Udhar Balance': worker.udharBalance || 0,
    'Status': worker.isActive ? 'Active' : 'Inactive',
    'Join Date': new Date(worker.joinDate).toLocaleDateString(),
    'Address': worker.address || 'N/A',
  }));
  
  return workersData;
};

export const exportFinancialReport = (sales, productions, udharTransactions) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalProductionCost = productions.reduce((sum, prod) => sum + prod.totalCost, 0);
  const totalExpenses = udharTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const financialData = [
    { 'Category': 'Total Revenue', 'Amount': totalRevenue },
    { 'Category': 'Total Profit', 'Amount': totalProfit },
    { 'Category': 'Production Costs', 'Amount': totalProductionCost },
    { 'Category': 'Other Expenses', 'Amount': totalExpenses },
    { 'Category': 'Net Profit', 'Amount': totalProfit - totalExpenses },
  ];
  
  return financialData;
};