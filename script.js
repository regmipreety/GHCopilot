const products = [
  { id: 1, name: "Galaxy S24", price: 799, icon: "📱", description: "Premium smartphone with vivid display." },
  { id: 2, name: "Noise Buds", price: 89, icon: "🎧", description: "Compact audio for work and travel." },
  { id: 3, name: "Laptop Stand", price: 49, icon: "💻", description: "Comfortable setup for remote work." },
  { id: 4, name: "Smart Watch", price: 159, icon: "⌚", description: "Track health and stay connected." }
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const cart = [];
let financeChart;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-icon">${product.icon}</div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-meta">
        <span class="price">${formatCurrency(product.price)}</span>
        <button class="btn add-to-cart" data-id="${product.id}">Add</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const total = document.getElementById("cart-total");
  if (!list || !total) return;

  if (cart.length === 0) {
    list.innerHTML = '<li class="cart-item">Your cart is empty.</li>';
    total.textContent = "$0.00 USD";
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  list.innerHTML = cart.map((item) => `
    <li class="cart-item">
      <strong>${item.name} × ${item.quantity}</strong>
      <span>${formatCurrency(item.price * item.quantity)}</span>
    </li>
  `).join("");
  total.textContent = `${formatCurrency(totalAmount)} USD`;
}

function addToCart(productId) {
  const product = products.find((entry) => entry.id === Number(productId));
  if (!product) return;

  const existing = cart.find((entry) => entry.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function buildMonthRows() {
  const container = document.getElementById("month-rows");
  if (!container) return;

  container.innerHTML = months.map((month) => `
    <div class="month-row">
      <label for="${month.toLowerCase()}-income">${month}</label>
      <input class="month-input" id="${month.toLowerCase()}-income" data-month="${month}" data-type="income" type="number" min="0" step="0.01" value="0" />
      <input class="month-input" id="${month.toLowerCase()}-expense" data-month="${month}" data-type="expense" type="number" min="0" step="0.01" value="0" />
    </div>
  `).join("");
}

function readMonthlyData() {
  return months.map((month) => {
    const incomeInput = document.querySelector(`[data-month="${month}"][data-type="income"]`);
    const expenseInput = document.querySelector(`[data-month="${month}"][data-type="expense"]`);

    return {
      month,
      income: Number(incomeInput?.value || 0),
      expense: Number(expenseInput?.value || 0)
    };
  });
}

function updateSummary() {
  const data = readMonthlyData();
  const totalIncome = data.reduce((sum, entry) => sum + entry.income, 0);
  const totalExpense = data.reduce((sum, entry) => sum + entry.expense, 0);

  document.getElementById("income-total").textContent = formatCurrency(totalIncome);
  document.getElementById("expense-total").textContent = formatCurrency(totalExpense);
}

function createChart() {
  const ctx = document.getElementById("financeChart");
  if (!ctx) return;

  const data = readMonthlyData();
  financeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((entry) => entry.month),
      datasets: [
        {
          label: "Income (USD)",
          data: data.map((entry) => entry.income),
          backgroundColor: "#2563eb",
          borderRadius: 6
        },
        {
          label: "Expense (USD)",
          data: data.map((entry) => entry.expense),
          backgroundColor: "#f59e0b",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value)
          }
        }
      }
    }
  });
}

function updateChart() {
  if (!financeChart) {
    createChart();
    return;
  }

  const data = readMonthlyData();
  financeChart.data.labels = data.map((entry) => entry.month);
  financeChart.data.datasets[0].data = data.map((entry) => entry.income);
  financeChart.data.datasets[1].data = data.map((entry) => entry.expense);
  financeChart.update();
}

function downloadChartAsPng() {
  const canvas = financeChart?.canvas || document.getElementById("financeChart");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = "income-vs-expense-chart.png";
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function switchTab(targetId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === targetId);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  if (targetId === "chart") {
    updateChart();
  }
}

function init() {
  renderProducts();
  buildMonthRows();
  renderCart();
  updateSummary();
  createChart();

  document.getElementById("product-grid")?.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart");
    if (!button) return;
    addToCart(button.dataset.id);
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.target));
  });

  document.querySelectorAll(".month-input").forEach((input) => {
    input.addEventListener("input", () => {
      updateSummary();
      updateChart();
    });
  });

  document.getElementById("download-chart-btn")?.addEventListener("click", downloadChartAsPng);
}

window.addEventListener("DOMContentLoaded", init);

