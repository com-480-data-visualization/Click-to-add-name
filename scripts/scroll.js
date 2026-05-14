/*
    Handles page scrolling and turning logic, supporting mouse wheel, keyboard arrows, dot clicks, and mobile gestures.
    Also handles the static image zoom feature on page-31.
*/

const viewport = document.getElementById("viewport");
const vTrack = document.getElementById("vTrack");
const verticalPages = [...document.querySelectorAll(".v-page")];
const horizontalDotsContainer = document.getElementById("horizontalDots");
const verticalDotsContainer = document.getElementById("verticalDots");
const teamFooter = document.getElementById("teamFooter");
const imageLightbox = document.getElementById("imageLightbox");
const imageLightboxImg = document.getElementById("imageLightboxImg");
const imageLightboxCaption = document.getElementById("imageLightboxCaption");

let currentVIndex = 0;
const currentHIndexByLayer = verticalPages.map(() => 0);
const lastVIndex = verticalPages.length - 1;
const footerRevealHeightVh = 10;
let isFooterRevealed = false;

let isTransitioning = false;
const transitionDuration = 560;
let isImageLightboxOpen = false;
const imageLightboxHideDuration = 280;
let imageLightboxCloseTimer = null;
// Default tooltip text for dots
const defaultLabel = "default_dot_label";

// Label texts can be defined here by layer/page
const verticalLabels = ["Cover", "Gender", "Country & GDP", "Paradox", "Conclusion"];
// Each vertical layer corresponds to an array, whose elements correspond to the horizontal page labels of that layer.
// Use "null" to not display a label.
const horizontalLabelsByLayer = [
    ["null"],
    ["null"],
    ["Map", "Bar Chart"],
    ["null"],
    ["null"]
];

// Normalizes the label; returns null if the label should not be displayed
function normalizeLabel(label) {
    if (label === null || label === undefined) return null;
    const text = String(label).trim();
    if (text === "" || text.toLowerCase() === "null") return null;
    return text;
}

function applyDotLabel(dot, rawLabel) {
    const normalizedLabel = normalizeLabel(rawLabel);
    if (normalizedLabel === null) {
        dot.dataset.label = "";
        dot.dataset.hideLabel = "true";
        return;
    }

    dot.dataset.label = normalizedLabel;
    dot.dataset.hideLabel = "false";
}

let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 45;

function createDots() {
    verticalDotsContainer.innerHTML = "";
    verticalPages.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.dataset.index = index;
        const rawLabel = index < verticalLabels.length ? verticalLabels[index] : defaultLabel;
        applyDotLabel(dot, rawLabel);
        verticalDotsContainer.appendChild(dot);
    });
    renderHorizontalDots();
    updateDots();
}

function renderHorizontalDots() {
    horizontalDotsContainer.innerHTML = "";
    const horizontalPageCount = verticalPages[currentVIndex].querySelectorAll(".h-page").length;
    const currentLayerLabels = horizontalLabelsByLayer[currentVIndex] ?? [];

    for (let i = 0; i < horizontalPageCount; i += 1) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.dataset.index = i;
        const rawLabel = i < currentLayerLabels.length ? currentLayerLabels[i] : defaultLabel;
        applyDotLabel(dot, rawLabel);
        horizontalDotsContainer.appendChild(dot);
    }
}

function updateDots() {
    [...verticalDotsContainer.children].forEach((dot, index) => {
        dot.classList.toggle("active", index === currentVIndex);
    });

    const currentHIndex = currentHIndexByLayer[currentVIndex];
    [...horizontalDotsContainer.children].forEach((dot, index) => {
        dot.classList.toggle("active", index === currentHIndex);
    });
}

function updateViewportPosition() {
    const offsetInVh = currentVIndex * 100 + (isFooterRevealed ? footerRevealHeightVh : 0);
    vTrack.style.transform = `translateY(-${offsetInVh}vh)`;
    teamFooter.classList.toggle("revealed", isFooterRevealed);
    document.body.classList.toggle("footer-revealed", isFooterRevealed);
}

function revealFooter() {
    if (isTransitioning || currentVIndex !== lastVIndex || isFooterRevealed) return;

    isFooterRevealed = true;
    updateViewportPosition();
    lockTransition();
}

function hideFooter() {
    if (isTransitioning || !isFooterRevealed) return;

    isFooterRevealed = false;
    updateViewportPosition();
    lockTransition();
}

// Universally lock during animations to avoid sequential triggers causing page jumps
function lockTransition() {
    isTransitioning = true;
    window.setTimeout(() => {
        isTransitioning = false;
    }, transitionDuration);
}

function openImageLightbox(imageElement) {
    if (!imageLightbox || !imageLightboxImg || !imageElement) return;

    if (imageLightboxCloseTimer !== null) {
        window.clearTimeout(imageLightboxCloseTimer);
        imageLightboxCloseTimer = null;
    }

    imageLightboxImg.src = imageElement.src;
    imageLightboxImg.alt = imageElement.alt || "Expanded image";
    
    // Read title and description
    const title = imageElement.dataset.title || "Image";
    const description = imageElement.dataset.description || "";
    if (imageLightboxCaption) {
        imageLightboxCaption.textContent = description || title;
    }
    
    imageLightbox.classList.remove("is-closing");
    imageLightbox.classList.add("is-open");
    imageLightbox.setAttribute("aria-hidden", "false");
    isImageLightboxOpen = true;
}

function closeImageLightbox() {
    if (!imageLightbox || !isImageLightboxOpen) return;

    imageLightbox.classList.add("is-closing");
    imageLightbox.setAttribute("aria-hidden", "true");
    isImageLightboxOpen = false;

    imageLightboxCloseTimer = window.setTimeout(() => {
        imageLightbox.classList.remove("is-open");
        imageLightbox.classList.remove("is-closing");
        imageLightboxImg.src = "";
        if (imageLightboxCaption) {
            imageLightboxCaption.textContent = "";
        }
        imageLightboxCloseTimer = null;
    }, imageLightboxHideDuration);
}

// Vertical transition: snap to whole screen on the specified layer
function goVertical(nextIndex) {
    if (isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= verticalPages.length) return;

    currentVIndex = nextIndex;
    isFooterRevealed = false;
    updateViewportPosition();
    renderHorizontalDots();
    updateDots();
    lockTransition();

    if (nextIndex === 1) {
        // wait 600ms
        setTimeout(() => {
            if (typeof window.startGenderAnimation === 'function') {
                window.startGenderAnimation();
            }
        }, 600);
    }
    if (nextIndex === 2) { 
        setTimeout(() => {
            if (typeof initLifespanMap === 'function') {
                initLifespanMap();
            }
        }, 600); 
    }
}



// Horizontal transition: flip left and right only in the current layer
function goHorizontal(nextIndex) {
    if (isTransitioning) return;
    const currentLayer = verticalPages[currentVIndex];
    const hTrack = currentLayer.querySelector(".h-track");
    const hPages = currentLayer.querySelectorAll(".h-page");

    if (nextIndex < 0 || nextIndex >= hPages.length) return;

    currentHIndexByLayer[currentVIndex] = nextIndex;
    hTrack.style.transform = `translateX(-${nextIndex * 100}vw)`;
    updateDots();
    lockTransition();
}

let scrollAccumulatorX = 0;
let scrollAccumulatorY = 0;
let lastWheelTime = 0;
let isScrollingSequence = false;

function handleWheel(event) {
    if (isImageLightboxOpen) {
        event.preventDefault();
        return;
    }
    event.preventDefault();

    const currentTime = Date.now();

    // If the interval between two wheel/touchpad events exceeds 40ms, the previous swipe and inertia are considered to be fully finished.
    // The user has started a new clear swipe action => reset accumulators and restart page flip evaluation.
    if (currentTime - lastWheelTime > 40) {
        isScrollingSequence = false;
        scrollAccumulatorX = 0;
        scrollAccumulatorY = 0;
    }
    lastWheelTime = currentTime;

    // If a page transition animation is playing, or this swipe sequence has already triggered a page flip (currently handling inertia tail), ignore subsequent accumulations.
    if (isTransitioning || isScrollingSequence) {
        return;
    }

    // Accumulate the displacement difference
    scrollAccumulatorX += event.deltaX;
    scrollAccumulatorY += event.deltaY;

    // Displacement threshold to trigger a page flip
    const threshold = 40;

    // Prioritize cases primarily consisting of vertical scrolling
    if (Math.abs(scrollAccumulatorY) > threshold && Math.abs(scrollAccumulatorY) > Math.abs(scrollAccumulatorX)) {
        isScrollingSequence = true; // Lock immediately, ignoring any subsequent inertia from this gesture
        if (scrollAccumulatorY > 0) {
            if (currentVIndex === lastVIndex) revealFooter();
            else goVertical(currentVIndex + 1);
        } else {
            if (isFooterRevealed) hideFooter();
            else goVertical(currentVIndex - 1);
        }
    } 
    // Handle cases where horizontal scroll acts as primary displacement
    else if (Math.abs(scrollAccumulatorX) > threshold && Math.abs(scrollAccumulatorX) > Math.abs(scrollAccumulatorY)) {
        isScrollingSequence = true; // Lock immediately
        if (scrollAccumulatorX > 0) {
            goHorizontal(currentHIndexByLayer[currentVIndex] + 1);
        } else {
            goHorizontal(currentHIndexByLayer[currentVIndex] - 1);
        }
    }
}

function handleKeyDown(event) {
    if (isImageLightboxOpen) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeImageLightbox();
        }
        return;
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (currentVIndex === lastVIndex) {
            revealFooter();
            return;
        }
        goVertical(currentVIndex + 1);
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (isFooterRevealed) {
            hideFooter();
            return;
        }
        goVertical(currentVIndex - 1);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        goHorizontal(currentHIndexByLayer[currentVIndex] + 1);
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        goHorizontal(currentHIndexByLayer[currentVIndex] - 1);
    }
}

// Click vertical dots on the right to switch directly to the corresponding vertical layer
function handleVerticalDotClick(event) {
    const targetDot = event.target.closest(".dot");
    if (!targetDot) return;
    goVertical(Number(targetDot.dataset.index));
}

// Click horizontal dots at the bottom to switch horizontal pages in the current layer
function handleHorizontalDotClick(event) {
    const targetDot = event.target.closest(".dot");
    if (!targetDot) return;
    goHorizontal(Number(targetDot.dataset.index));
}

// In-page buttons can also trigger horizontal page turns, avoiding sole reliance on gesture hints.
function handleHorizontalActionClick(event) {
    if (isImageLightboxOpen) return;

    const trigger = event.target.closest("[data-horizontal-target]");
    if (!trigger) return;

    const nextIndex = Number(trigger.dataset.horizontalTarget);
    if (Number.isNaN(nextIndex)) return;

    goHorizontal(nextIndex);
}

function handleLightboxClick(event) {
    const closeTrigger = event.target.closest("[data-lightbox-close]");
    if (closeTrigger) {
        closeImageLightbox();
        return;
    }

    const clickedImage = event.target.closest(".page-31-chart-image");
    if (!clickedImage) return;

    openImageLightbox(clickedImage);
}

// Mobile/tablet gestures: determine vertical or horizontal turning by main direction of swipe
function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
    if (isImageLightboxOpen) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < swipeThreshold) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
            goHorizontal(currentHIndexByLayer[currentVIndex] + 1);
        } else {
            goHorizontal(currentHIndexByLayer[currentVIndex] - 1);
        }
        return;
    }

    if (deltaY < 0) {
        if (currentVIndex === lastVIndex) {
            revealFooter();
            return;
        }
        goVertical(currentVIndex + 1);
    } else {
        if (isFooterRevealed) {
            hideFooter();
            return;
        }
        goVertical(currentVIndex - 1);
    }
}

// Initialization: generate dots, set initial position, and bind event listeners

createDots();
updateViewportPosition();
window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeyDown);
verticalDotsContainer.addEventListener("click", handleVerticalDotClick);
horizontalDotsContainer.addEventListener("click", handleHorizontalDotClick);
viewport.addEventListener("click", handleHorizontalActionClick);
viewport.addEventListener("click", handleLightboxClick);
imageLightbox.addEventListener("click", handleLightboxClick);
viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
viewport.addEventListener("touchend", handleTouchEnd, { passive: true });