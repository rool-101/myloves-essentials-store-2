// ============================================
// MYLOVE'S ESSENTIALS
// ADMIN DASHBOARD
// ============================================

const SUPABASE_URL =
  "https://akuiyfasztszalelihvi.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_LNCF4fhHCcJUNW1y_vuoIg_eBBLkkPv";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ============================================
// ELEMENTS
// ============================================

const loginPage =
  document.getElementById("loginPage");

const dashboard =
  document.getElementById("dashboard");

const loginForm =
  document.getElementById("loginForm");

const loginError =
  document.getElementById("loginError");

const logoutBtn =
  document.getElementById("logoutBtn");

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
// IMAGE UPLOAD FIELD
// ============================================

function setupImageUpload() {

  const oldInput =
    document.getElementById("productImage");

  if (!oldInput) {

    console.warn(
      "productImage field was not found."
    );

    return;
  }


  // If it is already a file input,
  // don't replace it.

  if (
    oldInput.type === "file"
  ) {

    return;
  }


  const newInput =
    document.createElement("input");

  newInput.type = "file";

  newInput.id =
    "productImage";

  newInput.name =
    "productImage";

  newInput.accept =
    "image/jpeg,image/png,image/webp,image/gif";

  newInput.className =
    oldInput.className;

  newInput.style.width =
    "100%";


  oldInput.parentNode.replaceChild(
    newInput,
    oldInput
  );


  const help =
    document.createElement("small");

  help.id =
    "imageUploadHelp";

  help.textContent =
    "Choose a JPG, PNG, WEBP or GIF image from your phone.";

  help.style.display =
    "block";

  help.style.marginTop =
    "6px";

  help.style.opacity =
    "0.7";


  newInput.parentNode.appendChild(
    help
  );


  newInput.addEventListener(
    "change",
    () => {

      const file =
        newInput.files[0];

      if (!file) return;


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "Please choose an image smaller than 5 MB."
        );

        newInput.value =
          "";

        return;
      }


      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        alert(
          "Please choose a JPG, PNG, WEBP or GIF image."
        );

        newInput.value =
          "";

      }

    }
  );

}


// ============================================
// LOGIN
// ============================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    loginError.textContent =
      "";

    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;


    const {
      error
    } =
      await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

      });


    if (error) {

      loginError.textContent =
        "Login failed: " +
        error.message;

      console.error(error);

      return;
    }


    await checkAdmin();

  }
);


// ============================================
// CHECK ADMIN
// ============================================

async function checkAdmin() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {

    showLogin();

    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq(
        "user_id",
        user.id
      )
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

  loginPage.style.display =
    "flex";

  dashboard.classList.remove(
    "active"
  );

}


// ============================================
// SHOW DASHBOARD
// ============================================

function showDashboard() {

  loginPage.style.display =
    "none";

  dashboard.classList.add(
    "active"
  );

}


// ============================================
// LOGOUT
// ============================================

logoutBtn.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    showLogin();

  }
);


// ============================================
// LOAD DASHBOARD
// ============================================

async function loadDashboard() {

  setupImageUpload();

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
  } =
    await supabaseClient
      .from("products")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    productsList.innerHTML =
      "Unable to load products.";

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    productsList.innerHTML = `
      <p>
        No products yet.
        Click "+ Add Product" to create your first product.
      </p>
    `;

    return;
  }


  productsList.innerHTML =
    "";


  data.forEach(
    product => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "product-row";


      let imageHTML =
        "🛍️";


      if (
        product.image_url
      ) {

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
            R${Number(product.price || 0).toFixed(2)}
            · Stock: ${product.stock || 0}
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


      productsList.appendChild(
        row
      );

    }
  );

}


// ============================================
// ADD PRODUCT
// ============================================

addProductBtn.addEventListener(
  "click",
  () => {

    resetProductForm();

    productForm.classList.add(
      "active"
    );

    setupImageUpload();

    window.scrollTo({

      top:
        productForm.offsetTop - 100,

      behavior:
        "smooth"

    });

  }
);


// ============================================
// CANCEL PRODUCT
// ============================================

cancelProduct.addEventListener(
  "click",
  () => {

    productForm.classList.remove(
      "active"
    );

    resetProductForm();

  }
);


// ============================================
// UPLOAD IMAGE
// ============================================

async function uploadProductImage(
  file
) {

  if (!file) {

    return null;

  }


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {

    throw new Error(
      "You are not logged in."
    );

  }


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const safeExtension =
    extension === "jpeg"
      ? "jpg"
      : extension;


  const fileName =
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    "." +
    safeExtension;


  const filePath =
    user.id +
    "/" +
    fileName;


  const {
    error
  } =
    await supabaseClient.storage
      .from("product-images")
      .upload(
        filePath,
        file,
        {
          cacheControl:
            "3600",

          upsert:
            false,

          contentType:
            file.type
        }
      );


  if (error) {

    throw error;

  }


  const {
    data
  } =
    supabaseClient.storage
      .from("product-images")
      .getPublicUrl(
        filePath
      );


  return data.publicUrl;

}


// ============================================
// SAVE PRODUCT
// ============================================

productForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const submitButton =
      productForm.querySelector(
        'button[type="submit"]'
      );


    if (submitButton) {

      submitButton.disabled =
        true;

      submitButton.textContent =
        "Saving...";

    }


    try {

      const productId =
        document
          .getElementById("productId")
          .value;


      const imageInput =
        document
          .getElementById("productImage");


      const selectedFile =
        imageInput &&
        imageInput.files
          ? imageInput.files[0]
          : null;


      let imageURL =
        null;


      // EDITING
      //
      // If no new picture is selected,
      // keep the old picture.

      if (productId) {

        const {
          data: existingProduct,
          error
        } =
          await supabaseClient
            .from("products")
            .select("image_url")
            .eq(
              "id",
              productId
            )
            .single();


        if (error) {

          throw error;

        }


        imageURL =
          existingProduct.image_url ||
          null;

      }


      // NEW PICTURE

      if (selectedFile) {

        imageURL =
          await uploadProductImage(
            selectedFile
          );

      }


      const product = {

        name:
          document
            .getElementById(
              "productName"
            )
            .value
            .trim(),

        category:
          document
            .getElementById(
              "productCategory"
            )
            .value,

        price:
          Number(
            document
              .getElementById(
                "productPrice"
              )
              .value
          ),

        stock:
          Number(
            document
              .getElementById(
                "productStock"
              )
              .value
          ),

        image_url:
          imageURL,

        description:
          document
            .getElementById(
              "productDescription"
            )
            .value
            .trim() ||
          null,

        updated_at:
          new Date().toISOString()

      };


      if (!product.name) {

        throw new Error(
          "Please enter a product name."
        );

      }


      let result;


      if (productId) {

        result =
          await supabaseClient
            .from("products")
            .update(product)
            .eq(
              "id",
              productId
            );

      } else {

        result =
          await supabaseClient
            .from("products")
            .insert(
              product
            );

      }


      if (result.error) {

        throw result.error;

      }


      alert(
        productId
          ? "Product updated successfully."
          : "Product added successfully."
      );


      productForm.classList.remove(
        "active"
      );


      resetProductForm();


      await loadProducts();

      await loadStats();

    } catch (error) {

      console.error(
        "Product save error:",
        error
      );


      alert(
        "Could not save the product:\n\n" +
        error.message
      );

    } finally {

      if (submitButton) {

        submitButton.disabled =
          false;

        submitButton.textContent =
          "Save Product";

      }

    }

  }
);


// ============================================
// EDIT PRODUCT
// ============================================

window.editProduct =
  async function(productId) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("products")
        .select("*")
        .eq(
          "id",
          productId
        )
        .single();


    if (error) {

      console.error(error);

      alert(
        "Unable to load product."
      );

      return;
    }


    document
      .getElementById(
        "productId"
      )
      .value =
      data.id;


    document
      .getElementById(
        "productName"
      )
      .value =
      data.name || "";


    document
      .getElementById(
        "productCategory"
      )
      .value =
      data.category || "Hair";


    document
      .getElementById(
        "productPrice"
      )
      .value =
      data.price || 0;


    document
      .getElementById(
        "productStock"
      )
      .value =
      data.stock || 0;


    setupImageUpload();


    const imageInput =
      document
        .getElementById(
          "productImage"
        );


    if (imageInput) {

      imageInput.value =
        "";

    }


    // Show current picture

    let preview =
      document.getElementById(
        "productImagePreview"
      );


    if (!preview) {

      preview =
        document.createElement(
          "img"
        );

      preview.id =
        "productImagePreview";

      preview.style.display =
        "none";

      preview.style.maxWidth =
        "180px";

      preview.style.maxHeight =
        "180px";

      preview.style.objectFit =
        "cover";

      preview.style.borderRadius =
        "12px";

      preview.style.marginTop =
        "10px";


      imageInput.parentNode.appendChild(
        preview
      );

    }


    if (data.image_url) {

      preview.src =
        data.image_url;

      preview.style.display =
        "block";

    } else {

      preview.style.display =
        "none";

    }


    document
      .getElementById(
        "productDescription"
      )
      .value =
      data.description || "";


    productForm.classList.add(
      "active"
    );


    window.scrollTo({

      top:
        productForm.offsetTop - 100,

      behavior:
        "smooth"

    });

  };


// ============================================
// DELETE PRODUCT
// ============================================

window.deleteProduct =
  async function(productId) {

    const confirmed =
      confirm(
        "Are you sure you want to delete this product?"
      );


    if (!confirmed) {

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from("products")
        .delete()
        .eq(
          "id",
          productId
        );


    if (error) {

      console.error(error);

      alert(
        "Could not delete the product: " +
        error.message
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


  document
    .getElementById(
      "productId"
    )
    .value =
    "";


  document
    .getElementById(
      "productStock"
    )
    .value =
    0;


  const preview =
    document.getElementById(
      "productImagePreview"
    );


  if (preview) {

    preview.remove();

  }


  setupImageUpload();

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
  } =
    await supabaseClient
      .from("orders")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    ordersList.innerHTML =
      "Unable to load orders.";

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    ordersList.innerHTML =
      "<p>No orders yet.</p>";

    return;

  }


  ordersList.innerHTML =
    "";


  data.forEach(
    order => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "order-row";


      row.innerHTML = `

        <strong>
          Order #${escapeHTML(
            String(order.id)
              .slice(0, 8)
          )}
        </strong>

        <p>
          Customer:
          ${escapeHTML(
            order.customer_name
          )}
        </p>

        <p>
          Phone:
          ${escapeHTML(
            order.phone
          )}
        </p>

        <p>
          Total:
          R${Number(
            order.total || 0
          ).toFixed(2)}
        </p>

        <p>
          Status:
          ${escapeHTML(
            order.status
          )}
        </p>

      `;


      ordersList.appendChild(
        row
      );

    }
  );

}


// ============================================
// LOAD STATS
// ============================================

async function loadStats() {

  const {
    data: products
  } =
    await supabaseClient
      .from("products")
      .select("id");


  const {
    data: orders
  } =
    await supabaseClient
      .from("orders")
      .select("total");


  document
    .getElementById(
      "productCount"
    )
    .textContent =
    products
      ? products.length
      : 0;


  document
    .getElementById(
      "orderCount"
    )
    .textContent =
    orders
      ? orders.length
      : 0;


  const revenue =
    orders
      ? orders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        )
      : 0;


  document
    .getElementById(
      "revenue"
    )
    .textContent =
    "R" +
    revenue.toFixed(2);

}


// ============================================
// HTML ESCAPE
// ============================================

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ============================================
// START
// ============================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupImageUpload();

  }
);


checkAdmin();
