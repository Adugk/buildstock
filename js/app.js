// ===== BUILDSTOCK APP =====

const $ = id => document.getElementById(id);
const fmt = n => '$' + Math.round(n).toLocaleString();
const fmtSmall = n => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + Math.round(n/1000) + 'K' : '$' + Math.round(n);
const initials = name => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = 'toast hidden', 2500);
}

// ===== MODAL =====
function openModal(html) {
  $('modal-box').innerHTML = html;
  $('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
}

$('modal-overlay').addEventListener('click', e => {
  if (e.target === $('modal-overlay')) closeModal();
});

// ===== NAVIGATION =====
let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;

  document.querySelectorAll('.nav-link, .bottom-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const main = $('main-content');
  main.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'page-enter';

  switch(page) {
    case 'dashboard':   div.innerHTML = renderDashboard(); break;
    case 'products':    div.innerHTML = renderProducts(); break;
    case 'record-sale': div.innerHTML = renderRecordSale(); break;
    case 'sales':       div.innerHTML = renderSales(); break;
    case 'employees':   div.innerHTML = renderEmployees(); break;
    case 'ai':          div.innerHTML = renderAI(); break;
  }

  main.appendChild(div);
  attachHandlers(page);
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-page]');
  if (link) { e.preventDefault(); navigate(link.dataset.page); }
});

// ===== DASHBOARD =====
function renderDashboard() {
  const s = BS.getStats();
  const { products, sales } = BS.data;
  const lowProds = products.filter(p => p.qty <= 5);

  // Top 5 products by revenue
  const prodRevMap = {};
  sales.forEach(sale => {
    prodRevMap[sale.productId] = (prodRevMap[sale.productId] || 0) + sale.revenue;
  });
  const topProds = Object.entries(prodRevMap)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5)
    .map(([id, rev]) => ({ prod: BS.getProduct(id), rev }))
    .filter(x => x.prod);

  const maxRev = topProds.length ? Math.max(...topProds.map(x => x.rev)) : 1;

  const recent = sales.slice(0,6);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">${new Date().toLocaleDateString('en-CA', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
      </div>
    </div>

    ${lowProds.length ? `<div class="alert alert-warning">
      ⚠️ <strong>${lowProds.length} item${lowProds.length>1?'s':''}</strong> low on stock: ${lowProds.map(p=>p.name).join(', ')}
    </div>` : ''}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value accent">${fmtSmall(s.totalRevenue)}</div>
        <div class="stat-sub">${BS.data.sales.length} sales total</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Profit</div>
        <div class="stat-value green">${fmtSmall(s.totalProfit)}</div>
        <div class="stat-sub">${s.totalRevenue > 0 ? Math.round(s.totalProfit/s.totalRevenue*100) : 0}% margin</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Inventory Value</div>
        <div class="stat-value">${fmtSmall(s.inventoryValue)}</div>
        <div class="stat-sub">${products.length} products</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Low Stock</div>
        <div class="stat-value ${s.lowStock > 0 ? 'red' : 'green'}">${s.lowStock}</div>
        <div class="stat-sub">items need reorder</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Top Products by Revenue</span>
        </div>
        ${topProds.length ? `
          <div class="chart-bars">
            ${topProds.map(x => `
              <div class="chart-bar-wrap">
                <div class="chart-bar" style="height:${Math.round(x.rev/maxRev*100)}%" title="${x.prod.name}: ${fmt(x.rev)}"></div>
                <div class="chart-label">${x.prod.name.split(' ').slice(-1)[0]}</div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-state"><div class="empty-text">No sales yet</div></div>`}
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Sales</span>
          <a href="#" class="btn btn-sm" data-page="sales">View all</a>
        </div>
        ${recent.length ? recent.map(sale => {
          const prod = BS.getProduct(sale.productId);
          const emp = BS.getEmployee(sale.employeeId);
          return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
            <div>
              <div style="font-weight:500;">${prod ? prod.name : 'Unknown'}</div>
              <div style="color:var(--text3); font-size:12px;">${emp ? emp.name : ''} · ${new Date(sale.date).toLocaleDateString()}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:var(--accent); font-weight:600;">${fmt(sale.revenue)}</div>
              <div style="color:var(--green); font-size:12px;">+${fmt(sale.profit)}</div>
            </div>
          </div>`;
        }).join('') : `<div class="empty-state"><div class="empty-text">No sales recorded yet</div></div>`}
      </div>
    </div>
  `;
}

// ===== PRODUCTS =====
function renderProducts() {
  const { products } = BS.data;
  const cats = [...new Set(products.map(p => p.category))].sort();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">${products.length} items in inventory</p>
      </div>
      <button class="btn btn-primary" onclick="openAddProduct()">+ Add Product</button>
    </div>

    <div class="card" style="padding:0;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Cost</th>
              <th>Sell Price</th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.length ? products.map(p => {
              const margin = Math.round((p.price - p.cost) / p.price * 100);
              return `<tr>
                <td style="font-weight:500;">${p.name}</td>
                <td><span class="badge badge-amber">${p.category}</span></td>
                <td>${fmt(p.cost)}</td>
                <td style="font-weight:600;">${fmt(p.price)}</td>
                <td><span style="color:var(--green)">${margin}%</span></td>
                <td class="${p.qty <= 5 ? 'stock-low' : 'stock-ok'}">${p.qty} units${p.qty <= 5 ? ' ⚠' : ''}</td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm" onclick="openEditProduct('${p.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete('${p.id}')">Remove</button>
                  </div>
                </td>
              </tr>`;
            }).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="empty-text">No products yet. Add your first product.</div></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddProduct() {
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Add Product</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${productForm()}
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitProduct()">Add Product</button>
    </div>
  `);
}

function openEditProduct(id) {
  const p = BS.getProduct(id);
  if (!p) return;
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Edit Product</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${productForm(p)}
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitProduct('${id}')">Save Changes</button>
    </div>
  `);
}

function productForm(p = {}) {
  return `
    <div class="form-group">
      <label>Product Name</label>
      <input type="text" id="f-name" value="${p.name || ''}" placeholder="e.g. CAT 320 Excavator" />
    </div>
    <div class="form-group">
      <label>Category</label>
      <input type="text" id="f-cat" value="${p.category || ''}" placeholder="e.g. Excavators" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cost Price ($)</label>
        <input type="number" id="f-cost" value="${p.cost || ''}" placeholder="0" min="0" />
      </div>
      <div class="form-group">
        <label>Selling Price ($)</label>
        <input type="number" id="f-price" value="${p.price || ''}" placeholder="0" min="0" />
      </div>
    </div>
    <div class="form-group">
      <label>Quantity in Stock</label>
      <input type="number" id="f-qty" value="${p.qty !== undefined ? p.qty : ''}" placeholder="0" min="0" />
    </div>
  `;
}

function submitProduct(id) {
  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-cat').value.trim();
  const cost = parseFloat(document.getElementById('f-cost').value);
  const price = parseFloat(document.getElementById('f-price').value);
  const qty = parseInt(document.getElementById('f-qty').value);

  if (!name || !category || isNaN(cost) || isNaN(price) || isNaN(qty)) {
    showToast('Please fill in all fields', 'error'); return;
  }
  if (price < cost) { showToast('Selling price should be ≥ cost', 'error'); return; }

  if (id) {
    BS.updateProduct(id, { name, category, cost, price, qty });
    showToast('Product updated');
  } else {
    BS.addProduct({ name, category, cost, price, qty });
    showToast('Product added');
  }
  closeModal();
  navigate('products');
}

function confirmDelete(id) {
  const p = BS.getProduct(id);
  if (!p) return;
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Remove Product</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <p style="color:var(--text2); margin-bottom:20px;">Remove <strong style="color:var(--text)">${p.name}</strong> from inventory? This cannot be undone.</p>
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="deleteProduct('${id}')">Remove</button>
    </div>
  `);
}

function deleteProduct(id) {
  BS.removeProduct(id);
  closeModal();
  showToast('Product removed');
  navigate('products');
}

// ===== RECORD SALE =====
function renderRecordSale() {
  const { products, employees } = BS.data;
  const inStock = products.filter(p => p.qty > 0);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Record Sale</h1>
        <p class="page-subtitle">Log a new equipment sale</p>
      </div>
    </div>

    <div style="max-width:540px;">
      <div class="card">
        <div class="form-group">
          <label>Product</label>
          <select id="sale-product" onchange="updateSalePreview()">
            <option value="">— Select product —</option>
            ${inStock.map(p => `<option value="${p.id}">${p.name} (${p.qty} in stock) — ${fmt(p.price)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Quantity</label>
          <input type="number" id="sale-qty" value="1" min="1" oninput="updateSalePreview()" />
        </div>

        <div class="form-group">
          <label>Employee (Sales Rep)</label>
          <select id="sale-emp">
            <option value="">— Select employee —</option>
            ${employees.map(e => `<option value="${e.id}">${e.name} — ${e.role}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Notes (optional)</label>
          <input type="text" id="sale-notes" placeholder="e.g. Customer: ABC Construction" />
        </div>

        <div id="sale-preview" style="display:none;" class="sale-preview"></div>

        <div style="margin-top:20px;">
          <button class="btn btn-primary" style="width:100%;" onclick="submitSale()">Confirm Sale</button>
        </div>
      </div>
    </div>
  `;
}

function updateSalePreview() {
  const prodId = document.getElementById('sale-product')?.value;
  const qty = parseInt(document.getElementById('sale-qty')?.value) || 0;
  const preview = document.getElementById('sale-preview');
  if (!preview) return;

  const prod = BS.getProduct(prodId);
  if (!prod || qty < 1) { preview.style.display = 'none'; return; }

  const maxQty = prod.qty;
  if (qty > maxQty) {
    document.getElementById('sale-qty').value = maxQty;
    return updateSalePreview();
  }

  const revenue = prod.price * qty;
  const cost = prod.cost * qty;
  const profit = revenue - cost;
  const margin = Math.round(profit / revenue * 100);

  preview.style.display = 'block';
  preview.innerHTML = `
    <div class="sale-preview-row"><span>Unit Price</span><span>${fmt(prod.price)}</span></div>
    <div class="sale-preview-row"><span>Quantity</span><span>${qty}</span></div>
    <div class="sale-preview-row"><span>Revenue</span><span>${fmt(revenue)}</span></div>
    <div class="sale-preview-row"><span>Cost</span><span>${fmt(cost)}</span></div>
    <div class="sale-preview-row total">
      <span>Profit</span>
      <span class="profit">${fmt(profit)} (${margin}% margin)</span>
    </div>
  `;
}

function submitSale() {
  const productId = document.getElementById('sale-product')?.value;
  const qty = parseInt(document.getElementById('sale-qty')?.value) || 0;
  const employeeId = document.getElementById('sale-emp')?.value;
  const notes = document.getElementById('sale-notes')?.value.trim();

  if (!productId) { showToast('Select a product', 'error'); return; }
  if (!employeeId) { showToast('Select an employee', 'error'); return; }
  if (qty < 1) { showToast('Quantity must be at least 1', 'error'); return; }

  const prod = BS.getProduct(productId);
  if (!prod) { showToast('Product not found', 'error'); return; }
  if (qty > prod.qty) { showToast('Not enough stock', 'error'); return; }

  const revenue = prod.price * qty;
  const profit = (prod.price - prod.cost) * qty;

  BS.recordSale({ productId, qty, employeeId, revenue, profit, notes, productName: prod.name });
  showToast(`Sale recorded — ${fmt(revenue)} revenue`);
  navigate('dashboard');
}

// ===== SALES HISTORY =====
function renderSales() {
  const { sales } = BS.data;

  const totalRev = sales.reduce((s, x) => s + x.revenue, 0);
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales History</h1>
        <p class="page-subtitle">${sales.length} transactions · ${fmt(totalRev)} total revenue</p>
      </div>
    </div>

    ${sales.length ? `
      <div class="stats-grid" style="margin-bottom:20px;">
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value accent">${fmtSmall(totalRev)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Profit</div>
          <div class="stat-value green">${fmtSmall(totalProfit)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Sale Value</div>
          <div class="stat-value">${fmtSmall(totalRev / sales.length)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Margin</div>
          <div class="stat-value">${Math.round(totalProfit/totalRev*100)}%</div>
        </div>
      </div>
    ` : ''}

    <div class="card" style="padding:0;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Employee</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${sales.length ? sales.map(s => {
              const prod = BS.getProduct(s.productId);
              const emp = BS.getEmployee(s.employeeId);
              const margin = Math.round(s.profit / s.revenue * 100);
              return `<tr>
                <td style="color:var(--text2); white-space:nowrap;">${new Date(s.date).toLocaleDateString('en-CA')}</td>
                <td style="font-weight:500;">${prod ? prod.name : s.productName || 'Unknown'}</td>
                <td>${s.qty}</td>
                <td>${emp ? `<span class="badge badge-blue">${emp.name}</span>` : '—'}</td>
                <td style="font-weight:600; color:var(--accent);">${fmt(s.revenue)}</td>
                <td style="color:var(--green);">+${fmt(s.profit)} <span style="color:var(--text3); font-size:11px;">(${margin}%)</span></td>
                <td style="color:var(--text2); font-size:12px;">${s.notes || '—'}</td>
              </tr>`;
            }).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="empty-text">No sales recorded yet. <a href="#" data-page="record-sale" style="color:var(--accent);">Record your first sale →</a></div></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== EMPLOYEES =====
function renderEmployees() {
  const { employees, sales } = BS.data;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Employees</h1>
        <p class="page-subtitle">${employees.length} team members</p>
      </div>
      <button class="btn btn-primary" onclick="openAddEmployee()">+ Add Employee</button>
    </div>

    <div class="emp-grid">
      ${employees.map(emp => {
        const empSales = BS.getEmployeeSales(emp.id);
        const empRev = empSales.reduce((s, x) => s + x.revenue, 0);
        const empProfit = empSales.reduce((s, x) => s + x.profit, 0);
        return `
          <div class="emp-card">
            <div class="emp-avatar">${initials(emp.name)}</div>
            <div class="emp-name">${emp.name}</div>
            <div class="emp-role">${emp.role}</div>
            ${emp.phone ? `<div style="font-size:12px; color:var(--text3); margin-bottom:8px;">${emp.phone}</div>` : ''}
            <div class="emp-stats">
              <div>
                <div class="emp-stat-val">${empSales.length}</div>
                <div class="emp-stat-lbl">Sales</div>
              </div>
              <div>
                <div class="emp-stat-val">${fmtSmall(empRev)}</div>
                <div class="emp-stat-lbl">Revenue</div>
              </div>
              <div>
                <div class="emp-stat-val">${fmtSmall(empProfit)}</div>
                <div class="emp-stat-lbl">Profit</div>
              </div>
            </div>
            <div class="emp-actions">
              <button class="btn btn-sm" onclick="openEditEmployee('${emp.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="confirmRemoveEmployee('${emp.id}')">Remove</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openAddEmployee() {
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Add Employee</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${employeeForm()}
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitEmployee()">Add Employee</button>
    </div>
  `);
}

function openEditEmployee(id) {
  const emp = BS.getEmployee(id);
  if (!emp) return;
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Edit Employee</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${employeeForm(emp)}
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitEmployee('${id}')">Save Changes</button>
    </div>
  `);
}

function employeeForm(e = {}) {
  return `
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" id="ef-name" value="${e.name || ''}" placeholder="e.g. John Smith" />
    </div>
    <div class="form-group">
      <label>Role / Title</label>
      <input type="text" id="ef-role" value="${e.role || ''}" placeholder="e.g. Sales Rep" />
    </div>
    <div class="form-group">
      <label>Phone (optional)</label>
      <input type="tel" id="ef-phone" value="${e.phone || ''}" placeholder="e.g. 416-555-0100" />
    </div>
  `;
}

function submitEmployee(id) {
  const name = document.getElementById('ef-name').value.trim();
  const role = document.getElementById('ef-role').value.trim();
  const phone = document.getElementById('ef-phone').value.trim();

  if (!name || !role) { showToast('Name and role are required', 'error'); return; }

  if (id) {
    BS.updateEmployee(id, { name, role, phone });
    showToast('Employee updated');
  } else {
    BS.addEmployee({ name, role, phone });
    showToast('Employee added');
  }
  closeModal();
  navigate('employees');
}

function confirmRemoveEmployee(id) {
  const emp = BS.getEmployee(id);
  if (!emp) return;
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Remove Employee</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <p style="color:var(--text2); margin-bottom:20px;">Remove <strong style="color:var(--text)">${emp.name}</strong>? Their sales history will be kept.</p>
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="removeEmployee('${id}')">Remove</button>
    </div>
  `);
}

function removeEmployee(id) {
  BS.removeEmployee(id);
  closeModal();
  showToast('Employee removed');
  navigate('employees');
}

// ===== AI ASSISTANT =====
let aiMessages = [];

function renderAI() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI Assistant</h1>
        <p class="page-subtitle">Powered by Claude — asks about your live inventory & sales</p>
      </div>
    </div>

    <div class="card">
      <div id="ai-messages" class="ai-messages">
        <div class="ai-msg">
          <div class="ai-avatar">AI</div>
          <div class="ai-bubble">Hey! I'm your BuildStock AI. I have full access to your inventory, sales data, and employee performance. What would you like to know?</div>
        </div>
      </div>

      <div class="quick-prompts">
        <button class="quick-btn" onclick="aiAsk('Which products should I reorder?')">Reorder suggestions</button>
        <button class="quick-btn" onclick="aiAsk('Who is my top salesperson?')">Top salesperson</button>
        <button class="quick-btn" onclick="aiAsk('What is my best margin product?')">Best margin item</button>
        <button class="quick-btn" onclick="aiAsk('Give me a full inventory summary')">Inventory summary</button>
        <button class="quick-btn" onclick="aiAsk('What are my total sales figures?')">Sales figures</button>
      </div>

      <div class="ai-input-row">
        <input type="text" id="ai-input" placeholder="Ask anything about your inventory…" onkeydown="if(event.key==='Enter') aiSend()" />
        <button class="btn btn-primary" onclick="aiSend()">Send</button>
      </div>
    </div>
  `;
}

function aiAsk(msg) {
  const input = document.getElementById('ai-input');
  if (input) input.value = msg;
  aiSend();
}

function buildSystemPrompt() {
  const { products, employees, sales } = BS.data;
  const stats = BS.getStats();

  const empStats = employees.map(emp => {
    const empSales = BS.getEmployeeSales(emp.id);
    const rev = empSales.reduce((s,x) => s+x.revenue, 0);
    const profit = empSales.reduce((s,x) => s+x.profit, 0);
    return `${emp.name} (${emp.role}): ${empSales.length} sales, $${Math.round(rev).toLocaleString()} revenue, $${Math.round(profit).toLocaleString()} profit`;
  }).join('\n');

  return `You are BuildStock AI, a helpful assistant for a construction equipment shop in Canada.

LIVE INVENTORY DATA:
Total Revenue: $${Math.round(stats.totalRevenue).toLocaleString()}
Total Profit: $${Math.round(stats.totalProfit).toLocaleString()}
Inventory Value: $${Math.round(stats.inventoryValue).toLocaleString()}
Low Stock Items: ${stats.lowStock}

PRODUCTS (${products.length}):
${products.map(p => `- ${p.name} | Category: ${p.category} | Cost: $${p.cost.toLocaleString()} | Price: $${p.price.toLocaleString()} | Margin: ${Math.round((p.price-p.cost)/p.price*100)}% | Stock: ${p.qty} units`).join('\n')}

EMPLOYEES (${employees.length}):
${empStats}

RECENT SALES (last 10):
${sales.slice(0,10).map(s => {
  const p = BS.getProduct(s.productId);
  const e = BS.getEmployee(s.employeeId);
  return `- ${new Date(s.date).toLocaleDateString()} | ${p?.name||s.productName} | Qty:${s.qty} | Revenue:$${Math.round(s.revenue).toLocaleString()} | Profit:$${Math.round(s.profit).toLocaleString()} | By: ${e?.name||'Unknown'}`;
}).join('\n')}

Be concise, helpful, and numbers-focused. Use Canadian dollar formatting. Highlight actionable insights.`;
}

async function aiSend() {
  const input = document.getElementById('ai-input');
  const msgContainer = document.getElementById('ai-messages');
  if (!input || !msgContainer) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  // Add user msg
  aiMessages.push({ role: 'user', content: text });
  msgContainer.innerHTML += `
    <div class="ai-msg user">
      <div class="ai-avatar">You</div>
      <div class="ai-bubble">${text}</div>
    </div>
  `;

  // Thinking indicator
  const thinkId = 'think_' + Date.now();
  msgContainer.innerHTML += `
    <div class="ai-msg" id="${thinkId}">
      <div class="ai-avatar">AI</div>
      <div class="ai-bubble"><div class="ai-thinking"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div></div>
    </div>
  `;
  msgContainer.scrollTop = msgContainer.scrollHeight;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildSystemPrompt(),
        messages: aiMessages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not get a response.';

    aiMessages.push({ role: 'assistant', content: reply });

    const thinkEl = document.getElementById(thinkId);
    if (thinkEl) {
      thinkEl.querySelector('.ai-bubble').innerHTML = reply.replace(/\n/g, '<br>');
    }
  } catch(e) {
    const thinkEl = document.getElementById(thinkId);
    if (thinkEl) {
      thinkEl.querySelector('.ai-bubble').textContent = 'Error connecting to AI. Check your internet connection.';
    }
  }

  msgContainer.scrollTop = msgContainer.scrollHeight;
}

// ===== ATTACH HANDLERS =====
function attachHandlers(page) {
  if (page === 'record-sale') {
    setTimeout(updateSalePreview, 50);
  }
}

// ===== INIT =====
navigate('dashboard');
