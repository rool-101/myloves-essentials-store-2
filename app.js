// ============================================
// MYLOVE'S ESSENTIALS - STORE APP
// ============================================

const SUPABASE_URL =
  "https://akuiyfasztszalelihvi.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWl5ZmFzenRzemFsZWxpaHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NzU2MTIsImV4cCI6MjA5OTU1MTYxMn0.9J_cl8Wm1RxhRUwt1RnjVKfnM6BwoceqzD2UsobS_ag";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ============================================
// ELEMENTS
// ============================================

const productGrid =
  document.getElementById("productGrid");

const cartBtn =
  document.getElementById("cartBtn");

const cartPanel =
  document.getElementById("cartPanel");

const closeCart =
  document.getElementById("closeCart");

const overlay =
  document.getElementById("overlay");

const cartItems =
  document.getElementById("cartItems");

const cartTotal =
  document.getElementById("cartTotal");

const cartCount =
  document.getElementById("cartCount");


// ============================================
// CART
// ============================================

let cart = [];

try {
  cart =
    JSON.parse(
      localStorage.getItem("myloves_cart")
    ) || [];
} catch (error) {
  cart = [];
}


// ============================================
// CATEGORY ORDER
// ============================================

const categoryOrder = [
  "Hair",
  "Fragrance",
  "Wellness"
];


// ============================================
// CATEGORIES WE NO LONGER USE
// ============================================

function isRemovedCategory(category) {

  if (!category) return false;

  const value =
    String(category)
      .trim()
      .toLowerCase();

  return (
    value === "handbags" ||
    value === "handbag" ||
    value === "fashion" ||
    value === "bags" ||
    value === "bag"
  );
}


// ============================================
// REMOVE HANDBAGS FROM NAVIGATION
// ============================================

function removeHandbagsNavigation() {

  document
    .querySelectorAll(
      "a, button"
    )
    .forEach(element => {

      const text =
        element.textContent
          .trim()
          .toLowerCase();

      if (
        text === "handbags" ||
        text === "handbag" ||
        text === "fashion"
      ) {

        element.remove();

      }

    });

}


// ============================================
// SAVE CART
// ============================================

function saveCart() {

  localStorage.setItem(
    "myloves_cart",
    JSON.stringify(cart)
  );

}


// ============================================
// UPDATE CART COUNT
// ============================================

function updateCartCount() {

  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  if (cartCount) {

    cartCount.textContent =
      count;

  }

}


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

  if (!productGrid) return;


  productGrid.innerHTML = `

    <div class="loading-products">

      <div>💗</div>

      <p>
        Loading our essentials...
      </p>

    </div>

  `;


  const {
    data: products,
    error
  } =
    await supabaseClient

      .from("products")

      .select("*")

      // IMPORTANT:
      // We do NOT use active=true
      // because your table doesn't have
      // an active column.

      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Product loading error:",
      error
    );


    productGrid.innerHTML = `

      <div class="product-error">

        <h3>
          Products couldn't load
        </h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>

    `;

    return;

  }


  if (
    !products ||
    products.length === 0
  ) {

    productGrid.innerHTML = `

      <div class="product-empty">

        <div>🛍️</div>

        <h3>
          Our collection is coming soon.
        </h3>

        <p>
          Check back shortly for our latest essentials.
        </p>

      </div>

    `;

    return;

  }


  // ============================================
  // REMOVE HANDBAGS FROM CUSTOMER STORE
  // ============================================

  const visibleProducts =
    products.filter(
      product =>
        !isRemovedCategory(
          product.category
        )
    );


  displayProductsByCategory(
    visibleProducts
  );

}


// ============================================
// DISPLAY PRODUCTS BY CATEGORY
// ============================================

function displayProductsByCategory(
  products
) {

  productGrid.innerHTML = "";


  const grouped = {};


  products.forEach(
    product => {

      const category =
        normalizeCategory(
          product.category
        );


      if (
        isRemovedCategory(
          category
        )
      ) {

        return;

      }


      if (!grouped[category]) {

        grouped[category] = [];

      }


      grouped[category].push(
        product
      );

    }
  );


  const categories = [

    ...categoryOrder.filter(
      category =>
        grouped[category]
    ),

    ...Object.keys(grouped).filter(
      category =>
        !categoryOrder.includes(
          category
        ) &&
        !isRemovedCategory(
          category
        )
    )

  ];


  categories.forEach(
    category => {

      const section =
        document.createElement(
          "section"
        );


      section.className =
        "category-section";


      section.dataset.category =
        category;


      section.innerHTML = `

        <div class="category-heading">

          <div>

            <p class="eyebrow">
              SHOP
            </p>

            <h2>
              ${escapeHTML(category)}
            </h2>

          </div>

        </div>


        <div class="category-products">
        </div>

      `;


      const categoryProducts =
        section.querySelector(
          ".category-products"
        );


      grouped[category].forEach(
        product => {

          categoryProducts.appendChild(
            createProductCard(
              product
            )
          );

        }
      );


      productGrid.appendChild(
        section
      );

    }
  );

}


// ============================================
// NORMALIZE CATEGORY
// ============================================

function normalizeCategory(
  category
) {

  if (!category) {

    return "Other";

  }


  const value =
    String(category).trim();


  const lower =
    value.toLowerCase();


  // HAIR
  if (
    lower === "hair" ||
    lower === "human blend" ||
    lower === "human blend weave" ||
    lower === "weave" ||
    lower === "weaves"
  ) {

    return "Hair";

  }


  // FRAGRANCE
  if (
    lower === "fragrance" ||
    lower === "perfume" ||
    lower === "perfumes"
  ) {

    return "Fragrance";

  }


  // WELLNESS
  if (
    lower === "wellness"
  ) {

    return "Wellness";

  }


  return value;

}


// ============================================
// PRODUCT CARD
// ============================================

function createProductCard(
  product
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "product-card";


  const productLink =
    "product.html?id=" +
    encodeURIComponent(
      product.id
    );


  const imageHTML =
    product.image_url

      ? `

        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >

      `

      : `

        <div class="product-placeholder">
          🛍️
        </div>

      `;


  card.innerHTML = `

    <a
      href="${productLink}"
      class="product-image"
      aria-label="View ${escapeHTML(product.name)}"
    >

      ${imageHTML}

    </a>


    <div class="product-card-info">

      <span class="product-category">

        ${escapeHTML(
          normalizeCategory(
            product.category
          )
        )}

      </span>


      <h3>

        <a
          href="${productLink}"
        >

          ${escapeHTML(
            product.name
          )}

        </a>

      </h3>


      <div class="product-bottom">

        <strong>

          R${Number(
            product.price || 0
          ).toFixed(2)}

        </strong>


        ${
          Number(product.stock) > 0

            ? `

              <button
                class="quick-add"
                type="button"
              >
                +
              </button>

            `

            : `

              <span class="sold-out">
                Sold out
              </span>

            `
        }

      </div>

    </div>

  `;


  const quickAdd =
    card.querySelector(
      ".quick-add"
    );


  if (quickAdd) {

    quickAdd.addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();

        addProductToCart(
          product,
          1
        );

      }
    );

  }


  return card;

}


// ============================================
// ADD TO CART
// ============================================

function addProductToCart(
  product,
  quantity
) {

  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(product.id)
    );


  const stock =
    Number(product.stock);


  if (existing) {

    if (
      stock > 0 &&
      existing.quantity + quantity >
        stock
    ) {

      existing.quantity =
        stock;

    } else {

      existing.quantity +=
        quantity;

    }

  } else {

    cart.push({

      id:
        product.id,

      name:
        product.name,

      price:
        Number(
          product.price || 0
        ),

      image_url:
        product.image_url || "",

      quantity:
        quantity

    });

  }


  saveCart();

  updateCartCount();

  renderCart();

  openCart();

  showCartMessage();

}


// ============================================
// RENDER CART
// ============================================

function renderCart() {

  if (!cartItems) return;


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <div>🛍️</div>

        <h3>
          Your bag is empty
        </h3>

        <p>
          Add something beautiful to your bag.
        </p>

      </div>

    `;


    if (cartTotal) {

      cartTotal.textContent =
        "R0.00";

    }

    return;

  }


  cartItems.innerHTML = "";


  let total = 0;


  cart.forEach(
    (item, index) => {

      const price =
        Number(
          item.price || 0
        );

      const quantity =
        Number(
          item.quantity || 0
        );

      const itemTotal =
        price * quantity;


      total +=
        itemTotal;


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "cart-item";


      element.innerHTML = `

        <div class="cart-item-info">

          <h4>
            ${escapeHTML(item.name)}
          </h4>

          <p>
            R${price.toFixed(2)}
          </p>


          <div class="cart-quantity">

            <button
              type="button"
              data-action="minus"
              data-index="${index}"
            >
              −
            </button>


            <span>
              ${quantity}
            </span>


            <button
              type="button"
              data-action="plus"
              data-index="${index}"
            >
              +
            </button>

          </div>


          <button
            type="button"
            class="remove-cart-item"
            data-action="remove"
            data-index="${index}"
          >
            Remove
          </button>

        </div>


        <strong>
          R${itemTotal.toFixed(2)}
        </strong>

      `;


      cartItems.appendChild(
        element
      );

    }
  );


  if (cartTotal) {

    cartTotal.textContent =
      "R" +
      total.toFixed(2);

  }


  cartItems
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );

            const action =
              button.dataset.action;


            if (
              !cart[index]
            ) {

              return;

            }


            if (
              action === "minus"
            ) {

              cart[index].quantity--;


              if (
                cart[index].quantity <= 0
              ) {

                cart.splice(
                  index,
                  1
                );

              }

            }


            if (
              action === "plus"
            ) {

              cart[index].quantity++;

            }


            if (
              action === "remove"
            ) {

              cart.splice(
                index,
                1
              );

            }


            saveCart();

            updateCartCount();

            renderCart();

          }
        );

      }
    );

}


// ============================================
// OPEN CART
// ============================================

function openCart() {

  if (!cartPanel) return;


  cartPanel.classList.add(
    "open"
  );


  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }


  cartPanel.setAttribute(
    "aria-hidden",
    "false"
  );


  renderCart();

}


// ============================================
// CLOSE CART
// ============================================

function closeCartPanel() {

  if (!cartPanel) return;


  cartPanel.classList.remove(
    "open"
  );


  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }


  cartPanel.setAttribute(
    "aria-hidden",
    "true"
  );

}


// ============================================
// CART BUTTONS
// ============================================

if (cartBtn) {

  cartBtn.addEventListener(
    "click",
    openCart
  );

}


if (closeCart) {

  closeCart.addEventListener(
    "click",
    closeCartPanel
  );

}


if (overlay) {

  overlay.addEventListener(
    "click",
    closeCartPanel
  );

}


// ============================================
// CATEGORY NAVIGATION
// ============================================

document
  .querySelectorAll(
    ".category-nav [data-category]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const category =
            normalizeCategory(
              button.dataset.category
            );


          const section =
            Array.from(
              document.querySelectorAll(
                ".category-section"
              )
            ).find(
              element =>
                element.dataset.category
                  .toLowerCase() ===
                category.toLowerCase()
            );


          if (section) {

            section.scrollIntoView({
              behavior:
                "smooth",
              block:
                "start"
            });

          }

        }
      );

    }
  );


// ============================================
// CART MESSAGE
// ============================================

function showCartMessage() {

  const message =
    document.createElement(
      "div"
    );


  message.textContent =
    "✓ Added to your bag";


  message.style.position =
    "fixed";

  message.style.bottom =
    "25px";

  message.style.right =
    "25px";

  message.style.zIndex =
    "9999";

  message.style.background =
    "#b96f8e";

  message.style.color =
    "#ffffff";

  message.style.padding =
    "13px 18px";

  message.style.borderRadius =
    "10px";

  message.style.boxShadow =
    "0 10px 30px rgba(0,0,0,.15)";


  document.body.appendChild(
    message
  );


  setTimeout(
    () => {

      message.remove();

    },
    2000
  );

}


// ============================================
// ESCAPE HTML
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

    // Remove Handbags from the menu
    removeHandbagsNavigation();

    // Cart
    updateCartCount();

    renderCart();

    // Products
    loadProducts();

  }
);
