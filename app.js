/* =====================================================
   MYLOVE'S ESSENTIALS
   SHOPPING CART + PRODUCTS
   ===================================================== */


/* =========================
   PRODUCTS
   ========================= */

const products = [
  {
    id: 1,
    name: "Human Blend Weave",
    category: "Hair",
    price: 350,
    emoji: "💇🏽‍♀️"
  },

  {
    id: 2,
    name: "Luxury Human Blend Weave",
    category: "Hair",
    price: 950,
    emoji: "👩🏽‍🦱"
  },

  {
    id: 3,
    name: "Ladies' Handbag",
    category: "Fashion",
    price: 200,
    emoji: "👜"
  },

  {
    id: 4,
    name: "Premium Handbag",
    category: "Fashion",
    price: 350,
    emoji: "👛"
  },

  {
    id: 5,
    name: "Arabic Perfume",
    category: "Fragrance",
    price: 150,
    emoji: "🌹"
  },

  {
    id: 6,
    name: "Luxury Arabic Perfume",
    category: "Fragrance",
    price: 200,
    emoji: "✨"
  },

  {
    id: 7,
    name: "Zhoek Glow Skin Powder",
    category: "Wellness",
    price: 200,
    emoji: "✨"
  },

  {
    id: 8,
    name: "Zhoek Weight Gain Powder",
    category: "Wellness",
    price: 100,
    emoji: "🌸"
  },

  {
    id: 9,
    name: "Zhoek Flat Tummy Tea",
    category: "Wellness",
    price: 100,
    emoji: "🍵"
  }
];


/* =========================
   CART
   ========================= */

let cart = JSON.parse(
  localStorage.getItem("mylovesCart")
) || [];


/* =========================
   ELEMENTS
   ========================= */

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

const cartCount =
  document.getElementById("cartCount");

const cartTotal =
  document.getElementById("cartTotal");

const checkoutBtn =
  document.getElementById("checkoutBtn");

const allProducts =
  document.getElementById("allProducts");


/* =========================
   FORMAT PRICE
   ========================= */

function formatPrice(price) {

  return new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0
    }
  ).format(price);

}


/* =========================
   DISPLAY PRODUCTS
   ========================= */

function displayProducts(
  category = "all"
) {

  productGrid.innerHTML = "";

  const filteredProducts =
    category === "all"
      ? products
      : products.filter(
          product =>
            product.category === category
        );


  if (filteredProducts.length === 0) {

    productGrid.innerHTML = `
      <p>
        No products found.
      </p>
    `;

    return;
  }


  filteredProducts.forEach(product => {

    const productCard =
      document.createElement("article");

    productCard.className =
      "product-card";


    productCard.innerHTML = `

      <div class="product-image">
        ${product.emoji}
      </div>

      <div class="product-info">

        <div class="product-category">
          ${product.category}
        </div>

        <h3 class="product-name">
          ${product.name}
        </h3>

        <div class="product-price">
          ${formatPrice(product.price)}
        </div>

        <button
          class="add-cart"
          data-id="${product.id}"
        >
          Add to bag
        </button>

      </div>

    `;


    productGrid.appendChild(
      productCard
    );

  });


  document
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          addToCart(id);

        }
      );

    });

}


/* =========================
   ADD TO CART
   ========================= */

function addToCart(productId) {

  const existingItem =
    cart.find(
      item =>
        item.id === productId
    );


  if (existingItem) {

    existingItem.quantity += 1;

  } else {

    const product =
      products.find(
        item =>
          item.id === productId
      );


    if (!product) return;


    cart.push({
      ...product,
      quantity: 1
    });

  }


  saveCart();

  updateCart();

  openCart();

}


/* =========================
   REMOVE FROM CART
   ========================= */

function removeFromCart(productId) {

  cart =
    cart.filter(
      item =>
        item.id !== productId
    );


  saveCart();

  updateCart();

}


/* =========================
   CHANGE QUANTITY
   ========================= */

function changeQuantity(
  productId,
  change
) {

  const item =
    cart.find(
      product =>
        product.id === productId
    );


  if (!item) return;


  item.quantity += change;


  if (item.quantity <= 0) {

    removeFromCart(productId);

    return;

  }


  saveCart();

  updateCart();

}


/* =========================
   SAVE CART
   ========================= */

function saveCart() {

  localStorage.setItem(
    "mylovesCart",
    JSON.stringify(cart)
  );

}


/* =========================
   UPDATE CART
   ========================= */

function updateCart() {

  cartItems.innerHTML = "";


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div class="cart-empty">

        <div style="font-size:45px;">
          🛍️
        </div>

        <h3>
          Your bag is empty
        </h3>

        <p>
          Add something beautiful
          to your bag.
        </p>

      </div>

    `;

  }


  let total = 0;

  let quantityTotal = 0;


  cart.forEach(item => {

    total +=
      item.price *
      item.quantity;

    quantityTotal +=
      item.quantity;


    const cartItem =
      document.createElement(
        "div"
      );

    cartItem.className =
      "cart-item";


    cartItem.innerHTML = `

      <div class="cart-item-image">
        ${item.emoji}
      </div>


      <div>

        <h4>
          ${item.name}
        </h4>

        <p>
          ${formatPrice(item.price)}
        </p>


        <div
          style="
            display:flex;
            align-items:center;
            gap:8px;
            margin-top:6px;
          "
        >

          <button
            class="quantity-btn"
            data-action="minus"
            data-id="${item.id}"
          >
            −
          </button>

          <strong>
            ${item.quantity}
          </strong>

          <button
            class="quantity-btn"
            data-action="plus"
            data-id="${item.id}"
          >
            +
          </button>

        </div>

      </div>


      <button
        class="remove-item"
        data-id="${item.id}"
        aria-label="Remove item"
      >
        ×
      </button>

    `;


    cartItems.appendChild(
      cartItem
    );

  });


  cartCount.textContent =
    quantityTotal;


  cartTotal.textContent =
    formatPrice(total);


  /* Quantity buttons */

  document
    .querySelectorAll(".quantity-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          const change =
            button.dataset.action ===
            "plus"
              ? 1
              : -1;


          changeQuantity(
            id,
            change
          );

        }
      );

    });


  /* Remove buttons */

  document
    .querySelectorAll(".remove-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          removeFromCart(id);

        }
      );

    });

}


/* =========================
   OPEN CART
   ========================= */

function openCart() {

  cartPanel.classList.add(
    "open"
  );

  overlay.classList.add(
    "active"
  );

  cartPanel.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =========================
   CLOSE CART
   ========================= */

function closeCartPanel() {

  cartPanel.classList.remove(
    "open"
  );

  overlay.classList.remove(
    "active"
  );

  cartPanel.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================
   CART EVENTS
   ========================= */

cartBtn.addEventListener(
  "click",
  openCart
);


closeCart.addEventListener(
  "click",
  closeCartPanel
);


overlay.addEventListener(
  "click",
  closeCartPanel
);


/* =========================
   CATEGORY FILTERS
   ========================= */

document
  .querySelectorAll(
    ".category-strip a"
  )
  .forEach(link => {

    link.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const category =
          link.dataset.category;

        displayProducts(
          category
        );


        document
          .getElementById(
            "products"
          )
          .scrollIntoView({
            behavior: "smooth"
          });

      }
    );

  });


/* =========================
   VIEW ALL
   ========================= */

allProducts.addEventListener(
  "click",
  () => {

    displayProducts(
      "all"
    );

  }
);


/* =========================
   CHECKOUT
   ========================= */

checkoutBtn.addEventListener(
  "click",
  () => {

    if (cart.length === 0) {

      alert(
        "Your shopping bag is empty."
      );

      return;

    }


    alert(
      "Checkout is coming next. We will connect your Supabase database and payment gateway."
    );

  }
);


/* =========================
   INITIALIZE STORE
   ========================= */

displayProducts();

updateCart();
