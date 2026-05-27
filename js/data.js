// ===== BUILDSTOCK DATA LAYER =====

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'CAT 320 Excavator', category: 'Excavators', cost: 185000, price: 225000, qty: 3 },
  { id: 'p2', name: 'John Deere 310L Backhoe', category: 'Backhoes', cost: 72000, price: 89500, qty: 5 },
  { id: 'p3', name: 'Komatsu D65 Bulldozer', category: 'Dozers', cost: 145000, price: 178000, qty: 2 },
  { id: 'p4', name: 'Bobcat S770 Skid Steer', category: 'Skid Steers', cost: 48000, price: 59900, qty: 7 },
  { id: 'p5', name: 'CAT 950M Wheel Loader', category: 'Loaders', cost: 210000, price: 255000, qty: 2 },
  { id: 'p6', name: 'Manitowoc 14000 Crane', category: 'Cranes', cost: 890000, price: 1100000, qty: 1 },
  { id: 'p7', name: 'Ingersoll Rand DD-14 Compactor', category: 'Compactors', cost: 14500, price: 18500, qty: 8 },
  { id: 'p8', name: 'Terex TA300 Dump Truck', category: 'Dump Trucks', cost: 275000, price: 335000, qty: 3 },
  { id: 'p9', name: 'Genie S-65 Boom Lift', category: 'Aerial Lifts', cost: 62000, price: 78500, qty: 4 },
  { id: 'p10', name: 'Wacker Neuson Trench Roller', category: 'Compactors', cost: 8200, price: 10800, qty: 12 },
  { id: 'p11', name: 'CAT 730 Articulated Truck', category: 'Dump Trucks', cost: 320000, price: 390000, qty: 2 },
  { id: 'p12', name: 'Volvo EC300E Excavator', category: 'Excavators', cost: 195000, price: 240000, qty: 4 },
];

const DEFAULT_EMPLOYEES = [
  { id: 'e1', name: 'Marcus Reid', role: 'Senior Sales Rep', phone: '416-555-0110' },
  { id: 'e2', name: 'Sandra Kowalski', role: 'Sales Manager', phone: '416-555-0121' },
  { id: 'e3', name: 'Derek Nguyen', role: 'Sales Rep', phone: '416-555-0132' },
  { id: 'e4', name: 'Tanya Bullock', role: 'Sales Rep', phone: '416-555-0143' },
];

function loadData() {
  try {
    const products = JSON.parse(localStorage.getItem('bs_products') || 'null') || DEFAULT_PRODUCTS;
    const employees = JSON.parse(localStorage.getItem('bs_employees') || 'null') || DEFAULT_EMPLOYEES;
    const sales = JSON.parse(localStorage.getItem('bs_sales') || '[]');
    return { products, employees, sales };
  } catch(e) {
    return { products: DEFAULT_PRODUCTS, employees: DEFAULT_EMPLOYEES, sales: [] };
  }
}

function saveData(data) {
  try {
    localStorage.setItem('bs_products', JSON.stringify(data.products));
    localStorage.setItem('bs_employees', JSON.stringify(data.employees));
    localStorage.setItem('bs_sales', JSON.stringify(data.sales));
  } catch(e) {}
}

// Global app state
window.BS = {
  data: loadData(),
  save() { saveData(this.data); },

  // Products
  getProduct(id) { return this.data.products.find(p => p.id === id); },
  addProduct(p) {
    p.id = 'p' + Date.now();
    this.data.products.push(p);
    this.save();
  },
  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx > -1) { this.data.products[idx] = { ...this.data.products[idx], ...updates }; this.save(); }
  },
  removeProduct(id) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
  },

  // Employees
  getEmployee(id) { return this.data.employees.find(e => e.id === id); },
  addEmployee(e) {
    e.id = 'e' + Date.now();
    this.data.employees.push(e);
    this.save();
  },
  updateEmployee(id, updates) {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx > -1) { this.data.employees[idx] = { ...this.data.employees[idx], ...updates }; this.save(); }
  },
  removeEmployee(id) {
    this.data.employees = this.data.employees.filter(e => e.id !== id);
    this.save();
  },

  // Sales
  recordSale(sale) {
    sale.id = 's' + Date.now();
    sale.date = new Date().toISOString();
    this.data.sales.unshift(sale);
    const prod = this.getProduct(sale.productId);
    if (prod) this.updateProduct(sale.productId, { qty: prod.qty - sale.qty });
    this.save();
    return sale;
  },

  // Computed stats
  getStats() {
    const { products, sales } = this.data;
    const totalRevenue = sales.reduce((s, x) => s + x.revenue, 0);
    const totalProfit = sales.reduce((s, x) => s + x.profit, 0);
    const inventoryValue = products.reduce((s, p) => s + p.cost * p.qty, 0);
    const lowStock = products.filter(p => p.qty <= 5).length;
    return { totalRevenue, totalProfit, inventoryValue, lowStock };
  },

  getEmployeeSales(empId) {
    return this.data.sales.filter(s => s.employeeId === empId);
  },
};
