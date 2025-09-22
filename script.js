// Trivia Gate Logic
const TriviaGate = {
  init() {
    this.setupTriviaListeners();
  },

  setupTriviaListeners() {
    const options = document.querySelectorAll(".option-btn");
    options.forEach((option) => {
      option.addEventListener("click", () => this.handleAnswer(option));
    });

    // Add touch feedback for mobile
    options.forEach((option) => {
      option.addEventListener("touchstart", () => {
        option.style.transform = "translateY(2px)";
      });

      option.addEventListener("touchend", () => {
        setTimeout(() => {
          option.style.transform = "";
        }, 100);
      });
    });
  },

  handleAnswer(selectedOption) {
    const options = document.querySelectorAll(".option-btn");
    const triviaGate = document.querySelector(".trivia-gate");
    const bookContainer = document.querySelector(".book-container");
    const selectedValue = selectedOption.dataset.answer;

    // Disable all options during animation
    options.forEach((opt) => (opt.disabled = true));

    if (selectedValue === "bollywood") {
      // Correct answer
      selectedOption.classList.add("correct");

      setTimeout(() => {
        this.openBook(triviaGate, bookContainer);
      }, 800);
    } else {
      // Wrong answer
      selectedOption.classList.add("incorrect");

      setTimeout(() => {
        selectedOption.classList.remove("incorrect");
        options.forEach((opt) => (opt.disabled = false));
      }, 1000);
    }
  },

  openBook(triviaGate, bookContainer) {
    // Fade out trivia gate
    triviaGate.style.opacity = "0";
    triviaGate.style.transform = "scale(0.95)";

    setTimeout(() => {
      triviaGate.style.display = "none";
      bookContainer.style.display = "flex";

      // Animate book opening
      setTimeout(() => {
        bookContainer.classList.add("visible");
        // Initialize book after opening
        if (window.bookController) {
          window.bookController.init();
        }
      }, 100);
    }, 500);
  },
};

// Book Controller Class
class BookController {
  constructor() {
    this.currentPage = 0;
    this.totalPages = 7; // Updated to include index page
    this.pages = document.querySelectorAll(".page");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.currentPageSpan = document.getElementById("currentPage");
    this.totalPagesSpan = document.getElementById("totalPages");
    this.isAnimating = false;

    this.init();
  }

  init() {
    // Set initial state
    this.updatePageIndicator();
    this.updateButtonStates();

    // Add event listeners
    this.addEventListeners();

    // Set initial page positions
    this.setInitialPagePositions();

    console.log("Book initialized successfully");
  }

  setInitialPagePositions() {
    this.pages.forEach((page, index) => {
      if (index <= this.currentPage) {
        page.classList.add("flipped");
      } else {
        page.classList.remove("flipped");
      }
    });
  }

  addEventListeners() {
    // Navigation buttons
    this.prevBtn.addEventListener("click", () => this.previousPage());
    this.nextBtn.addEventListener("click", () => this.nextPage());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.previousPage();
      } else if (e.key === "ArrowRight") {
        this.nextPage();
      }
    });

    // Page click navigation
    this.pages.forEach((page, index) => {
      page.addEventListener("click", (e) => {
        const rect = page.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pageWidth = rect.width;

        // If clicked on right half, go to next page
        if (clickX > pageWidth / 2) {
          this.nextPage();
        } else {
          this.previousPage();
        }
      });
    });

    // Swipe gesture support for mobile
    this.addTouchSupport();
  }

  addTouchSupport() {
    let startX = 0;
    let startY = 0;

    document.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = startX - endX;
        const diffY = startY - endY;

        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (Math.abs(diffX) > 50) {
            // Minimum swipe distance
            if (diffX > 0) {
              // Swiped left - next page
              this.nextPage();
            } else {
              // Swiped right - previous page
              this.previousPage();
            }
          }
        }

        startX = 0;
        startY = 0;
      },
      { passive: true }
    );
  }

  nextPage() {
    if (this.isAnimating || this.currentPage >= this.totalPages - 1) return;

    this.isAnimating = true;
    this.currentPage++;

    // Flip the current page
    const pageToFlip = this.pages[this.currentPage - 1];
    pageToFlip.classList.add("flipped");

    this.updateUI();

    // Add sound effect (optional)
    this.playPageFlipSound();

    // Reset animation lock after animation completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }

  previousPage() {
    if (this.isAnimating || this.currentPage <= 0) return;

    this.isAnimating = true;

    // Flip back the current page
    const pageToFlipBack = this.pages[this.currentPage - 1];
    pageToFlipBack.classList.remove("flipped");

    this.currentPage--;

    this.updateUI();

    // Add sound effect (optional)
    this.playPageFlipSound();

    // Reset animation lock after animation completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }

  goToPage(pageNumber) {
    if (this.isAnimating || pageNumber < 0 || pageNumber >= this.totalPages)
      return;

    this.isAnimating = true;

    // Determine direction
    const direction = pageNumber > this.currentPage ? "forward" : "backward";

    if (direction === "forward") {
      // Flip pages forward
      for (let i = this.currentPage; i < pageNumber; i++) {
        setTimeout(() => {
          this.pages[i].classList.add("flipped");
        }, i * 100);
      }
    } else {
      // Flip pages backward
      for (let i = this.currentPage - 1; i >= pageNumber; i--) {
        setTimeout(() => {
          this.pages[i].classList.remove("flipped");
        }, (this.currentPage - 1 - i) * 100);
      }
    }

    this.currentPage = pageNumber;
    this.updateUI();

    setTimeout(() => {
      this.isAnimating = false;
    }, Math.abs(pageNumber - this.currentPage) * 100 + 800);
  }

  updateUI() {
    this.updatePageIndicator();
    this.updateButtonStates();
    this.updateBookTransform();
  }

  updatePageIndicator() {
    this.currentPageSpan.textContent = this.currentPage + 1;
    this.totalPagesSpan.textContent = this.totalPages;
  }

  updateButtonStates() {
    this.prevBtn.disabled = this.currentPage === 0;
    this.nextBtn.disabled = this.currentPage === this.totalPages - 1;
  }

  updateBookTransform() {
    const book = document.getElementById("book");
    const progress = this.currentPage / (this.totalPages - 1);

    // Subtle rotation based on page progress
    const rotateY = -15 + progress * 10;
    const rotateX = 5 - progress * 3;

    book.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  }

  playPageFlipSound() {
    // Create a subtle page flip sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if Web Audio is not supported
      console.log("Audio not supported");
    }
  }

  // Auto-flip feature (optional)
  startAutoFlip(interval = 5000) {
    this.autoFlipInterval = setInterval(() => {
      if (this.currentPage < this.totalPages - 1) {
        this.nextPage();
      } else {
        this.goToPage(0); // Return to start
      }
    }, interval);
  }

  stopAutoFlip() {
    if (this.autoFlipInterval) {
      clearInterval(this.autoFlipInterval);
      this.autoFlipInterval = null;
    }
  }
}

// Initialize the book when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const book = new BookController();

  // Add some helpful console messages
  console.log("🎉 Happy Birthday Book Loaded!");
  console.log(
    "📚 Navigation: Use arrow keys, click page edges, or swipe on mobile"
  );

  // Optional: Add auto-flip button
  const autoFlipBtn = document.createElement("button");
  autoFlipBtn.textContent = "▶️ Auto-flip";
  autoFlipBtn.className = "nav-btn";
  autoFlipBtn.style.marginLeft = "10px";
  autoFlipBtn.onclick = () => {
    if (book.autoFlipInterval) {
      book.stopAutoFlip();
      autoFlipBtn.textContent = "▶️ Auto-flip";
    } else {
      book.startAutoFlip(3000);
      autoFlipBtn.textContent = "⏸️ Stop";
    }
  };

  document.querySelector(".book-controls").appendChild(autoFlipBtn);

  // Add page shortcuts
  const shortcuts = document.createElement("div");
  shortcuts.style.marginTop = "20px";
  shortcuts.style.display = "flex";
  shortcuts.style.gap = "10px";
  shortcuts.style.flexWrap = "wrap";
  shortcuts.style.justifyContent = "center";

  for (let i = 0; i < book.totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i + 1;
    pageBtn.className = "nav-btn";
    pageBtn.style.padding = "8px 12px";
    pageBtn.style.fontSize = "0.9rem";
    pageBtn.onclick = () => book.goToPage(i);
    shortcuts.appendChild(pageBtn);
  }

  document.querySelector(".book-container").appendChild(shortcuts);

  // Expose book instance globally for debugging
  window.book = book;
});

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Initialize trivia gate first
  TriviaGate.init();

  // Create book controller but don't initialize until book opens
  window.bookController = new BookController();

  // Add some visual enhancements
  const closedBook = document.querySelector(".closed-book");
  if (closedBook) {
    // Add subtle hover effect to closed book
    closedBook.addEventListener("mouseenter", () => {
      closedBook.style.transform = "translateY(-5px) rotateY(-10deg)";
    });

    closedBook.addEventListener("mouseleave", () => {
      closedBook.style.transform = "translateY(0) rotateY(-15deg)";
    });
  }

  // Add mobile touch feedback to trivia container
  const triviaContainer = document.querySelector(".trivia-container");
  if (triviaContainer) {
    triviaContainer.addEventListener("touchstart", (e) => {
      e.preventDefault();
    });
  }
});

// Legacy initialization code - keep for backward compatibility
document.addEventListener("DOMContentLoaded", () => {
  // Add page hover effects
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    page.addEventListener("mouseenter", () => {
      if (!page.classList.contains("flipped")) {
        page.style.transform = page.style.transform + " translateZ(5px)";
      }
    });

    page.addEventListener("mouseleave", () => {
      page.style.transform = page.style.transform.replace(
        " translateZ(5px)",
        ""
      );
    });
  });

  // Add book breathing animation
  const book = document.getElementById("book");
  setInterval(() => {
    book.style.boxShadow = `
            0 0 ${Math.sin(Date.now() / 1000) * 5 + 25}px rgba(0, 0, 0, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.1)
        `;
  }, 50);
});
