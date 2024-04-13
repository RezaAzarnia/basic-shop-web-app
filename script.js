"use strict";
let allProducts = [];
let userCard = [];
let productCardsHtmlCode = "";
let userCardHtmlCode = "";
let isLoading = true;
const loaderItem = document.querySelector(".loader");
const cardsContainer = document.querySelector(".cards-row");
const cartBtn = document.querySelector(".modal-cart");
const modal = document.querySelector(".modal");
const priceElement = document.querySelector(".orders-total-price");
const notifItem = document.querySelector(".badge");
let ordersList = document.querySelector(".orders-list");

const addToLocale = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const getLocaleValues = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const getProductInfos = async () => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    isLoading = false;
    allProducts = [...products];
    createCards(allProducts);
    loaderItem.classList.add("hidden");
  } catch (error) {
    console.log(error);
  }
  // alert(error.message)
};
const createCards = (products) => {
  productCardsHtmlCode = products
    .map((product) => {
      return `
       <div class="card">
       <div class="card-picture">
         <img src=${product.image} alt="" />
       </div>
       <div class="card-title">
         <span>${product.title.slice(0, 30)}</span>
       </div>
       <div class="card-price">
       <span>$${product.price}</span>
     </div>
       <div class="card-btn">
         <button class="add-btn" onclick="addToCart(${
           product.id
         })">add to cart</button>
       </div>
     </div>
    `;
    })
    .join("");

  cardsContainer.insertAdjacentHTML("beforeend", productCardsHtmlCode);
};
const openCartModal = () => {
  if (userCard.length > 0) {
    modal.classList.add("active");
    modal.previousElementSibling.classList.add("active");
  } else {
    Toastify({
      text: "your card is empty!! please add some product",
      position: "center",
      style: {
        background: "var(--danger)",
        padding: "20px 10px",
      },
      duration: 3000,
    }).showToast();
  }
};
const closeCartModal = () => {
  modal.classList.remove("active");
  modal.previousElementSibling.classList.remove("active");
};
const isExistProduct = (productId) => {
  return userCard.find((item) => item.id === productId);
};
const addToCart = (productId) => {
  const product = allProducts.find((item) => item.id == productId);
  const existProduct = isExistProduct(productId);

  if (existProduct) {
    existProduct.quantity++;
  } else {
    userCard.push({
      ...product,
      title: product.title.slice(0, 30),
      quantity: 1,
    });
  }

  Toastify({
    text: "product added to your card succesfully",
    position: "left",
    style: {
      background: "var(--green)",
      padding: "20px 10px",
    },

    duration: 3000,
  }).showToast();

  addToLocale("userCard", userCard);
  createUserCardItems();
};
const handleProductQuantity = (productId, { target: productBtn }) => {
  const product = isExistProduct(+productId);

  switch (true) {
    case productBtn.classList.contains("increase-button"):
      product.quantity++;
      break;
    case productBtn.classList.contains("decrease-button"):
      product.quantity--;
      break;
  }
  product.quantity <= 0 &&
    (userCard = userCard.filter((item) => item.id !== productId));

  // close the modal if the user card is empty
  if (userCard.length <= 0) {
    modal.classList.contains("active") && closeCartModal();
  }

  //update values in locale
  addToLocale("userCard", userCard);
  createUserCardItems();
};
const createUserCardItems = () => {
  ordersList.innerHTML = "";
  userCardHtmlCode = userCard
    .map((product) => {
      return `    
        <li class="orders-list-item">
        <div class="order-detail">
          <div class="order-picture">
            <img src=${product.image} alt="" />
          </div>
          <div class="order-product-name">
            <h3>${product.title}</h3>
          </div>
        </div>
        <div class="order-action">
          <button class="decrease-button" 
              onclick="handleProductQuantity(${product.id},event)">
                -
              </button>
         
              <span class="order-quantity">${product.quantity}</span>
         
          <button class="increase-button"
               onclick="handleProductQuantity(${product.id},event)">
                 +
               </button>
        </div>
        <div class="order-price">$${product.price.toFixed(2)}</div>
      </li>
          `;
    })
    .reverse()
    .join("");
  calculatePrice();
  notifItem.innerHTML = userCard.length;
  ordersList.insertAdjacentHTML("beforeend", userCardHtmlCode);
};
const calculatePrice = () => {
  let totalPrice = userCard.reduce((total, currentValue) => {
    return total + currentValue.price * currentValue.quantity;
  }, 0);

  priceElement.innerHTML = `Total price is $${totalPrice.toFixed(2)}`;
};
window.addEventListener("load", () => {
  const userCardvalues = getLocaleValues("userCard");
  if (userCardvalues) {
    userCard = userCardvalues;
    createUserCardItems();
  }
  getProductInfos();
  notifItem.innerHTML = userCard.length;
});

cartBtn.addEventListener("click", openCartModal);

modal.previousElementSibling.addEventListener("click", closeCartModal);
