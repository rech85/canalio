document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // --- Calculator Logic ---
    const planSelect = document.getElementById('plan-select');
    const skuInput = document.getElementById('sku-input');
    const salesInput = document.getElementById('sales-input');
    
    const finalRateEl = document.getElementById('final-rate');
    const finalCostEl = document.getElementById('final-cost');
    const volumeMsgEl = document.getElementById('volume-msg');
    const skuMsgEl = document.getElementById('sku-msg');
    const largeOrgMsg = document.getElementById('large-org-msg');
    const resultCard = document.querySelector('.result-card');

    function calculate() {
        const sales = parseFloat(salesInput.value) || 0;
        const skus = parseInt(skuInput.value) || 0;
        const plan = planSelect.value;
        
        let baseRate = 0.07;
        if (plan === 'complete') baseRate = 0.095;
        if (plan === 'premium') baseRate = 0.12;

        // 1. Volume Discount (applies to commission rate)
        let discountPercent = 0;
        if (sales > 500000) discountPercent = 0.15;
        else if (sales > 200000) discountPercent = 0.10;
        else if (sales > 100000) discountPercent = 0.075;
        else if (sales > 50000) discountPercent = 0.05;

        // Apply discount to base rate
        // e.g. 7% * (1 - 0.05) = 6.65%
        let discountedRate = baseRate * (1 - discountPercent);

        // Update Volume Message
        if (discountPercent > 0) {
            volumeMsgEl.textContent = `¡Felicidades! Tienes un descuento del ${(discountPercent * 100)}% en tu comisión.`;
            volumeMsgEl.classList.remove('hidden');
        } else {
            volumeMsgEl.textContent = '';
            volumeMsgEl.classList.add('hidden');
        }

        // 2. SKU Surcharge (applies to cost)
        let surchargePercent = 0;
        if (skus > 100) surchargePercent = 0.10;
        else if (skus > 20) surchargePercent = 0.05;

        // Update SKU Message
        if (skus > 200) {
            // Special Case
            largeOrgMsg.classList.remove('hidden');
            // We might still calculate a theoretical cost or hide it.
            // Requirement says "mostrar mensaje".
            // We will blur the cost or text.
            finalCostEl.textContent = "Cotizar";
            finalRateEl.textContent = "Personalizado";
            return; 
        } else {
            largeOrgMsg.classList.add('hidden');
        }

        if (surchargePercent > 0) {
            skuMsgEl.textContent = `Catálogo extenso: +${(surchargePercent * 100)}% al costo operativo.`;
        } else {
            skuMsgEl.textContent = '';
        }

        // 3. Final Calculation
        // Cost = (Sales * DiscountedRate) * (1 + Surcharge)
        let estimatedCost = (sales * discountedRate) * (1 + surchargePercent);
        
        // Effective Rate Displayed
        // (Cost / Sales) * 100
        let displayRate = 0;
        if (sales > 0) {
            displayRate = (estimatedCost / sales) * 100;
        } else {
            // just show base discounted * surcharge
            displayRate = (discountedRate * (1 + surchargePercent)) * 100;
        }

        // Format
        const formatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        finalCostEl.textContent = formatter.format(estimatedCost);
        finalRateEl.textContent = displayRate.toFixed(2) + '%';
    }

    // Event Listeners
    const inputs = [planSelect, skuInput, salesInput];
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    });

    // Init
    calculate();

    // --- Animations on Scroll ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.pricing-card, .step-card, .feature-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styling dynamically via JS or implied in CSS
    // Let's add the trigger in CSS or just handle it here inline for simplicity
    // But CSS is cleaner. I'll inject a small style rule for .visible
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

});
