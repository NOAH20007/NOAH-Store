// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Carousel Auto-Scroll & Dots Logic
  const track = document.getElementById("carouselTrack");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;
  const totalSlides = dots.length;
  let autoScrollInterval;

  if (track && dots.length > 0) {
    const updateDots = (index) => {
      dots.forEach((d) => d.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    };

    const goToSlide = (index) => {
      currentSlide = index;
      const slideWidth = track.clientWidth;
      track.scrollTo({ left: slideWidth * currentSlide, behavior: "smooth" });
      updateDots(currentSlide);
    };

    const nextSlide = () => {
      currentSlide++;
      if (currentSlide >= totalSlides) {
        currentSlide = 0; // Loop back to start
      }
      goToSlide(currentSlide);
    };

    // Click dots to navigate
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);
        resetAutoScroll(); // reset timer on manual click
      });
    });

    // Listen for manual swipe to update dots without fighting auto-scroll immediately
    track.addEventListener("scroll", () => {
      const slideWidth = track.clientWidth;
      const scrollLeft = track.scrollLeft;
      const index = Math.round(scrollLeft / slideWidth);
      if (index !== currentSlide && index >= 0 && index < totalSlides) {
        currentSlide = index;
        updateDots(currentSlide);
      }
    });

    const startAutoScroll = () => {
      autoScrollInterval = setInterval(nextSlide, 5000); // 5s interval
    };

    const resetAutoScroll = () => {
      clearInterval(autoScrollInterval);
      startAutoScroll();
    };

    // Start Auto Scroll
    startAutoScroll();

    // Fast Swipe / Flick logic for desktop mouse
    let isDown = false;
    let startX;
    let swipeTriggered = false;

    track.addEventListener("mousedown", (e) => {
      isDown = true;
      swipeTriggered = false;
      startX = e.pageX;
      track.style.cursor = "grabbing";
      clearInterval(autoScrollInterval); // Pause auto-scroll while holding
    });

    const endSwipe = () => {
      if (isDown) {
        isDown = false;
        track.style.cursor = "grab";
        startAutoScroll();
      }
    };

    track.addEventListener("mouseleave", endSwipe);
    track.addEventListener("mouseup", endSwipe);

    track.addEventListener("mousemove", (e) => {
      if (!isDown || swipeTriggered) return;

      const currentX = e.pageX;
      const diffX = startX - currentX; // Positive means swiped left -> next slide

      // If dragged more than 50 pixels, trigger the slide!
      if (Math.abs(diffX) > 50) {
        swipeTriggered = true; // prevent multiple triggers in one hold
        if (diffX > 0) {
          // Go Next Slide
          let nextIdx = currentSlide + 1;
          if (nextIdx >= totalSlides) nextIdx = 0;
          goToSlide(nextIdx);
        } else {
          // Go Prev Slide
          let prevIdx = currentSlide - 1;
          if (prevIdx < 0) prevIdx = totalSlides - 1;
          goToSlide(prevIdx);
        }
      }
    });
  }

  // Mobile Navigation Toggle
  const hamburger = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");
  const navLinksArray = document.querySelectorAll(".nav-links a");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile menu when a link is clicked
  navLinksArray.forEach((link) => {
    link.addEventListener("click", () => {
      if (hamburger.classList.contains("active")) {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  });

  // Navbar Scroll Effect (Glassmorphism shadow enhancement)
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
      navbar.style.background = "rgba(11, 15, 25, 0.85)";
    } else {
      navbar.style.boxShadow = "none";
      navbar.style.background = "rgba(11, 15, 25, 0.7)";
    }

    // Active Link Highlighting
    let current = "";
    const sections = document.querySelectorAll("section, footer");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinksArray.forEach((a) => {
      a.classList.remove("active");
      if (a.getAttribute("href").includes(current)) {
        a.classList.add("active");
      }
    });
  });

  // Simple Search Functionality (Visual Demo)
  const searchInput = document.getElementById("game-search");
  const searchBtn = document.querySelector(".search-btn");
  const gameCards = document.querySelectorAll(".game-card");

  if (searchInput && searchBtn) {
    const filterGames = () => {
      const query = searchInput.value.toLowerCase();
      gameCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        if (title.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
      // Scroll to games section if searching
      if (query !== "") {
        const gamesSection = document.getElementById("games");
        if (gamesSection) gamesSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    searchBtn.addEventListener("click", filterGames);
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        filterGames();
      }
    });

    // Reset view on clear
    searchInput.addEventListener("input", (e) => {
      if (e.target.value === "") {
        gameCards.forEach((card) => {
          card.style.display = "flex";
        });
      }
    });
  }

  // Checkout Page Logic - Parse filename instead of URL parameter
  const pathName = window.location.pathname;
  let currentGameId = "ml"; // Default

  if (pathName.includes("pubg.html")) currentGameId = "pubg";
  else if (pathName.includes("freefire.html")) currentGameId = "ff";
  else if (pathName.includes("magicgogo.html")) currentGameId = "magicgogo";
  else if (pathName.includes("bloodstrike.html")) currentGameId = "bloodstrike";
  else if (pathName.includes("honorofkings.html")) currentGameId = "hok";
  else if (pathName.includes("mobilelegend.html")) currentGameId = "ml";

  // Game Database
  const gamesDB = {
    ml: {
      title: "Mobile Legends: Bang Bang",
      publisher: "Moonton",
      imageSrc: "assets/mobie.png",
      userIdLabel: "User ID",
      zoneIdLabel: "Server ID",
      needsZoneId: true,
      instructions:
        "To find your User ID, tap your avatar in the top left corner of the main screen. The User ID is located below your name (e.g., 12345678(1234)).",
      products: [
        { amount: "💎 86 Diamonds", price: 0.99, value: 0.99 },
        { amount: "💎 172 Diamonds", price: 1.99, value: 1.99 },
        { amount: "💎 257 Diamonds", price: 2.99, value: 2.99 },
        { amount: "💎 706 Diamonds", price: 7.99, value: 7.99 },
        { amount: "💎 2195 Diamonds", price: 24.99, value: 24.99 },
        { amount: "💎 3688 Diamonds", price: 39.99, value: 39.99 },
        { amount: "⭐ Twilight Pass", price: 9.99, value: 9.99, type: "pass" },
        {
          amount: "👑 Weekly Diamond Pass",
          price: 1.59,
          value: 1.59,
          type: "pass",
        },
      ],
    },
    pubg: {
      title: "PUBG Mobile",
      publisher: "Tencent Games",
      imageSrc: "assets/pubg.png",
      userIdLabel: "Player ID",
      needsZoneId: false,
      instructions:
        "To find your Player ID, click on your avatar in the top right corner. Your Player ID is the string of numbers (e.g., 5123456789).",
      products: [
        { amount: "🪙 60 UC", price: 0.99, value: 0.99 },
        { amount: "🪙 325 UC", price: 4.99, value: 4.99 },
        { amount: "🪙 660 UC", price: 9.99, value: 9.99 },
        { amount: "🪙 1800 UC", price: 24.99, value: 24.99 },
        { amount: "🪙 3850 UC", price: 49.99, value: 49.99 },
        { amount: "🪙 8100 UC", price: 99.99, value: 99.99 },
        { amount: "🎫 Royale Pass", price: 14.99, value: 14.99, type: "pass" },
      ],
    },
    ff: {
      title: "Free Fire",
      publisher: "Garena",
      imageSrc: "assets/freefire.webp",
      userIdLabel: "Player ID",
      needsZoneId: false,
      instructions:
        "To find your Player ID, tap on your profile banner in the top left corner. Your Player ID will be shown below your IGN.",
      products: [
        { amount: "💎 100 Diamonds", price: 0.99, value: 0.99 },
        { amount: "💎 210 Diamonds", price: 1.99, value: 1.99 },
        { amount: "💎 530 Diamonds", price: 4.99, value: 4.99 },
        { amount: "💎 1080 Diamonds", price: 9.99, value: 9.99 },
        { amount: "💎 2200 Diamonds", price: 19.99, value: 19.99 },
        {
          amount: "👑 Weekly Membership",
          price: 1.99,
          value: 1.99,
          type: "pass",
        },
        {
          amount: "👑 Monthly Membership",
          price: 7.99,
          value: 7.99,
          type: "pass",
        },
      ],
    },
    magicgogo: {
      title: "Magic GoGo",
      publisher: "Magic Games",
      imageSrc: "assets/magic-chess-go-go.avif",
      userIdLabel: "Account ID",
      zoneIdLabel: "Server ID",
      needsZoneId: true,
      instructions:
        "Enter your Magic GoGo Account ID and Server ID to recharge.",
      products: [
        { amount: "💎 100 Gems", price: 0.99, value: 0.99 },
        { amount: "💎 500 Gems", price: 4.99, value: 4.99 },
        { amount: "💎 1000 Gems", price: 9.99, value: 9.99 },
      ],
    },
    bloodstrike: {
      title: "Blood Strike",
      publisher: "NetEase Games",
      imageSrc: "assets/blood-strike.jpg",
      userIdLabel: "Character ID",
      needsZoneId: false,
      instructions: "Enter your Blood Strike Character ID to top up Gold.",
      products: [
        { amount: "🪙 100 Gold", price: 0.99, value: 0.99 },
        { amount: "🪙 500 Gold", price: 4.99, value: 4.99 },
        { amount: "🪙 1000 Gold", price: 9.99, value: 9.99 },
        { amount: "🪙 2000 Gold", price: 19.99, value: 19.99 },
      ],
    },
    hok: {
      title: "Honor of Kings",
      publisher: "Level Infinite",
      imageSrc: "assets/hornor.jpg",
      userIdLabel: "UID",
      zoneIdLabel: "Server ID",
      needsZoneId: true,
      instructions:
        "To find your UID and Server ID, tap on your avatar, go to Settings, and view your account details.",
      products: [
        { amount: "🪙 16 Tokens", price: 0.99, value: 0.99 },
        { amount: "🪙 80 Tokens", price: 4.99, value: 4.99 },
        { amount: "🪙 160 Tokens", price: 9.99, value: 9.99 },
        { amount: "🪙 400 Tokens", price: 24.99, value: 24.99 },
        { amount: "🪙 800 Tokens", price: 49.99, value: 49.99 },
      ],
    },
  };

  // Load Game Data on Checkout Page
  const checkoutPage = document.querySelector(".checkout-page");
  if (checkoutPage) {
    const gameData = gamesDB[currentGameId];

    if (gameData) {
      // Update Text
      document.querySelector(".game-details h2").textContent = gameData.title;
      document.querySelector(".game-details .publisher").textContent =
        gameData.publisher;
      document.getElementById("game-input-help").textContent =
        gameData.instructions;
      document.title = `${gameData.title} Top-Up | NOAH Store`;

      // Update Banner Image
      const gameBanner = document.querySelector(".game-banner");
      if (gameBanner) {
        // Check if an img exists inside, otherwise create it
        let bannerImg = gameBanner.querySelector("img");
        if (!bannerImg) {
          bannerImg = document.createElement("img");
          gameBanner.appendChild(bannerImg);
        }
        bannerImg.src = gameData.imageSrc;
        bannerImg.alt = gameData.title;
      }

      // Update User ID Label & Placeholder
      const userIdLabelElem = document.querySelector('label[for="userId"]');
      const userIdInputElem = document.getElementById("userId");
      if (userIdLabelElem && gameData.userIdLabel) {
        userIdLabelElem.textContent = gameData.userIdLabel;
        userIdInputElem.placeholder = `Enter ${gameData.userIdLabel}`;
      }

      // Toggle Server ID Input
      const zoneIdContainer = document.getElementById("zoneIdContainer");
      const zoneIdLabelElem = document.querySelector('label[for="zoneId"]');
      const zoneIdInputElem = document.getElementById("zoneId");
      if (gameData.needsZoneId) {
        zoneIdContainer.style.display = "flex";
        zoneIdInputElem.required = true;
        if (zoneIdLabelElem && gameData.zoneIdLabel) {
          zoneIdLabelElem.textContent = gameData.zoneIdLabel;
          zoneIdInputElem.placeholder = `(${gameData.zoneIdLabel})`;
        }
      } else {
        zoneIdContainer.style.display = "none";
        zoneIdInputElem.required = false;
      }

      // Populate Products
      const productGrid = document.querySelector(".product-grid");
      productGrid.innerHTML = ""; // Clear default products

      gameData.products.forEach((prod) => {
        const prodItem = document.createElement("div");
        prodItem.className = "product-item";
        prodItem.setAttribute("data-price", prod.value);
        if (prod.type) prodItem.setAttribute("data-type", prod.type);

        prodItem.innerHTML = `
                    <div class="product-amount">${prod.amount}</div>
                    <div class="product-price">$ ${prod.price}</div>
                `;

        productGrid.appendChild(prodItem);
      });
    }
  }

  // Dynamic Variables (will bind to newly created elements)
  let productItems = document.querySelectorAll(".product-item");
  const paymentItems = document.querySelectorAll(".payment-item");
  const totalPriceDisplay = document.getElementById("total-price");
  const selectedPackageDisplay = document.getElementById("selected-package");
  const selectedPaymentDisplay = document.getElementById(
    "selected-payment-method",
  );
  const btnBuy = document.getElementById("btn-buy");
  const btnCheckUsername = document.getElementById("btn-check-username");
  const usernameResultWrapper = document.getElementById("username-result");
  const displayUsername = document.getElementById("display-username");
  let receiptModal = null;
  let validationMessage = null;

  let selectedPrice = 0;
  let selectedProduct = null;
  let selectedPayment = null;
  let usernameVerified = false;

  // Helper to format currency
  const formatCurrency = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
  };

  const ensureReceiptModal = () => {
    if (receiptModal || !checkoutPage) return receiptModal;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="receipt-modal" id="receipt-modal" aria-hidden="true">
          <div class="receipt-card">
            <div class="receipt-icon">➜</div>
            <h2>Complete Payment</h2>
            <p class="receipt-subtitle">Please scan the KHQR below to complete your top-up.</p>
            
            <div class="payment-qr-container">
              <img src="assets/khqr.jpg" alt="KHQR Payment" class="payment-qr-img">
              <div class="payment-qr-info">
                <p class="account-name">VUTHY KHORN</p>
                <p class="payment-amount" id="receipt-total-large">$ 0.00</p>
              </div>
            </div>

            <div class="receipt-list">
              <div class="receipt-row">
                <span>Game</span>
                <strong id="receipt-game">-</strong>
              </div>
              <div class="receipt-row">
                <span>Account</span>
                <strong id="receipt-account">-</strong>
              </div>
              <div class="receipt-row">
                <span>Package</span>
                <strong id="receipt-package">-</strong>
              </div>
            </div>

            <div class="payment-instructions">
              <p>1. Scan the QR code and pay the exact amount.</p>
              <p>2. Take a screenshot of your successful payment.</p>
              <p>3. Send the screenshot to our <a href="https://t.me/noahstore168" target="_blank" class="accent-link">Telegram Support</a> for instant processing.</p>
            </div>

            <button type="button" class="receipt-btn" id="receipt-close">I have paid</button>
          </div>
        </div>
      `,
    );

    receiptModal = document.getElementById("receipt-modal");
    const closeButton = document.getElementById("receipt-close");

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        receiptModal.classList.remove("is-open");
        receiptModal.setAttribute("aria-hidden", "true");
      });
    }

    if (receiptModal) {
      receiptModal.addEventListener("click", (event) => {
        if (event.target === receiptModal) {
          receiptModal.classList.remove("is-open");
          receiptModal.setAttribute("aria-hidden", "true");
        }
      });
    }

    return receiptModal;
  };

  const showReceiptModal = ({ game, account, packageName, payment, total }) => {
    const modal = ensureReceiptModal();
    if (!modal) return;

    document.getElementById("receipt-game").textContent = game;
    document.getElementById("receipt-account").textContent = account;
    document.getElementById("receipt-package").textContent = packageName;
    document.getElementById("receipt-total-large").textContent = total;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const ensureValidationMessage = () => {
    if (validationMessage || !btnCheckUsername) return validationMessage;

    btnCheckUsername.insertAdjacentHTML(
      "afterend",
      '<div id="checkout-validation-message" class="checkout-validation-message" style="display: none"></div>',
    );
    validationMessage = document.getElementById("checkout-validation-message");
    return validationMessage;
  };

  const showValidationMessage = (message) => {
    const messageNode = ensureValidationMessage();
    if (!messageNode) return;
    messageNode.textContent = message;
    messageNode.style.display = "block";
  };

  const hideValidationMessage = () => {
    const messageNode = ensureValidationMessage();
    if (!messageNode) return;
    messageNode.textContent = "";
    messageNode.style.display = "none";
  };

  // Update Checkout State
  const updateCheckoutState = () => {
    if (btnBuy) {
      // Require username check + product + payment
      if (selectedProduct && selectedPayment && usernameVerified) {
        btnBuy.disabled = false;
      } else {
        btnBuy.disabled = true;
      }

      if (selectedPrice > 0) {
        totalPriceDisplay.textContent = formatCurrency(selectedPrice);

        paymentItems.forEach((item) => {
          const priceElement = item.querySelector(".payment-price");
          if (priceElement) {
            priceElement.textContent = formatCurrency(selectedPrice);
          }
        });
      } else {
        totalPriceDisplay.textContent = "$ 0.00";
        paymentItems.forEach((item) => {
          const priceElement = item.querySelector(".payment-price");
          if (priceElement) {
            priceElement.textContent = "$ -";
          }
        });
      }

      if (selectedPackageDisplay) {
        const packageLabel = selectedProduct
          ? selectedProduct
              .querySelector(".product-amount")
              ?.textContent?.trim()
          : "Not selected";
        selectedPackageDisplay.textContent = packageLabel || "Not selected";
      }

      if (selectedPaymentDisplay) {
        const paymentLabel = selectedPayment
          ? selectedPayment.querySelector(".payment-name")?.textContent?.trim()
          : "Not selected";
        selectedPaymentDisplay.textContent = paymentLabel || "Not selected";
      }
    }
  };

  // Re-bind Product Selection (Needed because products are dynamically generated)
  const bindProductEvents = () => {
    productItems = document.querySelectorAll(".product-item");
    if (productItems.length > 0) {
      productItems.forEach((item) => {
        item.addEventListener("click", () => {
          productItems.forEach((p) => p.classList.remove("selected"));
          item.classList.add("selected");

          selectedProduct = item;
          selectedPrice = parseFloat(item.getAttribute("data-price"));
          updateCheckoutState();
        });
      });
    }
  };

  // Call immediately if on checkout page
  if (checkoutPage) bindProductEvents();

  // Payment Selection
  if (paymentItems.length > 0) {
    paymentItems.forEach((item) => {
      item.addEventListener("click", () => {
        paymentItems.forEach((p) => p.classList.remove("selected"));
        item.classList.add("selected");

        selectedPayment = item;
        updateCheckoutState();
      });
    });
  }

  // Check Username Logic
  if (btnCheckUsername) {
    btnCheckUsername.addEventListener("click", () => {
      const userId = document.getElementById("userId").value;
      const zoneId = document.getElementById("zoneId").value;
      const gameData = gamesDB[currentGameId];

      if (!userId) {
        showValidationMessage(
          `Please enter your ${gameData.userIdLabel || "User ID"} first.`,
        );
        return;
      }
      if (gameData.needsZoneId && !zoneId) {
        showValidationMessage(
          `Please enter your ${gameData.zoneIdLabel || "Server ID"} first.`,
        );
        return;
      }

      hideValidationMessage();

      // Loading State
      btnCheckUsername.textContent = "Checking...";
      btnCheckUsername.disabled = true;
      usernameResultWrapper.style.display = "none";
      usernameVerified = false;
      updateCheckoutState();

      // Simulate API Call delay
      setTimeout(() => {
        btnCheckUsername.textContent = "Check Username";
        btnCheckUsername.disabled = false;

        // Simulate a successful check (In real app, this data comes from API)
        const mockedUsername = "Player_" + userId.substring(0, 4);

        displayUsername.textContent = mockedUsername;
        usernameResultWrapper.style.display = "block";
        usernameVerified = true;

        updateCheckoutState();
      }, 1000);
    });

    // Reset verify state if user types in the box again
    document.getElementById("userId").addEventListener("input", () => {
      usernameVerified = false;
      usernameResultWrapper.style.display = "none";
      hideValidationMessage();
      updateCheckoutState();
    });
    document.getElementById("zoneId").addEventListener("input", () => {
      usernameVerified = false;
      usernameResultWrapper.style.display = "none";
      hideValidationMessage();
      updateCheckoutState();
    });
  }

  // Buy Button Action
  if (btnBuy) {
    btnBuy.addEventListener("click", () => {
      if (!usernameVerified) {
        alert(
          'Please click "Check Username" to verify your ID before purchasing.',
        );
        return;
      }

      const userId = document.getElementById("userId").value;
      const zoneId = document.getElementById("zoneId").value;
      const verifiedName = displayUsername.textContent;
      const gameData = gamesDB[currentGameId];

      let idString = gameData.needsZoneId ? `${userId} (${zoneId})` : userId;

      const packageName =
        selectedProduct.querySelector(".product-amount")?.textContent?.trim() ||
        "-";
      const paymentName =
        selectedPayment.querySelector(".payment-name")?.textContent?.trim() ||
        "-";

      showReceiptModal({
        game: gameData.title,
        account: `${verifiedName} - ${idString}`,
        packageName,
        payment: paymentName,
        total: formatCurrency(selectedPrice),
      });

      // Reset
      document.getElementById("userId").value = "";
      document.getElementById("zoneId").value = "";
      usernameVerified = false;
      usernameResultWrapper.style.display = "none";
      productItems.forEach((p) => p.classList.remove("selected"));
      paymentItems.forEach((p) => p.classList.remove("selected"));
      selectedProduct = null;
      selectedPayment = null;
      selectedPrice = 0;
      updateCheckoutState();
    });
  }
});
