/*
    处理页面的滚动和翻页逻辑，支持鼠标滚轮、键盘箭头、点击 dot 和移动端手势等多种交互方式
*/

const viewport = document.getElementById("viewport");
const vTrack = document.getElementById("vTrack");
const verticalPages = [...document.querySelectorAll(".v-page")];
const horizontalDotsContainer = document.getElementById("horizontalDots");
const verticalDotsContainer = document.getElementById("verticalDots");
const teamFooter = document.getElementById("teamFooter");

let currentVIndex = 0;
const currentHIndexByLayer = verticalPages.map(() => 0);
const lastVIndex = verticalPages.length - 1;
const footerRevealHeightVh = 10;
let isFooterRevealed = false;

let isTransitioning = false;
const transitionDuration = 560;
// dot 的默认提示文本
const defaultLabel = "请输入文本";

// 可在这里按层/按页定义标签文本
const verticalLabels = ["Cover", "Gender", "Country & GDP", "Special Case", "Summary"];
// 每个纵向层对应一个数组，数组元素依次对应该层的横向页标签
// 写"null"则不显示标签
const horizontalLabelsByLayer = [
    ["null"],
    ["null"],
    ["Map", "Bar Chart"],
    ["Special Case"],
    ["null"]
];

// 将 label 标准化；返回 null 表示不显示标签
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

// 统一在动画期间加锁，避免连续触发导致跳页错乱
function lockTransition() {
    isTransitioning = true;
    window.setTimeout(() => {
        isTransitioning = false;
    }, transitionDuration);
}

// 纵向切换：整屏吸附到指定层
function goVertical(nextIndex) {
    if (isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= verticalPages.length) return;

    currentVIndex = nextIndex;
    isFooterRevealed = false;
    updateViewportPosition();
    renderHorizontalDots();
    updateDots();
    lockTransition();
}

// 横向切换：仅在当前层内左右翻页
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

function handleWheel(event) {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 6) return;

    if (event.deltaY > 0) {
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

function handleKeyDown(event) {
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

// 点击右侧 dot 直接切换到对应纵向层
function handleVerticalDotClick(event) {
    const targetDot = event.target.closest(".dot");
    if (!targetDot) return;
    goVertical(Number(targetDot.dataset.index));
}

// 点击底部 dot 切换当前层中的横向页
function handleHorizontalDotClick(event) {
    const targetDot = event.target.closest(".dot");
    if (!targetDot) return;
    goHorizontal(Number(targetDot.dataset.index));
}

// 页面内按钮也可以触发横向翻页，避免只依赖手势提示。
function handleHorizontalActionClick(event) {
    const trigger = event.target.closest("[data-horizontal-target]");
    if (!trigger) return;

    const nextIndex = Number(trigger.dataset.horizontalTarget);
    if (Number.isNaN(nextIndex)) return;

    goHorizontal(nextIndex);
}

// 移动端/平板手势：按滑动主方向决定纵向或横向翻页
function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
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

createDots();
updateViewportPosition();
window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeyDown);
verticalDotsContainer.addEventListener("click", handleVerticalDotClick);
horizontalDotsContainer.addEventListener("click", handleHorizontalDotClick);
viewport.addEventListener("click", handleHorizontalActionClick);
viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
