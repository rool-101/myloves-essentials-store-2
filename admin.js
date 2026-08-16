// ============================================
// MYLOVE'S ESSENTIALS
// ADMIN DASHBOARD
// ============================================

// IMPORTANT:
// Replace these two values with your Supabase
// Project URL and anon/public key.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ============================================
// ELEMENTS
// ============================================

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");

const addProductBtn =
  document.getElementById("addProductBtn");

const productForm =
  document.getElementById("productForm");

const cancelProduct =
  document.getElementById("cancelProduct");

const productsList =
  document.getElementById("productsList");

const ordersList =
  document.getElementById("ordersList");


// ============================================
// LOGIN
// ============================================

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  loginError.textContent = "";

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const { error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    loginError.textContent =
      "Login failed. Please check your email and password.";

    console.error(error);

    return;
  }

  await checkAdmin();

});


// ============================================
// CHECK ADMIN
// ============================================

async function checkAdmin() {

  const {
    data: {
      user
    }
  } = await supabaseClient.auth.getUser();

  if (!user) {

    showLogin();

    return;
  }


  const {
    data,
    error
  } = await supabaseClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();


  if (error) {

    console.error(error);

    await supabaseClient.auth.signOut();

    showLogin();

    loginError.textContent =
      "Unable to verify administrator access.";

    return;
  }


  if (!data) {

    await supabaseClient.auth.signOut();

    showLogin();

    loginError.textContent =
      "This account does not have administrator access.";

    return;
  }


  showDashboard();

  await loadDashboard();

}


// ============================================
// SHOW LOGIN
// ============================================

function showLogin() {

  loginPage.style.display = "flex";

  dashboard.classList.remove("active");

}


// ============================================
// SHOW DASHBOARD
// ============================================

function showDashboard() {

  loginPage.style.display = "none";

  dashboard.classList.add("active");

}


// ============================================
// LOGOUT
// ============================================

logoutBtn.addEventListener("click", async () => {

  await supabaseClient.auth.signOut();

  showLogin();

});


// ============================================
// LOAD DASHBOARD
// ============================================

async function loadDashboard() {

  await loadProducts();

  await loadOrders();

  await loadStats();

}


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

  productsList.innerHTML =
    "Loading products...";


  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    productsList.innerHTML =
      "Unable to load products.";

    return;
  }


  if (!data || data.length === 0) {

    productsList.innerHTML = `
      <p>
        No products yet.
        Click "+ Add Product" to create your first product.
      </p>
    `;

    return;
  }


  productsList.innerHTML = "";


  data.forEach(product => {

    const row =
      document.createElement("div");

    row.className =
      "product-row";


    let imageHTML = "🛍️";


    if (product.image_url) {

      imageHTML = `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name)}"
        >
      `;

    }


    row.innerHTML = `

      <div class="product-thumb">
        ${imageHTML}
      </div>

      <div class="product-info">

        <h4>
          ${escapeHTML(product.name)}
        </h4>

        <p>
          R${Number(product.price).toFixed(2)}
          · Stock: ${product.stock}
        </p>

      </div>

      <div class="product-actions">

        <button
          class="edit-btn"
          onclick="editProduct('${product.id}')"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteProduct('${product.id}')"
        >
          Delete
        </button>

      </div>

    `;


    productsList.appendChild(row);

  });

}


// ============================================
// ADD PRODUCT BUTTON
// ============================================

addProductBtn.addEventListener("click", () => {

  resetProductForm();

  productForm.classList.add("active");

  window.scrollTo({
    top: productForm.offsetTop - 100,
    behavior: "smooth"
  });

});


// ============================================
// CANCEL PRODUCT
// ============================================

cancelProduct.addEventListener("click", () => {

  productForm.classList.remove("active");

  resetProductForm();

});


// ============================================
// SAVE PRODUCT
// ============================================

productForm.addEventListener("submit", async (event) => {

  event.preventDefault();


  const productId =
    document.getElementById("productId").value;


  const product = {

    name:
      document.getElementById("productName")
        .value
        .trim(),

    category:
      document.getElementById("productCategory")
        .value,

    price:
      Number(
        document.getElementById("productPrice")
          .value
      ),

    stock:
      Number(
        document.getElementById("productStock")
          .value
      ),

    image_url:
      document.getElementById("productImage")
        .value
        .trim() || null,

    description:
      document.getElementById("productDescription")
        .value
        .trim() || null,

    updated_at:
      new Date().toISOString()

  };


  let result;


  if (productId) {

    // EDIT EXISTING PRODUCT

    result =
      await supabaseClient
        .from("products")
        .update(product)
        .eq("id", productId);

  } else {

    // CREATE NEW PRODUCT

    result =
      await supabaseClient
        .from("products")
        .insert(product);

  }


  if (result.error) {

    console.error(result.error);

    alert(
      "Could not save the product."
    );

    return;
  }


  alert(
    productId
      ? "Product updated successfully."
      : "Product added successfully."
  );


  productForm.classList.remove("active");

  resetProductForm();

  await loadProducts();

  await loadStats();

});


// ============================================
// EDIT PRODUCT
// ============================================

window.editProduct = async function(productId) {

  const {
    data,
    error
  } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();


  if (error) {

    console.error(error);

    alert(
      "Unable to load product."
    );

    return;
  }


  document.getElementById("productId").value =
    data.id;

  document.getElementById("productName").value =
    data.name || "";

  document.getElementById("productCategory").value =
    data.category || "Hair";

  document.getElementById("productPrice").value =
    data.price || 0;

  document.getElementById("productStock").value =
    data.stock || 0;

  document.getElementById("productImage").value =
    data.image_url || "";

  document.getElementById("productDescription").value =
    data.description || "";


  productForm.classList.add("active");


  window.scrollTo({
    top: productForm.offsetTop - 100,
    behavior: "smooth"
  });

};


// ============================================
// DELETE PRODUCT
// ============================================

window.deleteProduct = async function(productId) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this product?"
    );


  if (!confirmed) {

    return;
  }


  const {
    error
  } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", productId);


  if (error) {

    console.error(error);

    alert(
      "Could not delete the product."
    );

    return;
  }


  alert(
    "Product deleted."
  );


  await loadProducts();

  await loadStats();

};


// ============================================
// RESET FORM
// ============================================

function resetProductForm() {

  productForm.reset();

  document.getElementById("productId").value = "";

  document.getElementById("productStock").value = 0;

}


// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {

  ordersList.innerHTML =
    "Loading orders...";


  const {
    data,
    error
  } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    ordersList.innerHTML =
      "Unable to load orders.";

    return;
  }


  if (!data || data.length === 0) {

    ordersList.innerHTML =
      "<p>No orders yet.</p>";

    return;
  }


  ordersList.innerHTML = "";


  data.forEach(order => {

    const row =
      document.createElement("div");

    row.className =
      "order-row";


    row.innerHTML = `

      <strong>
        Order #${escapeHTML(order.id.slice(0, 8))}
      </strong>

      <p>
        Customer:
        ${escapeHTML(order.customer_name)}
      </p>

      <p>
        Phone:
        ${escapeHTML(order.phone)}
      </p>

      <p>
        Total:
        R${Number(order.total).toFixed(2)}
      </p>

      <p>
        Status:
        ${escapeHTML(order.status)}
      </p>

    `;


    ordersList.appendChild(row);

  });

}


// ============================================
// LOAD STATS
// ============================================

async function loadStats() {

  const {
    data: products
  } = await supabaseClient
    .from("products")
    .select("id");


  const {
    data: orders
  } = await supabaseClient
    .from("orders")
    .select("total");


  document.getElementById("productCount")
    .textContent =
    products
      ? products.length
      : 0;


  document.getElementById("orderCount")
    .textContent =
    orders
      ? orders.length
      : 0;


  const revenue =
    orders
      ? orders.reduce(
          (sum, order) =>
            sum + Number(order.total || 0),
          0
        )
      : 0;


  document.getElementById("revenue")
    .textContent =
    "R" + revenue.toFixed(2);

}


// ============================================
// HTML ESCAPE
// ============================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================
// CHECK LOGIN ON PAGE LOAD
// ============================================

checkAdmin();
