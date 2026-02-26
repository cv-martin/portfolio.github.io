/*
  Template Name: Morex - Personal Portfolio HTML Template
  Author Name: Hook theme
  Author URL: https://themeforest.net/user/hooktheme
  Version: 1.0.0
*/

"use strict";


const preLoader = function () {
  let preloaderWrapper = document.getElementById("preloader");
  
  // Instant reveal logic for performance (Zero-Delay)
  const revealPage = () => {
    if (preloaderWrapper) {
      preloaderWrapper.classList.add("preloaded");
      setTimeout(() => preloaderWrapper.remove(), 500);
    }
  };

  // Clear as soon as initial HTML is ready - don't wait for heavy images
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealPage);
  } else {
    revealPage();
  }
  
  // Safety fallback for slow scripts
  setTimeout(revealPage, 1000);
};
preLoader();

// Allow standard HTML form submission for Contact Form so Formsubmit.co can activate the email properly
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact__form");
  if (contactForm) {
    contactForm.addEventListener("submit", () => {
      const btn = contactForm.querySelector("button");
      btn.textContent = "Sending Request...";
      // We do not preventDefault here. 
      // Let the browser submit to formsubmit.co normally.
    });
  }
});

// getSiblings
var getSiblings = function (elem) {
  const siblings = [];
  let sibling = elem.parentNode.firstChild;
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
};

/* Slide Up */
var slideUp = (target, time) => {
  const duration = time ? time : 500;
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + "ms";
  target.style.boxSizing = "border-box";
  target.style.height = target.offsetHeight + "px";
  target.offsetHeight;
  target.style.overflow = "hidden";
  target.style.height = 0;
  window.setTimeout(() => {
    target.style.display = "none";
    target.style.removeProperty("height");
    target.style.removeProperty("overflow");
    target.style.removeProperty("transition-duration");
    target.style.removeProperty("transition-property");
  }, duration);
};

/* Slide Down */
var slideDown = (target, time) => {
  const duration = time ? time : 500;
  target.style.removeProperty("display");
  let display = window.getComputedStyle(target).display;
  if (display === "none") display = "block";
  target.style.display = display;
  const height = target.offsetHeight;
  target.style.overflow = "hidden";
  target.style.height = 0;
  target.offsetHeight;
  target.style.boxSizing = "border-box";
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + "ms";
  target.style.height = height + "px";
  window.setTimeout(() => {
    target.style.removeProperty("height");
    target.style.removeProperty("overflow");
    target.style.removeProperty("transition-duration");
    target.style.removeProperty("transition-property");
  }, duration);
};

// Get window top offset
function TopOffset(el) {
  let rect = el.getBoundingClientRect(),
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop };
}

// Header sticky activation
const headerStickyWrapper = document.querySelector("header");
const headerStickyTarget = document.querySelector(".header__sticky");

if (headerStickyTarget && headerStickyWrapper) {
  let headerHeight = headerStickyWrapper.clientHeight;
  let targetElementTopOffset = headerStickyWrapper.offsetTop;
  
  // Cache offset on resize
  window.addEventListener("resize", () => {
    targetElementTopOffset = headerStickyWrapper.offsetTop;
  });

  let isSticky = false;
  window.addEventListener("scroll", function () {
    const scrollY = window.scrollY;
    if (scrollY > targetElementTopOffset) {
      if (!isSticky) {
        headerStickyTarget.classList.add("sticky");
        isSticky = true;
      }
    } else {
      if (isSticky) {
        headerStickyTarget.classList.remove("sticky");
        isSticky = false;
      }
    }
  }, { passive: true });
}

// Scroll up activation
const scrollTop = document.getElementById("scroll__top");
if (scrollTop) {
  scrollTop.addEventListener("click", function () {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  });
  
  let isScrollTopVisible = false;
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      if (!isScrollTopVisible) {
        scrollTop.classList.add("active");
        isScrollTopVisible = true;
      }
    } else {
      if (isScrollTopVisible) {
        scrollTop.classList.remove("active");
        isScrollTopVisible = false;
      }
    }
  }, { passive: true });
}





// Toggle navigation
const toggleNavButton = document.querySelector(".toggle__navigation--button");
const onBodyClick = handleBodyClick.bind(this);
toggleNavButton?.addEventListener("click", (event) => {
  event.preventDefault();
  if(toggleNavButton.parentElement.classList.contains("menu--visible")){
    toggleNavButton.parentElement.classList.remove("menu--visible");
    document.body.removeEventListener("click", onBodyClick);
  }else{
    toggleNavButton.parentElement.classList.add("menu--visible");
    document.body.addEventListener("click", onBodyClick);
  }
})
function handleBodyClick(evt) {
  const target = evt.target;
  if (!target.closest(".toggle__navigation--button") && !target.closest(".toggle__navigation")) {
    document.body.removeEventListener("click", onBodyClick);
    if(toggleNavButton.parentElement.classList.contains("menu--visible")){
      toggleNavButton.parentElement.classList.remove("menu--visible");
    }
  }
} 


/** -------- Isotope activation js ----------- **/

const isotopeGrid = document.querySelector(".portfolio__grid");
if(isotopeGrid){
  imagesLoaded(isotopeGrid, function( instance ) {
    // init Isotope
    var iso = new Isotope(isotopeGrid, {
      itemSelector: '.element-item',
      percentPosition: true,
      masonry: {
        columnWidth: ".element-item"
      }
    });

    // filter functions
    var filterFns = {
      // show if number is greater than 50
      numberGreaterThan50: function( itemElem ) {
        var number = itemElem.querySelector('.number').textContent;
        return parseInt( number, 10 ) > 50;
      },
      // show if name ends with -ium
      ium: function( itemElem ) {
        var name = itemElem.querySelector('.name').textContent;
        return name.match( /ium$/ );
      }
    };

    // bind filter button click
    var filtersElem = document.querySelector('.filters-button-group');
    if (filtersElem) {
      filtersElem.addEventListener( 'click', function( event ) {
        const button = event.target.closest('button');
        if ( !button ) return;
        
        var filterValue = button.getAttribute('data-filter');
        // use matching filter function
        filterValue = filterFns[ filterValue ] || filterValue;
        iso.arrange({ filter: filterValue });
        
        // Update is-checked class
        filtersElem.querySelector('.is-checked')?.classList.remove('is-checked');
        button.classList.add('is-checked');
      });
    }

    // change is-checked class on buttons (Shared logic already handled in main listener)
    // Removed redundant radioButtonGroup listener to avoid event collisions

  });
  

}


// CounterUp Activation
const wrapper = document.getElementById("funfactId");
if (wrapper) {
  const counters = wrapper.querySelectorAll(".js-counter");
  const duration = 400;

  let isCounted = false;
  const handleCounterScroll = function () {
    const wrapperPos = wrapper.offsetTop - window.innerHeight;
    if (!isCounted && window.scrollY > wrapperPos) {
      counters.forEach((counter) => {
        const countTo = parseInt(counter.dataset.count);
        const countPerMs = countTo / duration;

        let currentCount = 0;
        const countInterval = setInterval(function () {
          if (currentCount >= countTo) {
            clearInterval(countInterval);
            counter.textContent = countTo;
          } else {
            counter.textContent = Math.round(currentCount);
            currentCount += countPerMs;
          }
        }, 16); // ~60fps instead of 1ms
      });
      isCounted = true;
      window.removeEventListener("scroll", handleCounterScroll);
    }
  };
  window.addEventListener("scroll", handleCounterScroll, { passive: true });
}

// testimonial swiper activation
var swiper = new Swiper(".testimonial__swiper--activation", {
  slidesPerView: 1,
  loop: false,
  clickable: true,
  spaceBetween: 30,
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});


/* Offcanvas Mobile Menu Function */
const offcanvasHeader = function () {
  const offcanvasOpen = document.querySelector(
      ".offcanvas__header--menu__open--btn"
    ),
    offcanvasClose = document.querySelector(".offcanvas__close--btn"),
    offcanvasHeader = document.querySelector(".offcanvas__header"),
    offcanvasMenu = document.querySelector(".offcanvas__menu"),
    body = document.querySelector("body");
  /* Offcanvas SubMenu Toggle */
  if (offcanvasMenu) {
    offcanvasMenu
      .querySelectorAll(".offcanvas__sub_menu")
      .forEach(function (ul) {
        const subMenuToggle = document.createElement("button");
        subMenuToggle.classList.add("offcanvas__sub_menu_toggle");
        ul.parentNode.appendChild(subMenuToggle);
      });
  }
  /* Open/Close Menu On Click Toggle Button */
  if (offcanvasOpen) {
    offcanvasOpen.addEventListener("click", function (e) {
      e.preventDefault();
      const target = e.target.closest("[data-offcanvas]");
      if (target) {
        offcanvasHeader.classList.add("open");
        body.classList.add("mobile_menu_open");
      }
    });
  }
  if (offcanvasClose) {
    offcanvasClose.addEventListener("click", function (e) {
      e.preventDefault();
      const target = e.target.closest("[data-offcanvas]");
      if (target) {
        offcanvasHeader.classList.remove("open");
        body.classList.remove("mobile_menu_open");
      }
    });
  }

  /* Mobile submenu slideToggle Activation */
  let mobileMenuWrapper = document.querySelector(".offcanvas__menu_ul");
  if (mobileMenuWrapper) {
    mobileMenuWrapper.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.classList.contains("offcanvas__sub_menu_toggle")) {
        const parent = targetElement.parentElement;
        if (parent.classList.contains("active")) {
          targetElement.classList.remove("active");
          parent.classList.remove("active");
          parent
            .querySelectorAll(".offcanvas__sub_menu")
            .forEach(function (subMenu) {
              subMenu.parentElement.classList.remove("active");
              subMenu.nextElementSibling.classList.remove("active");
              slideUp(subMenu);
            });
        } else {
          targetElement.classList.add("active");
          parent.classList.add("active");
          slideDown(targetElement.previousElementSibling);
          getSiblings(parent).forEach(function (item) {
            item.classList.remove("active");
            item
              .querySelectorAll(".offcanvas__sub_menu")
              .forEach(function (subMenu) {
                subMenu.parentElement.classList.remove("active");
                subMenu.nextElementSibling.classList.remove("active");
                slideUp(subMenu);
              });
          });
        }
      }
    });
  }

  if (offcanvasHeader) {
    document.addEventListener("click", function (event) {
      if (
        !event.target.closest(".offcanvas__header--menu__open--btn") &&
        !event.target.classList.contains(
          ".offcanvas__header--menu__open--btn".replace(/\./, "")
        )
      ) {
        if (
          !event.target.closest(".offcanvas__header") &&
          !event.target.classList.contains(
            ".offcanvas__header".replace(/\./, "")
          )
        ) {
          offcanvasHeader.classList.remove("open");
          body.classList.remove("mobile_menu_open");
        }
      }
    });
  }

  /* Remove Mobile Menu Open Class & Hide Mobile Menu When Window Width in More Than 991 */
  if (offcanvasHeader) {
    window.addEventListener("resize", function () {
      if (window.outerWidth >= 992) {
        offcanvasHeader.classList.remove("open");
        body.classList.remove("mobile_menu_open");
      }
    });
  }
};
offcanvasHeader();

// Category Submenu
const categoryMobileMenu = function () {
  const CategorySubMenu = document.querySelector(".category__mobile--menu");
  if (CategorySubMenu) {
    CategorySubMenu.querySelectorAll(".category__sub--menu").forEach(function (
      ul
    ) {
      let catsubMenuToggle = document.createElement("button");
      catsubMenuToggle.classList.add("category__sub--menu_toggle");
      ul.parentNode.appendChild(catsubMenuToggle);
    });
  }
  let categoryMenuWrapper = document.querySelector(
    ".category__mobile--menu_ul"
  );
  if (categoryMenuWrapper) {
    categoryMenuWrapper.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.classList.contains("category__sub--menu_toggle")) {
        const parent = targetElement.parentElement;
        if (parent.classList.contains("active")) {
          targetElement.classList.remove("active");
          parent.classList.remove("active");
          parent
            .querySelectorAll(".category__sub--menu")
            .forEach(function (subMenu) {
              subMenu.parentElement.classList.remove("active");
              subMenu.nextElementSibling.classList.remove("active");
              slideUp(subMenu);
            });
        } else {
          targetElement.classList.add("active");
          parent.classList.add("active");
          slideDown(targetElement.previousElementSibling);
          getSiblings(parent).forEach(function (item) {
            item.classList.remove("active");
            item
              .querySelectorAll(".category__sub--menu")
              .forEach(function (subMenu) {
                subMenu.parentElement.classList.remove("active");
                subMenu.nextElementSibling.classList.remove("active");
                slideUp(subMenu);
              });
          });
        }
      }
    });
  }
};
categoryMobileMenu();

// Newsletter popup
const newsletterPopup = function () {
  let newsletterWrapper = document.querySelector(".newsletter__popup"),
    newsletterCloseButton = document.querySelector(
      ".newsletter__popup--close__btn"
    ),
    dontShowPopup = document.querySelector("#newsletter__dont--show"),
    popuDontShowMode = localStorage.getItem("newsletter__show");

  if (newsletterWrapper && popuDontShowMode == null) {
    window.addEventListener("load", (event) => {
      setTimeout(function () {
        document.body.classList.add("overlay__active");
        newsletterWrapper.classList.add("newsletter__show");

        document.addEventListener("click", function (event) {
          if (!event.target.closest(".newsletter__popup--inner")) {
            document.body.classList.remove("overlay__active");
            newsletterWrapper.classList.remove("newsletter__show");
          }
        });

        newsletterCloseButton.addEventListener("click", function () {
          document.body.classList.remove("overlay__active");
          newsletterWrapper.classList.remove("newsletter__show");
        });

        dontShowPopup.addEventListener("click", function () {
          if (dontShowPopup.checked) {
            localStorage.setItem("newsletter__show", true);
          } else {
            localStorage.removeItem("newsletter__show");
          }
        });
      }, 3000);
    });
  }
};
newsletterPopup();

