document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const chartImage = document.getElementById('chart-image');
    const yearSlider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');

    // 1. Setup Intersection Observer for Scrollytelling
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Triggers when the text box is in the middle 20% of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all steps
                steps.forEach(step => step.classList.remove('is-active'));
                
                // Add active class to current step
                entry.target.classList.add('is-active');

                // Change the placeholder image smoothly
                const newImgSrc = entry.target.getAttribute('data-image');
                if (chartImage.src !== newImgSrc) {
                    chartImage.style.opacity = 0; // Fade out
                    setTimeout(() => {
                        chartImage.src = newImgSrc;
                        chartImage.style.opacity = 1; // Fade in
                    }, 300);
                }
            }
        });
    }, observerOptions);

    // Observe all text steps
    steps.forEach(step => observer.observe(step));

    // 2. Dummy interactivity for the timeline slider placeholder
    yearSlider.addEventListener('input', (e) => {
        yearDisplay.textContent = e.target.value;
        console.log("Future D3.js filter trigger for year:", e.target.value);
    });
});
