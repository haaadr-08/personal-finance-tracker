const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expensesDisplay = document.getElementById("expenses");
const totalTransactionsDisplay = document.getElementById("total-transactions");
const incomeCountDisplay = document.getElementById("income-count");
const expenseCountDisplay = document.getElementById("expense-count");
const searchInput = document.getElementById("search");
const filterInput = document.getElementById("filter");
const sortInput = document.getElementById("sort");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const categories = {
  income: ["Salary", "Freelance", "Business", "Investment", "Bonus", "Gift", "Refund", "Other"],
  expense: ["Rent","Food", "Transport", "Bills", "Shopping", "Entertainment", "Education", "Healthcare", "Travel", "Other"],
};

typeInput.addEventListener("change", function () {
  const selectedType = typeInput.value;

  categoryInput.innerHTML = `<option value="">Select category</option>`;

  if (categories[selectedType]) {
    categories[selectedType].forEach(function (category) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryInput.appendChild(option);
    });
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const transaction = {
    id: Date.now(),
    title: titleInput.value,
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value,
  };

  transactions.push(transaction);
  saveTransactions();
  displayTransactions();
  updateSummary();

  form.reset();
});

function formatDate(dateString) {
    const parts = dateString.split("-");

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return `${month}/${day}/${year}`;
}

function displayTransactions() {
  transactionList.innerHTML = "";
  let visibleTransactions = 0;

  transactions
    .filter(function (transaction) {
      return transaction.title
        .toLowerCase()
        .includes(searchInput.value.toLowerCase());
    })
    .filter(function (transaction) {
      if (filterInput.value === "all") {
        return true;
      }

      return transaction.type === filterInput.value;
    })
    .sort(function (a, b) {

        if (sortInput.value === "newest-added") {
            return b.id - a.id;
        }

        if (sortInput.value === "oldest-added") {
            return a.id - b.id;
        }

        if (sortInput.value === "highest") {
            return b.amount - a.amount;
        }

        if (sortInput.value === "lowest") {
            return a.amount - b.amount;
        }

        if (sortInput.value === "date-newest") {
            return new Date(b.date) - new Date(a.date);
        }

        if (sortInput.value === "date-oldest") {
            return new Date(a.date) - new Date(b.date);
        }

        return 0;
    })
    .forEach(function (transaction) {
      visibleTransactions++;
      const li = document.createElement("li");
      li.classList.add("transaction-item");

      li.innerHTML = `
        <div class="transaction-info">
          <strong>${transaction.title}</strong>
          <small>${transaction.category} • ${formatDate(transaction.date)}</small>
        </div>

        <div>
          <span class="${transaction.type}">
            ${transaction.type === "income" ? "+" : "-"}$${transaction.amount.toFixed(2)}
          </span>

          <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;

      transactionList.appendChild(li);
    });

    if (visibleTransactions === 0) {
      transactionList.innerHTML = `
        <li class="empty-state">
            No transactions found.
        </li>
      `;
    }
}

function updateSummary() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else if (transaction.type === "expense") {
      expenses += transaction.amount;
    }
  });

  const balance = income - expenses;

  incomeDisplay.textContent = `$${income.toFixed(2)}`;
  expensesDisplay.textContent = `$${expenses.toFixed(2)}`;
  balanceDisplay.textContent = `$${balance.toFixed(2)}`;

  const incomeCount = transactions.filter(function (transaction) {
    return transaction.type === "income";
  }).length;

  const expenseCount = transactions.filter(function (transaction) {
    return transaction.type === "expense";
  }).length;

  totalTransactionsDisplay.textContent = transactions.length;
  incomeCountDisplay.textContent = incomeCount;
  expenseCountDisplay.textContent = expenseCount;
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });

  saveTransactions();
  displayTransactions();
  updateSummary();
}

searchInput.addEventListener("input", function () {
  displayTransactions();
});

filterInput.addEventListener("change", function () {
  displayTransactions();
});

sortInput.addEventListener("change", function () {
    displayTransactions();
});

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

displayTransactions();
updateSummary();