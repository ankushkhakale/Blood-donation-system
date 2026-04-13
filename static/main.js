// Auto-dismiss flash messages after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
    const flashes = document.querySelectorAll('.flash');
    flashes.forEach(f => {
        setTimeout(() => {
            f.style.opacity = '0';
            f.style.transform = 'translateX(20px)';
            f.style.transition = 'all 0.4s ease';
            setTimeout(() => f.remove(), 400);
        }, 5000);
    });

    // Animate stat numbers on landing page
    const counters = document.querySelectorAll('.h-stat-num[data-target]');
    counters.forEach(el => {
        const target = parseInt(el.dataset.target || el.textContent, 10);
        if (isNaN(target) || target === 0) return;
        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) clearInterval(interval);
        }, 40);
    });

    // Confirmation for destructive actions
    document.querySelectorAll('form[data-confirm]').forEach(form => {
        form.addEventListener('submit', e => {
            if (!confirm(form.dataset.confirm)) e.preventDefault();
        });
    });
});
