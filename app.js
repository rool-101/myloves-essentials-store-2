// ============================================
// MYLOVE'S ESSENTIALS
// STORE APP
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

let cart =
  JSON.parse(
    localStorage.getItem("myloves_cart")
  ) || [];


function saveCart() {

  localStorage.setItem(
    "myloves_cart",
    JSON.stringify(cart)
  );

}


function updateCartCount() {

  const count =
    cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );

  if (cartCount) {

    cartCount.textContent =
      count;

  }

}


updateCartCount();


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

  if (!productGrid) return;


  productGrid.innerHTML = `

    <div class="loading-products">

      <div>
        💗
      </div>

      <p>
        Loading our essentials...
      </p>

    </div>

  `;


  const {
    data: products,
    error
  } = await supabaseClient

    .from("products")

    .select("*")

    .eq("active", true)

    .order("created_at", {
      ascending: false
    });


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
          Please refresh the page and try again.
        </p>

      </div>

    `;

    return;

  }


  if (!products || products.length === 0) {

    productGrid.innerHTML = `

      <div class="product-empty">

        <div>
          🛍️
        </div>

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


  displayProductsByCategory(
    products
  );

}


// ============================================
// CATEGORY ORDER
// ============================================

const categoryOrder = [

  "Hair",

  "Fashion",

  "Fragrance",

  "Wellness"

];


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
        product.category ||
        "Other";


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
      href="product.html?id=${encodeURIComponent(product.id)}"
      class="product-image"
      aria-label="View ${escapeHTML(product.name)}"
    >

      ${imageHTML}

    </a>


    <div class="product-card-info">

      <span class="product-category">

        ${escapeHTML(product.category || "Essentials")}

      </span>


      <h3>

        <a
          href="product.html?id=${encodeURIComponent(product.id)}"
        >

          ${escapeHTML(product.name)}

        </a>

      </h3>


      <div class="product-bottom">

        <strong>

          R${Number(product.price).toFixed(2)}

        </strong>


        ${
          Number(product.stock) > 0

            ? `

              <button
                class="quick-add"
                type="button"
                data-product-id="${product.id}"
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
      async event => {

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
// QUICK ADD TO CART
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


  if (existing) {

    existing.quantity =
      Math.min(
        existing.quantity +
          quantity,
        Number(product.stock)
      );

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(
        product.price
      ),

      image_url:
        product.image_url,

      quantity: quantity

    });

  }


  saveCart();

  updateCartCount();

  renderCart();


  openCart();


  showCartMessage();

}


// ============================================
// CART DISPLAY
// ============================================

function renderCart() {

  if (!cartItems) return;


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <div>
          🛍️
        </div>

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

      const itemTotal =
        Number(item.price) *
        Number(item.quantity);


      total += itemTotal;


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "cart-item";


      const imageHTML =
        item.image_url

          ? `

            <img
              src="${escapeHTML(item.image_url)}"
              alt="${escapeHTML(item.name)}"
            >

          `

          : `
            <div class="cart-placeholder">
              🛍️
            </div>
          `;


      element.innerHTML = `

        <div class="cart-item-image">

          ${imageHTML}

        </div>


        <div class="cart-item-info">

          <h4>
            ${escapeHTML(item.name)}
          </h4>

          <p>
            R${Number(item.price).toFixed(2)}
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
              ${item.quantity}
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
            class="remove-cart-item"
            type="button"
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


            if (action === "minus") {

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


            if (action === "plus") {

              cart[index].quantity++;

            }


            if (action === "remove") {

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
// CART OPEN
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
// CART CLOSE
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
// CART EVENTS
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
// CATEGORY BUTTONS
// ============================================

document
  .querySelectorAll(
    "[data-category]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          const category =
            button.dataset.category;


          if (!category) return;


          setTimeout(
            () => {

              const section =
                document.querySelector(
                  `.category-section[data-category="${CSS.escape(category)}"]`
                );


              if (section) {

                section.scrollIntoView({
                  behavior: "smooth"
                });

              }

            },
            100
          );

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
    "white";

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

  return String(value)

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
// CHECKOUT
// ============================================

const checkoutBtn =
  document.getElementById(
    "checkoutBtn"
  );


if (checkoutBtn) {

  checkoutBtn.addEventListener(
    "click",
    () => {

      if (cart.length === 0) {

        alert(
          "Your bag is empty."
        );

        return;

      }


      alert(
        "Checkout will be connected next."
      );

    }
  );

}


// ============================================
// START
// ============================================

loadProducts();

renderCart();
