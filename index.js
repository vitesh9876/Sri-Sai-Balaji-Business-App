// State management for default values
const state = {
    goldPrice22K: 13195,  // Standard 22K Gold per Gram in Vijayawada
    silverPrice: 216.50,  // Silver price per gram in Vijayawada
    goldPrice24K: 13849,
    goldPrice18K: 10795
};

// Historical Data for Gold (22K) & Silver over last 7 days in Vijayawada
const historicalData = {
    labels: ['23 Jun', '24 Jun', '25 Jun', '26 Jun', '27 Jun', '28 Jun', 'Today'],
    gold22K: [12980, 13020, 13080, 13110, 13150, 13195, 13195],
    silver: [211.2, 212.5, 213.8, 215.1, 216.0, 216.2, 216.5]
};

let trendsChart = null;

// Initialize elements and event listeners
document.addEventListener('DOMContentLoaded', () => {
    initGlobalAdminGate();
    initClock();
    initNavigation();
    initPriceSync();
    initInterestCalc();
    initLoanPredictor();
    initHistoricalChart();
    initItemPricePredictor();
    initThemeToggle();
    
    // Simulate live updating rates from market feed (runs every 1 second)
    setInterval(simulateLiveRates, 1000);
});

// Global Admin Authentication Gate
function initGlobalAdminGate() {
    const loginGate = document.getElementById('admin-login-gate');
    const passcodeInp = document.getElementById('gate-passcode');
    const loginBtn = document.getElementById('btn-gate-login');
    const logoutBtn = document.getElementById('sidebar-logout-btn');

    function checkAuth() {
        const loggedIn = localStorage.getItem('furniture_admin_logged') === 'true';
        if (loggedIn) {
            loginGate.style.display = 'none';
        } else {
            loginGate.style.display = 'flex';
        }
    }

    loginBtn.addEventListener('click', () => {
        if (passcodeInp.value === '1234') {
            localStorage.setItem('furniture_admin_logged', 'true');
            passcodeInp.value = '';
            checkAuth();
            location.reload(); // reload to ensure all admin states are refreshed
        } else {
            alert('Incorrect Admin Passcode! Access Denied.');
        }
    });

    passcodeInp.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.setItem('furniture_admin_logged', 'false');
        location.reload();
    });

    checkAuth();
}

// Theme Switcher Initialization
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const textNode = toggleBtn.querySelector('.theme-toggle-text');
    const iconNode = toggleBtn.querySelector('.theme-toggle-icon');

    // Read stored preference (default: dark)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        textNode.textContent = 'Dark Theme';
        iconNode.textContent = '🌙';
    } else {
        document.body.classList.remove('light-theme');
        textNode.textContent = 'Light Theme';
        iconNode.textContent = '☀️';
    }

    toggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) {
            localStorage.setItem('theme', 'light');
            textNode.textContent = 'Dark Theme';
            iconNode.textContent = '🌙';
        } else {
            localStorage.setItem('theme', 'dark');
            textNode.textContent = 'Light Theme';
            iconNode.textContent = '☀️';
        }
        
        // Redraw historical chart for updated grid color palettes
        if (trendsChart) {
            const isLightActive = document.body.classList.contains('light-theme');
            const gridColor = isLightActive ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
            const textColor = isLightActive ? '#636366' : '#A0A0AB';
            const labelColor = isLightActive ? '#000000' : '#FFFFFF';
            
            trendsChart.options.scales.x.grid.color = gridColor;
            trendsChart.options.scales.yGold.grid.color = gridColor;
            trendsChart.options.scales.x.ticks.color = textColor;
            trendsChart.options.scales.yGold.ticks.color = textColor;
            trendsChart.options.scales.ySilver.ticks.color = textColor;
            trendsChart.options.plugins.legend.labels.color = labelColor;
            trendsChart.update();
        }
    });
}

// Mock simulation of live market feed updates
function simulateLiveRates() {
    // Fluctuate gold rate randomly between -₹15 and +₹15
    const goldDelta = Math.floor(Math.random() * 31) - 15;
    state.goldPrice22K = Math.max(8000, state.goldPrice22K + goldDelta);
    state.goldPrice24K = Math.round(state.goldPrice22K * (24/22));
    state.goldPrice18K = Math.round(state.goldPrice22K * (18/22));

    // Fluctuate silver rate randomly between -₹0.50 and +₹0.50
    const silverDelta = (Math.random() * 1.0) - 0.50;
    state.silverPrice = Math.max(100, state.silverPrice + silverDelta);

    // Update historical chart's last data point (today's live price)
    if (trendsChart) {
        trendsChart.data.datasets[0].data[trendsChart.data.datasets[0].data.length - 1] = state.goldPrice22K;
        trendsChart.data.datasets[1].data[trendsChart.data.datasets[1].data.length - 1] = state.silverPrice;
        trendsChart.update('none'); // silent update without layout transitions
    }

    // Refresh UI components with updated values
    syncPriceValuesToUI();
}

// Global update callback
function syncPriceValuesToUI() {
    // Topbar
    document.getElementById('header-gold-rate').textContent = `₹${state.goldPrice22K}/g`;
    document.getElementById('header-silver-rate').textContent = `₹${state.silverPrice.toFixed(2)}/g`;

    // Dashboard Live rates
    document.getElementById('gold-22k-rate').textContent = state.goldPrice22K.toLocaleString('en-IN');
    document.getElementById('gold-24k-rate').textContent = state.goldPrice24K.toLocaleString('en-IN');
    document.getElementById('silver-rate').textContent = state.silverPrice.toFixed(2);



    // Table prices tab
    document.getElementById('det-gold-24k-1').textContent = `₹${state.goldPrice24K.toLocaleString('en-IN')}`;
    document.getElementById('det-gold-24k-8').textContent = `₹${(state.goldPrice24K * 8).toLocaleString('en-IN')}`;
    document.getElementById('det-gold-22k-1').textContent = `₹${state.goldPrice22K.toLocaleString('en-IN')}`;
    document.getElementById('det-gold-22k-8').textContent = `₹${(state.goldPrice22K * 8).toLocaleString('en-IN')}`;
    document.getElementById('det-gold-18k-1').textContent = `₹${state.goldPrice18K.toLocaleString('en-IN')}`;
    document.getElementById('det-gold-18k-8').textContent = `₹${(state.goldPrice18K * 8).toLocaleString('en-IN')}`;

    document.getElementById('det-silver-1').textContent = `₹${state.silverPrice.toFixed(2)}`;
    document.getElementById('det-silver-10').textContent = `₹${(state.silverPrice * 10).toFixed(2)}`;
    document.getElementById('det-silver-100').textContent = `₹${(state.silverPrice * 100).toFixed(2)}`;
    document.getElementById('det-silver-kg').textContent = `₹${(state.silverPrice * 1000).toLocaleString('en-IN')}`;
}

// Real-time Clock in Header
function initClock() {
    const timeDisplay = document.getElementById('current-time-display');
    const updateClock = () => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) + ' (Andhra Pradesh)';
    };
    updateClock();
    setInterval(updateClock, 1000);
}

// Sidebar Tab switching logic
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');

            // Deactivate existing tabs/nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            // Activate current tab/nav item
            item.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');

            // Toggle topbar rates and welcome-text visibility based on current active tab (hidden outside welcome on mobile)
            const topbarRates = document.querySelector('.live-rates-summary');
            const welcomeText = document.querySelector('.welcome-text');
            if (tabId === 'welcome') {
                if (topbarRates) topbarRates.classList.remove('hide-on-mobile');
                if (welcomeText) welcomeText.classList.remove('hide-on-mobile');
            } else {
                if (topbarRates) topbarRates.classList.add('hide-on-mobile');
                if (welcomeText) welcomeText.classList.add('hide-on-mobile');
            }

            // Redraw chart if tab matches detailed prices
            if (tabId === 'prices' && trendsChart) {
                setTimeout(() => trendsChart.resize(), 100);
            }
        });
    });
}

// Sync values globally across different views
function initPriceSync() {
    // Form settings override action
    const btnOverride = document.getElementById('btn-update-rates');
    btnOverride.addEventListener('click', () => {
        const goldVal = parseInt(document.getElementById('admin-gold-override').value);
        const silverVal = parseFloat(document.getElementById('admin-silver-override').value);

        if (goldVal && goldVal > 0) {
            state.goldPrice22K = goldVal;
            state.goldPrice24K = Math.round(state.goldPrice22K * (24/22));
            state.goldPrice18K = Math.round(state.goldPrice22K * (18/22));
        }
        if (silverVal && silverVal > 0) state.silverPrice = silverVal;

        syncPriceValuesToUI();
        // Update historical chart's last data point (today's live price)
        if (trendsChart) {
            trendsChart.data.datasets[0].data[trendsChart.data.datasets[0].data.length - 1] = state.goldPrice22K;
            trendsChart.data.datasets[1].data[trendsChart.data.datasets[1].data.length - 1] = state.silverPrice;
            trendsChart.update();
        }
        alert('Live and default panel rates have been updated successfully!');
    });

    // Populate initial inputs
    syncPriceValuesToUI();
}

// LOAN INTEREST CALCULATOR LOGIC
function initInterestCalc() {
    // Current Active Date Variables
    let dateTakenVal = new Date();
    dateTakenVal.setMonth(dateTakenVal.getMonth() - 1); // default: 1 month ago
    let dateSettlementVal = new Date(); // default: today

    let activePickingTarget = null; // 'start' or 'end'

    const btnStartDisplay = document.getElementById('btn-picker-date-taken');
    const btnEndDisplay = document.getElementById('btn-picker-date-settlement');

    const modalOverlay = document.getElementById('picker-modal-taken'); // Fallback default to prevent errors
    const modalTitle = document.createElement('div'); // Mock to prevent title element selection failure
    const btnCloseModal = document.getElementById('btn-close-modal-taken');
    const btnConfirmPicker = document.getElementById('btn-confirm-taken');

    const scrollerDay = document.getElementById('scroller-taken-day');
    const scrollerMonth = document.getElementById('scroller-taken-month');
    const scrollerYear = document.getElementById('scroller-taken-year');

    const viewportDay = scrollerDay.parentElement;
    const viewportMonth = scrollerMonth.parentElement;
    const viewportYear = scrollerYear.parentElement;

    const monthsList = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Selected variables inside picker
    let curSelectedDay = 1;
    let curSelectedMonth = 0;
    let curSelectedYear = new Date().getFullYear();

    // Populate Wheel item lists
    const currentYear = new Date().getFullYear();
    const yearsArr = [];
    for (let y = currentYear - 10; y <= currentYear + 5; y++) {
        yearsArr.push(y);
    }

    const daysArr = [];
    for (let d = 1; d <= 31; d++) {
        daysArr.push(d);
    }

    // Build DOM elements for scroller columns
    function buildScrollerItems(container, itemsArray, type) {
        container.innerHTML = "";
        itemsArray.forEach(item => {
            const div = document.createElement('div');
            div.className = 'wheel-item';
            div.dataset.value = item;
            
            if (type === 'month') {
                div.textContent = monthsList[item];
            } else if (type === 'day') {
                div.textContent = String(item).padStart(2, '0');
            } else {
                div.textContent = item;
            }

            container.appendChild(div);
        });
    }

    buildScrollerItems(scrollerDay, daysArr, 'day');
    buildScrollerItems(scrollerMonth, [0,1,2,3,4,5,6,7,8,9,10,11], 'month');
    buildScrollerItems(scrollerYear, yearsArr, 'year');

    // Attach drag tracking and scrollwheel behavior to viewports for snapping feedback
    function setupViewportScrollTracker(viewport, scroller, type, onSelect) {
        const itemHeight = 40;

        const updateSelection = () => {
            const scrollTop = viewport.scrollTop;
            const selectedIdx = Math.round(scrollTop / itemHeight);
            
            const items = scroller.querySelectorAll('.wheel-item');
            if (items.length > 0 && selectedIdx >= 0 && selectedIdx < items.length) {
                items.forEach(it => it.classList.remove('selected'));
                const selectedItem = items[selectedIdx];
                selectedItem.classList.add('selected');
                
                const val = parseInt(selectedItem.dataset.value);
                onSelect(val);
            }
        };

        // Handle Wheel Events: 1 tick = exactly 1 item up or down
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault(); // Prevent default fast scroll
            const direction = e.deltaY > 0 ? 1 : -1;
            const targetScrollTop = viewport.scrollTop + (direction * itemHeight);
            const maxScroll = scroller.offsetHeight - viewport.clientHeight;
            
            viewport.scrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop));
            updateSelection();
        }, { passive: false });

        // Add Drag and Swipe functionality (Mouse + Touch)
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;

        const startDrag = (y) => {
            isDragging = true;
            startY = y;
            startScrollTop = viewport.scrollTop;
            viewport.style.scrollBehavior = 'auto'; // Disable transitions during drag
        };

        const moveDrag = (y) => {
            if (!isDragging) return;
            const deltaY = startY - y;
            viewport.scrollTop = startScrollTop + deltaY;
            updateSelection();
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            viewport.style.scrollBehavior = 'smooth';
            // Snap to nearest item height offset boundary
            const exactIdx = Math.round(viewport.scrollTop / itemHeight);
            viewport.scrollTop = exactIdx * itemHeight;
            
            // Sync final snapped index selection state
            const items = scroller.querySelectorAll('.wheel-item');
            if (items.length > 0 && exactIdx >= 0 && exactIdx < items.length) {
                items.forEach(it => it.classList.remove('selected'));
                const selectedItem = items[exactIdx];
                selectedItem.classList.add('selected');
                const val = parseInt(selectedItem.dataset.value);
                onSelect(val);
            }
        };

        // Mouse listeners
        viewport.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag(e.clientY);
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                moveDrag(e.clientY);
            }
        });
        window.addEventListener('mouseup', stopDrag);

        // Touch listeners
        viewport.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });
        viewport.addEventListener('touchmove', (e) => {
            if (isDragging) {
                moveDrag(e.touches[0].clientY);
            }
        }, { passive: true });
        viewport.addEventListener('touchend', stopDrag);

        // Click selection helper
        scroller.addEventListener('click', (e) => {
            if (e.target.classList.contains('wheel-item') && !isDragging) {
                const items = Array.from(scroller.querySelectorAll('.wheel-item'));
                const clickedIdx = items.indexOf(e.target);
                viewport.style.scrollBehavior = 'smooth';
                viewport.scrollTop = clickedIdx * itemHeight;
                updateSelection();
            }
        });
    }

    setupViewportScrollTracker(viewportDay, scrollerDay, 'day', (val) => { curSelectedDay = val; });
    setupViewportScrollTracker(viewportMonth, scrollerMonth, 'month', (val) => { curSelectedMonth = val; });
    setupViewportScrollTracker(viewportYear, scrollerYear, 'year', (val) => { curSelectedYear = val; });

    // Initialize separate settlement picker scroll viewport drag/wheel handlers
    const vDayS = document.getElementById('wheel-settlement-day');
    const sDayS = document.getElementById('scroller-settlement-day');
    const vMonthS = document.getElementById('wheel-settlement-month');
    const sMonthS = document.getElementById('scroller-settlement-month');
    const vYearS = document.getElementById('wheel-settlement-year');
    const sYearS = document.getElementById('scroller-settlement-year');

    buildScrollerItems(sDayS, daysArr, 'day');
    buildScrollerItems(sMonthS, [0,1,2,3,4,5,6,7,8,9,10,11], 'month');
    buildScrollerItems(sYearS, yearsArr, 'year');

    setupViewportScrollTracker(vDayS, sDayS, 'day', (val) => { curSelectedDay = val; });
    setupViewportScrollTracker(vMonthS, sMonthS, 'month', (val) => { curSelectedMonth = val; });
    setupViewportScrollTracker(vYearS, sYearS, 'year', (val) => { curSelectedYear = val; });

    // Position wheel viewport helper
    const scrollWheelToValue = (viewport, scroller, value) => {
        const itemHeight = 40;
        const items = Array.from(scroller.querySelectorAll('.wheel-item'));
        const targetIdx = items.findIndex(it => parseInt(it.dataset.value) === value);
        if (targetIdx !== -1) {
            // Position centering frame update
            setTimeout(() => {
                viewport.style.scrollBehavior = 'auto';
                viewport.scrollTop = targetIdx * itemHeight;
                items.forEach(it => it.classList.remove('selected'));
                items[targetIdx].classList.add('selected');
            }, 50);
        }
    };

    // Helper to format date label
    const formatDateDisplay = (date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = monthsList[date.getMonth()];
        const y = date.getFullYear();
        return `${d} - ${m} - ${y}`;
    };

    // Update display buttons text
    const updateDisplayLabels = () => {
        btnStartDisplay.textContent = formatDateDisplay(dateTakenVal);
        btnEndDisplay.textContent = formatDateDisplay(dateSettlementVal);
    };

    updateDisplayLabels();

    // Show modal picker functions
    const openDatePickerModal = (target) => {
        activePickingTarget = target;
        
        const activeModal = target === 'start' ? document.getElementById('picker-modal-taken') : document.getElementById('picker-modal-settlement');
        const referenceDate = target === 'start' ? dateTakenVal : dateSettlementVal;

        curSelectedDay = referenceDate.getDate();
        curSelectedMonth = referenceDate.getMonth();
        curSelectedYear = referenceDate.getFullYear();

        activeModal.classList.add('active');

        // Scroll wheels to center active selections
        if (target === 'start') {
            scrollWheelToValue(viewportDay, scrollerDay, curSelectedDay);
            scrollWheelToValue(viewportMonth, scrollerMonth, curSelectedMonth);
            scrollWheelToValue(viewportYear, scrollerYear, curSelectedYear);
        } else {
            const vDayS = document.getElementById('wheel-settlement-day');
            const sDayS = document.getElementById('scroller-settlement-day');
            const vMonthS = document.getElementById('wheel-settlement-month');
            const sMonthS = document.getElementById('scroller-settlement-month');
            const vYearS = document.getElementById('wheel-settlement-year');
            const sYearS = document.getElementById('scroller-settlement-year');
            scrollWheelToValue(vDayS, sDayS, curSelectedDay);
            scrollWheelToValue(vMonthS, sMonthS, curSelectedMonth);
            scrollWheelToValue(vYearS, sYearS, curSelectedYear);
        }
    };

    btnStartDisplay.addEventListener('click', () => openDatePickerModal('start'));
    btnEndDisplay.addEventListener('click', () => openDatePickerModal('end'));

    // Close modal helper
    const closeModal = () => {
        document.getElementById('picker-modal-taken').classList.remove('active');
        document.getElementById('picker-modal-settlement').classList.remove('active');
        activePickingTarget = null;
    };

    document.getElementById('btn-close-modal-taken').addEventListener('click', closeModal);
    document.getElementById('btn-close-modal-settlement').addEventListener('click', closeModal);

    // Confirm choice buttons for separate modals
    document.getElementById('btn-confirm-taken').addEventListener('click', () => {
        const selectedDate = new Date(curSelectedYear, curSelectedMonth, curSelectedDay);
        dateTakenVal = selectedDate;
        updateDisplayLabels();
        closeModal();
    });

    document.getElementById('btn-confirm-settlement').addEventListener('click', () => {
        const selectedDate = new Date(curSelectedYear, curSelectedMonth, curSelectedDay);
        dateSettlementVal = selectedDate;
        updateDisplayLabels();
        closeModal();
    });

    // Event listener for calculations
    const btnCalc = document.getElementById('btn-calc-interest');
    btnCalc.addEventListener('click', () => {
        const metal = document.querySelector('input[name="calc-metal"]:checked').value;
        const amount = parseFloat(document.getElementById('calc-amount').value);

        if (!amount || amount <= 0) {
            alert('Please enter a valid loan amount.');
            return;
        }

        if (dateSettlementVal < dateTakenVal) {
            alert('Settlement date cannot be before the date taken.');
            return;
        }

        calculateLoanInterest(metal, amount, dateTakenVal, dateSettlementVal);
    });
}

function calculateLoanInterest(metal, amount, startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Compounding variables
    let currentPrincipal = amount;
    let accumulatedInterest = 0;
    
    // Construct transaction history log
    let compoundingLog = [];
    
    // Total years elapsed
    const totalYears = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;

    // Standard rate selection
    // Gold: rate below 8000 is 3%, rate 8000+ is 2%
    // Silver: rate is 5%
    const getMonthlyRate = (principalAmt) => {
        if (metal === 'gold') {
            return principalAmt < 8000 ? 0.03 : 0.02;
        } else {
            return 0.05;
        }
    };

    // Calculate year-by-year compounding
    for (let yr = 1; yr <= totalYears; yr++) {
        // Full year (12 months)
        const rate = getMonthlyRate(currentPrincipal);
        const yearlyInterest = currentPrincipal * rate * 12;
        
        compoundingLog.push({
            event: `Year ${yr} Mark`,
            basePrincipal: Math.round(currentPrincipal),
            interestEarned: Math.round(yearlyInterest),
            monthlyRatePercent: (rate * 100).toFixed(0) + '%'
        });

        // Add interest to principal for compounding
        currentPrincipal += yearlyInterest;
    }

    // Now calculate the final fractional months for the remaining days in the last year
    // Convert remaining days to fractional months
    let monthsFraction = remainingDays / 30.416; // average days in month
    let fullMonths = Math.floor(monthsFraction);
    let extraDaysFraction = remainingDays % 30.416;

    // Fractional month rounding logic:
    // 10 to 19 days -> half month (+0.5)
    // 20+ days -> full month (+1.0)
    let addedMonthFraction = 0;
    if (extraDaysFraction >= 20) {
        addedMonthFraction = 1.0;
    } else if (extraDaysFraction >= 10 && extraDaysFraction <= 19) {
        addedMonthFraction = 0.5;
    } // Under 10 days doesn't add to the half/full mark (remains 0)

    const totalFractionalMonths = fullMonths + addedMonthFraction;
    const finalRate = getMonthlyRate(currentPrincipal);
    const fractionalInterest = currentPrincipal * finalRate * totalFractionalMonths;

    if (totalFractionalMonths > 0) {
        compoundingLog.push({
            event: `Settlement Frame`,
            basePrincipal: Math.round(currentPrincipal),
            interestEarned: Math.round(fractionalInterest),
            monthlyRatePercent: (finalRate * 100).toFixed(0) + '%',
            durationText: `${fullMonths} months, ${Math.round(extraDaysFraction)} days (rounded to ${totalFractionalMonths} months)`
        });
    }

    const totalFinalPayable = currentPrincipal + fractionalInterest;
    const totalInterestGained = totalFinalPayable - amount;

    // Display statement panel
    const resultPanel = document.getElementById('interest-result-panel');
    let timelineHTML = '';
    
    compoundingLog.forEach(log => {
        timelineHTML += `
            <li>
                <strong>${log.event}:</strong> Base Principal: ₹${log.basePrincipal.toLocaleString('en-IN')}, 
                Interest added: ₹${log.interestEarned.toLocaleString('en-IN')} (at ${log.monthlyRatePercent}/mo)
                ${log.durationText ? `<br><small>Time: ${log.durationText}</small>` : ''}
            </li>
        `;
    });

    if (compoundingLog.length === 0) {
        timelineHTML = `<li>No timeline logs (loan settled same day).</li>`;
    }

    resultPanel.innerHTML = `
        <div class="statement-card">
            <h3 class="statement-title">Loan Settlement Statement</h3>
            <div class="statement-grid">
                <div class="statement-item">
                    <span class="label">Initial Loan Principal</span>
                    <span class="value">₹${amount.toLocaleString('en-IN')}</span>
                </div>
                <div class="statement-item">
                    <span class="label">Total Duration</span>
                    <span class="value">${totalDays} days</span>
                </div>
                <div class="statement-item">
                    <span class="label">Total Interest Accrued</span>
                    <span class="value" style="color: var(--accent-gold);">₹${Math.round(totalInterestGained).toLocaleString('en-IN')}</span>
                </div>
                <div class="statement-item total-payable">
                    <span class="label">Settlement Amount</span>
                    <span class="value">₹${Math.round(totalFinalPayable).toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <div class="statement-timeline">
                <div class="timeline-title">Compounding Timeline Details</div>
                <ul class="timeline-list">
                    ${timelineHTML}
                </ul>
            </div>
        </div>
    `;
}

// LOAN ELIGIBILITY PREDICTOR
function initLoanPredictor() {
    const btnPredict = document.getElementById('btn-predict-loan');
    btnPredict.addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('pred-weight').value);
        const rate = parseFloat(document.getElementById('pred-rate').value);
        const cutoff = 60; // Hardcoded default cutoff rule

        if (!weight || weight <= 0) {
            alert('Please specify the gold weight.');
            return;
        }
        if (!rate || rate <= 0) {
            alert('Please specify the gold price.');
            return;
        }

        const totalMarketValue = weight * rate;
        const eligibleLoan = totalMarketValue * (cutoff / 100);

        const resultCard = document.getElementById('pred-result-card');
        resultCard.innerHTML = `
            <div class="statement-card">
                <h3 class="statement-title">Loan Eligibility Statement</h3>
                <div class="statement-grid">
                    <div class="statement-item">
                        <span class="label">Gold Weight</span>
                        <span class="value">${weight.toFixed(3)} grams</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Assessment Price</span>
                        <span class="value">₹${rate.toLocaleString('en-IN')}/g</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Market Value</span>
                        <span class="value">₹${Math.round(totalMarketValue).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="statement-item total-payable">
                        <span class="label">Max Loan Offer (${cutoff}%)</span>
                        <span class="value">₹${Math.round(eligibleLoan).toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div class="info-alert" style="margin-top: 1rem; padding: 0.8rem;">
                    <p style="font-size: 0.8rem; color: var(--text-muted);">This offer is simulated under the standard 60% risk buffer and custom rates in Vijayawada.</p>
                </div>
            </div>
        `;
    });
}

// HISTORICAL CHART (DETAILED PRICES)
function initHistoricalChart() {
    const ctx = document.getElementById('metalTrendsChart').getContext('2d');
    const isLightActive = document.body.classList.contains('light-theme');
    const gridColor = isLightActive ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    const textColor = isLightActive ? '#636366' : '#A0A0AB';
    const labelColor = isLightActive ? '#000000' : '#FFFFFF';
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.labels,
            datasets: [
                {
                    label: 'Gold (22K) Rate per Gram (₹)',
                    data: historicalData.gold22K,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'yGold'
                },
                {
                    label: 'Silver Rate per Gram (₹)',
                    data: historicalData.silver,
                    borderColor: '#A8A9AD',
                    backgroundColor: 'rgba(168, 169, 173, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'ySilver'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yGold: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Gold Rate (₹)',
                        color: '#D4AF37'
                    },
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                ySilver: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Silver Rate (₹)',
                        color: '#A8A9AD'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: labelColor
                    }
                }
            }
        }
    });
}

// ITEMS RETAIL PRICE CALCULATOR
function initItemPricePredictor() {
    // Initial catalog of products (stored in local storage to support custom CRUD persistent entries)
    const defaultCatalog = [
        {
            id: 'furn-001',
            name: 'Royal Teak Wood Sofa (3-Seater)',
            description: 'Premium grade Burma teak wood with velvet cushioning and hand-crafted designs.',
            originalPrice: 42000,
            discountedPrice: 58000,
            mrp: 75000,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'furn-002',
            name: 'Teak Wood Dining Table Set (6-Seater)',
            description: 'Solid teak wood dining table with 6 cushioned chairs, polished finish.',
            originalPrice: 32000,
            discountedPrice: 46000,
            mrp: 60000,
            image: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'furn-003',
            name: 'Solid Teak Wood Wardrobe (3-Door)',
            description: 'Spacious Burma teak wardrobe with multiple drawers, locks, and inner mirror.',
            originalPrice: 55000,
            discountedPrice: 72000,
            mrp: 95000,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=400'
        }
    ];

    // Load or initialize catalog database with Supabase cloud database
    let catalog = [];
    let supabaseUrl = '';
    let supabaseKey = '';
    
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL_HERE') {
        supabaseUrl = window.SUPABASE_CONFIG.url;
        supabaseKey = window.SUPABASE_CONFIG.anonKey;
    } else {
        supabaseUrl = localStorage.getItem('supabase_url') || '';
        supabaseKey = localStorage.getItem('supabase_key') || '';
    }
    let supabaseClient = null;

    if (supabaseUrl && supabaseKey && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        } catch(e) {
            console.error("Failed to initialize Supabase client:", e);
        }
    }

    async function syncCatalogFromCloud() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('furniture_catalog')
                    .select('*')
                    .order('created_at', { ascending: true });
                
                if (error) throw error;
                if (data) {
                    catalog = data.map(item => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        originalPrice: item.original_price,
                        discountedPrice: item.discounted_price,
                        mrp: item.mrp,
                        image: item.image
                    }));
                    localStorage.setItem('furniture_catalog', JSON.stringify(catalog));
                    renderProductTable();
                    return;
                }
            } catch(e) {
                console.error("Failed to sync catalog from Supabase:", e);
            }
        }

        // Fallback to local storage loading
        catalog = JSON.parse(localStorage.getItem('furniture_catalog'));
        if (!catalog || catalog.length === 0) {
            catalog = defaultCatalog;
            localStorage.setItem('furniture_catalog', JSON.stringify(catalog));
        }
        renderProductTable();
    }

    async function saveCatalogToCloud() {
        localStorage.setItem('furniture_catalog', JSON.stringify(catalog));
        renderProductTable();

        if (supabaseClient) {
            try {
                const dbItems = catalog.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    original_price: item.originalPrice,
                    discounted_price: item.discountedPrice,
                    mrp: item.mrp,
                    image: item.image
                }));

                const { error } = await supabaseClient
                    .from('furniture_catalog')
                    .upsert(dbItems, { onConflict: 'id' });
                
                if (error) throw error;
            } catch(e) {
                console.error("Failed to save catalog to Supabase:", e);
            }
        }
    }

    // Connect form settings to Supabase
    setTimeout(() => {
        const dbUrlInp = document.getElementById('db-supabase-url');
        const dbKeyInp = document.getElementById('db-supabase-key');
        const btnSaveDb = document.getElementById('btn-save-db-settings');

        if (dbUrlInp) dbUrlInp.value = supabaseUrl;
        if (dbKeyInp) dbKeyInp.value = supabaseKey;

        if (btnSaveDb) {
            btnSaveDb.addEventListener('click', () => {
                const url = dbUrlInp.value.trim();
                const key = dbKeyInp.value.trim();
                localStorage.setItem('supabase_url', url);
                localStorage.setItem('supabase_key', key);
                alert('Supabase credentials linked successfully! Page will reload to sync.');
                location.reload();
            });
        }
    }, 100);

    // Run initial sync
    syncCatalogFromCloud();

    // Admin authentication state
    let isAdmin = localStorage.getItem('furniture_admin_logged') === 'true';

    // Elements
    const btnOpenScanner = document.getElementById('btn-open-scanner');
    const btnCloseScanner = document.getElementById('btn-close-scanner');
    const btnAdminToggle = document.getElementById('btn-admin-panel-toggle');
    const btnLoginAuth = document.getElementById('btn-login-auth');
    const btnOpenAddProduct = document.getElementById('btn-open-add-product');
    const btnCancelProduct = document.getElementById('btn-cancel-product');
    
    const scannerWrapper = document.getElementById('scanner-wrapper');
    const scanResultContainer = document.getElementById('scan-result-container');
    const adminLoginCard = document.getElementById('admin-login-card');
    const adminCatalogManager = document.getElementById('admin-catalog-manager');
    const productFormCard = document.getElementById('product-form-card');
    
    const productCrudForm = document.getElementById('product-crud-form');
    const adminProductTableBody = document.getElementById('admin-product-table-body');
    const customerScanModal = document.getElementById('customer-scan-modal');
    const btnCloseCustomerModal = document.getElementById('btn-close-customer-modal');
    const customerModalContent = document.getElementById('customer-modal-content');

    let html5QrcodeScanner = null;

    // Toggle admin management display
    function updateAdminPanelVisibility() {
        if (isAdmin) {
            btnAdminToggle.textContent = '🔓 Log Out Admin';
            adminLoginCard.style.display = 'none';
            adminCatalogManager.style.display = 'block';
        } else {
            btnAdminToggle.textContent = '🔒 Admin Dashboard';
            adminLoginCard.style.display = 'none';
            adminCatalogManager.style.display = 'none';
            productFormCard.style.display = 'none';
        }
        renderProductTable();
    }

    // Toggle button triggers passcode form or logs out
    btnAdminToggle.addEventListener('click', () => {
        if (isAdmin) {
            isAdmin = false;
            localStorage.setItem('furniture_admin_logged', 'false');
            alert('Admin logged out successfully.');
            updateAdminPanelVisibility();
        } else {
            // Toggle login card visibility
            adminLoginCard.style.display = adminLoginCard.style.display === 'none' ? 'block' : 'none';
        }
    });

    // Passcode submission check (Default Admin passcode: "1234")
    btnLoginAuth.addEventListener('click', () => {
        const passcode = document.getElementById('admin-passcode').value;
        if (passcode === '1234') {
            isAdmin = true;
            localStorage.setItem('furniture_admin_logged', 'true');
            document.getElementById('admin-passcode').value = '';
            alert('Admin access granted!');
            updateAdminPanelVisibility();
        } else {
            alert('Incorrect admin passcode! Access denied.');
        }
    });

    // Render Product Management Inventory table rows
    function renderProductTable() {
        adminProductTableBody.innerHTML = '';
        const searchInp = document.getElementById('catalog-search-input');
        const query = searchInp ? searchInp.value.toLowerCase().trim() : '';

        const filteredCatalog = catalog.filter(product => {
            if (!query) return true;
            const matchName = product.name.toLowerCase().includes(query);
            const matchId = product.id.toLowerCase().includes(query);
            const matchOriginal = product.originalPrice.toString().includes(query);
            const matchDiscounted = product.discountedPrice.toString().includes(query);
            const matchMrp = product.mrp.toString().includes(query);
            return matchName || matchId || matchOriginal || matchDiscounted || matchMrp;
        });

        filteredCatalog.forEach((product) => {
            const tr = document.createElement('tr');
            
            // Build cell containing label output
            const labelCellId = `qr-${product.id}`;
            
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${product.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${product.description}</div>
                </td>
                <td style="vertical-align: middle;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span class="secret-val" id="secret-${product.id}" data-price="₹${product.originalPrice.toLocaleString('en-IN')}" style="filter: blur(4px); cursor: pointer; user-select: none; font-weight: 600; color: #ff453a;">••••••</span>
                        <button type="button" class="btn-reveal-secret" data-id="${product.id}" style="background: none; border: none; cursor: pointer; padding: 0.2rem; font-size: 1.1rem; line-height: 1;" title="Reveal Price">👁️</button>
                    </div>
                </td>
                <td style="opacity: 0.6; font-size: 0.95rem; font-weight: 500; vertical-align: middle;">₹${product.discountedPrice.toLocaleString('en-IN')}</td>
                <td style="color: var(--accent-gold); font-weight: 700; vertical-align: middle;">₹${product.mrp.toLocaleString('en-IN')}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; background: var(--bg-tertiary); padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-color); width: fit-content; margin: 0 auto;">
                        <div id="${labelCellId}" style="padding: 0.3rem; background: #fff; display: inline-block; border-radius: 4px;"></div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace; font-weight: 600;">${product.id}</span>
                        <button type="button" class="btn btn-print-qr" data-id="${product.id}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: var(--accent-gold); color: #000; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 0.2rem;">🖨️ Print</button>
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button type="button" class="btn btn-edit" data-id="${product.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);">Edit</button>
                        <button type="button" class="btn btn-delete" data-id="${product.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: rgba(255, 69, 58, 0.15); color: #ff453a; border: 1px solid #ff453a;">Delete</button>
                    </div>
                </td>
            `;
            adminProductTableBody.appendChild(tr);

            // Generate label QR code image linked directly to search scan key matches
            setTimeout(() => {
                const element = document.getElementById(labelCellId);
                if (element) {
                    element.innerHTML = '';
                    const customerURL = window.location.origin + '/scan.html?id=' + product.id;
                    new QRCode(element, {
                        text: customerURL,
                        width: 50,
                        height: 50,
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }
            }, 50);
        });

        // Add action listeners to dynamically rendered table buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = e.currentTarget.getAttribute('data-id');
                const prod = catalog.find(item => item.id === pid);
                if (prod) {
                    document.getElementById('form-product-id').value = prod.id;
                    document.getElementById('form-product-name').value = prod.name;
                    document.getElementById('form-product-description').value = prod.description;
                    document.getElementById('form-product-original').value = prod.originalPrice;
                    document.getElementById('form-product-discounted').value = prod.discountedPrice;
                    document.getElementById('form-product-mrp').value = prod.mrp;
                    document.getElementById('form-product-image').value = prod.image;
                    
                    document.getElementById('product-form-title').textContent = 'Edit Furniture Product';
                    productFormCard.style.display = 'block';
                    productFormCard.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const pid = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this furniture item?')) {
                    catalog = catalog.filter(item => item.id !== pid);
                    saveCatalogToCloud();

                    if (supabaseClient) {
                        try {
                            const { error } = await supabaseClient
                                .from('furniture_catalog')
                                .delete()
                                .eq('id', pid);
                            if (error) throw error;
                        } catch(err) {
                            console.error("Failed to delete from Supabase:", err);
                        }
                    }
                }
            });
        });

        // Click handler to reveal secret price and auto-hide in 5 seconds
        document.querySelectorAll('.btn-reveal-secret').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = e.currentTarget.getAttribute('data-id');
                const span = document.getElementById(`secret-${pid}`);
                if (span) {
                    const price = span.getAttribute('data-price');
                    const isRevealed = span.style.filter === 'none';
                    
                    if (isRevealed) {
                        // Manually hide
                        span.textContent = '••••••';
                        span.style.filter = 'blur(4px)';
                        e.currentTarget.textContent = '👁️';
                        if (span.dataset.timerId) {
                            clearTimeout(parseInt(span.dataset.timerId));
                            delete span.dataset.timerId;
                        }
                    } else {
                        // Reveal
                        span.textContent = price;
                        span.style.filter = 'none';
                        e.currentTarget.textContent = '🙈';
                        
                        if (span.dataset.timerId) {
                            clearTimeout(parseInt(span.dataset.timerId));
                        }
                        
                        const timerId = setTimeout(() => {
                            span.textContent = '••••••';
                            span.style.filter = 'blur(4px)';
                            e.currentTarget.textContent = '👁️';
                            delete span.dataset.timerId;
                        }, 5000);
                        
                        span.dataset.timerId = timerId;
                    }
                }
            });
        });

        // Print QR code listener
        document.querySelectorAll('.btn-print-qr').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = e.currentTarget.getAttribute('data-id');
                const prod = catalog.find(item => item.id === pid);
                if (prod) {
                    const printWindow = window.open('', '_blank', 'width=450,height=450');
                    const qrContainerHtml = document.getElementById(`qr-${prod.id}`).innerHTML;
                    printWindow.document.write(`
                        <html>
                        <head>
                            <title>Print QR - ${prod.name}</title>
                            <style>
                                body {
                                    font-family: 'Inter', sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    margin: 0;
                                    text-align: center;
                                }
                                .label-card {
                                    padding: 5px;
                                    display: inline-block;
                                }
                                .shop-header {
                                    font-size: 16px;
                                    font-weight: 700;
                                    margin-bottom: 2px;
                                    letter-spacing: 1.5px;
                                    text-transform: uppercase;
                                    color: #000;
                                }
                                .qr-box {
                                    margin: 2px 0;
                                }
                                .qr-box img {
                                    display: block;
                                    margin: 0 auto;
                                    width: 150px;
                                    height: 150px;
                                }
                                .code-id {
                                    font-size: 14px;
                                    font-family: monospace;
                                    font-weight: 700;
                                    margin-top: 2px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="label-card">
                                <div class="shop-header">Sri Sai Balaji</div>
                                <div class="qr-box">${qrContainerHtml}</div>
                                <div class="code-id">CODE: ${prod.id}</div>
                            </div>
                            <script>
                                window.onload = function() {
                                    // Scale QR image in print document
                                    const img = document.querySelector('.qr-box img');
                                    if (img) {
                                        img.style.width = '150px';
                                        img.style.height = '150px';
                                    }
                                    window.print();
                                    setTimeout(() => window.close(), 500);
                                };
                            <\/script>
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                }
            });
        });
    }

    // Attach search event listener
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', renderProductTable);
    }

    // CRUD Product form submission handler
    productCrudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pid = document.getElementById('form-product-id').value;
        const name = document.getElementById('form-product-name').value;
        const desc = document.getElementById('form-product-description').value;
        const originalPrice = parseInt(document.getElementById('form-product-original').value);
        const discountedPrice = parseInt(document.getElementById('form-product-discounted').value);
        const mrp = parseInt(document.getElementById('form-product-mrp').value);
        let image = document.getElementById('form-product-image').value;

        if (!image) {
            image = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400';
        }

        if (pid) {
            // Edit existing item
            const index = catalog.findIndex(item => item.id === pid);
            if (index !== -1) {
                catalog[index] = { id: pid, name, description: desc, originalPrice, discountedPrice, mrp, image };
            }
        } else {
            // Add new item
            const newId = `furn-${Date.now()}`;
            catalog.push({ id: newId, name, description: desc, originalPrice, discountedPrice, mrp, image });
        }

        saveCatalogToCloud();
        productCrudForm.reset();
        productFormCard.style.display = 'none';
        alert('Product details saved successfully!');
    });

    btnOpenAddProduct.addEventListener('click', () => {
        document.getElementById('form-product-id').value = '';
        productCrudForm.reset();
        document.getElementById('product-form-title').textContent = 'Add New Furniture Product';
        productFormCard.style.display = 'block';
    });

    btnCancelProduct.addEventListener('click', () => {
        productFormCard.style.display = 'none';
    });

    // SCANNER HANDLERS
    btnOpenScanner.addEventListener('click', () => {
        scannerWrapper.style.display = 'block';
        scanResultContainer.style.display = 'none';
        scannerWrapper.scrollIntoView({ behavior: 'smooth' });

        // Start HTML5 Camera-based scanner
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5Qrcode("interactive-reader");
        }

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            {
                fps: 60,
                qrbox: (width, height) => {
                    const minDim = Math.min(width, height);
                    return { width: Math.floor(minDim * 0.75), height: Math.floor(minDim * 0.75) };
                },
                aspectRatio: 1.0,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            },
            onScanSuccess,
            onScanFailure
        ).catch(err => {
            alert(`Unable to open camera feed: ${err}. Defaulting to mock demo scanner!`);
            // Mock Fallback scanner options for headless testing
            const scanTargetId = prompt("Demo Scanner Fallback: Enter barcode/QR code text (e.g. furn-001):");
            if (scanTargetId) {
                onScanSuccess(scanTargetId);
            }
        });
    });

    function stopScannerFeed() {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                scannerWrapper.style.display = 'none';
            }).catch(err => console.error("Error stopping scanner feed:", err));
        } else {
            scannerWrapper.style.display = 'none';
        }
    }

    btnCloseScanner.addEventListener('click', stopScannerFeed);

    function onScanSuccess(decodedText) {
        stopScannerFeed();
        
        let resolvedId = decodedText;
        try {
            const urlObj = new URL(decodedText);
            const idParam = urlObj.searchParams.get('id');
            if (idParam) resolvedId = idParam;
        } catch(e) {
            // Not a URL, use raw string
        }
        
        // Find product matches inside catalog
        const matchProduct = catalog.find(item => item.id.trim() === resolvedId.trim());
        if (!matchProduct) {
            alert(`No matching item in catalog found for scanned key: "${decodedText}"`);
            return;
        }

        if (isAdmin) {
            // Admin scan result: reveals Secret Original Cost price
            scanResultContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.8rem; margin-bottom: 1rem;">
                    <h3 style="color: var(--accent-gold);">Scan Result (Admin Mode)</h3>
                    <button type="button" class="btn" id="btn-clear-scan" style="background: var(--bg-tertiary); padding: 0.3rem 0.8rem; font-size: 0.8rem;">Clear</button>
                </div>
                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                    <img src="${matchProduct.image}" alt="${matchProduct.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="flex: 1; min-width: 200px;">
                        <h4 style="font-size: 1.2rem; margin-bottom: 0.4rem;">${matchProduct.name}</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${matchProduct.description}</p>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                            <div>
                                <span class="label" style="font-size: 0.7rem; color: #ff453a; text-transform: uppercase; font-weight: 600;">Secret Cost</span>
                                <div style="font-size: 1.2rem; font-weight: 800; color: #ff453a;">₹${matchProduct.originalPrice.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                                <span class="label" style="font-size: 0.7rem; color: var(--success); text-transform: uppercase; font-weight: 600;">Selling Price</span>
                                <div style="font-size: 1.2rem; font-weight: 800; color: var(--success);">₹${matchProduct.discountedPrice.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                                <span class="label" style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">MRP Price</span>
                                <div style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); text-decoration: line-through; opacity: 0.6;">₹${matchProduct.mrp.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            scanResultContainer.style.display = 'block';
            scanResultContainer.scrollIntoView({ behavior: 'smooth' });

            document.getElementById('btn-clear-scan').addEventListener('click', () => {
                scanResultContainer.style.display = 'none';
            });
        } else {
            // General Customer Scan result: displays only Name, Image, Selling price, and shop name in overlay modal
            customerModalContent.innerHTML = `
                <div style="margin: 1.5rem 0;">
                    <img src="${matchProduct.image}" alt="${matchProduct.name}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                    <h3 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.5rem;">${matchProduct.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.4; margin-bottom: 1.5rem;">${matchProduct.description}</p>
                    <div style="background: var(--bg-tertiary); padding: 1.2rem; border-radius: 10px; display: flex; justify-content: space-around; align-items: center; border: 1px solid var(--border-color);">
                        <div>
                            <span class="label" style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 0.2rem;">Retail Price</span>
                            <span style="font-size: 1.6rem; font-weight: 800; color: var(--accent-gold);">₹${matchProduct.discountedPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div style="width: 1px; height: 30px; background: var(--border-color);"></div>
                        <div>
                            <span class="label" style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 0.2rem;">MRP</span>
                            <span style="font-size: 1.2rem; font-weight: 600; color: var(--text-muted); text-decoration: line-through; opacity: 0.7;">₹${matchProduct.mrp.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            `;
            customerScanModal.style.display = 'flex';
        }
    }

    function onScanFailure(error) {
        // Silent logging to prevent console pollution
    }

    btnCloseCustomerModal.addEventListener('click', () => {
        customerScanModal.style.display = 'none';
    });

    // Run initial setup checks
    updateAdminPanelVisibility();
}

