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
    initClock();
    initNavigation();
    initPriceSync();
    initInterestCalc();
    initLoanPredictor();
    initHistoricalChart();
    initItemPricePredictor();
    
    // Simulate live updating rates from market feed (runs every 1 second)
    setInterval(simulateLiveRates, 1000);
});

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

    const btnStartDisplay = document.getElementById('btn-start-date-picker');
    const btnEndDisplay = document.getElementById('btn-end-date-picker');

    const modalOverlay = document.getElementById('date-picker-modal');
    const modalTitle = document.getElementById('picker-modal-title');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnConfirmPicker = document.getElementById('btn-confirm-picker');

    const scrollerDay = document.getElementById('scroller-day');
    const scrollerMonth = document.getElementById('scroller-month');
    const scrollerYear = document.getElementById('scroller-year');

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
        modalTitle.textContent = target === 'start' ? 'Select Date Taken' : 'Select Settlement Date';
        
        const referenceDate = target === 'start' ? dateTakenVal : dateSettlementVal;

        curSelectedDay = referenceDate.getDate();
        curSelectedMonth = referenceDate.getMonth();
        curSelectedYear = referenceDate.getFullYear();

        modalOverlay.classList.add('active');

        // Scroll wheels to center active selections
        scrollWheelToValue(viewportDay, scrollerDay, curSelectedDay);
        scrollWheelToValue(viewportMonth, scrollerMonth, curSelectedMonth);
        scrollWheelToValue(viewportYear, scrollerYear, curSelectedYear);
    };

    btnStartDisplay.addEventListener('click', () => openDatePickerModal('start'));
    btnEndDisplay.addEventListener('click', () => openDatePickerModal('end'));

    // Close modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        activePickingTarget = null;
    };

    btnCloseModal.addEventListener('click', closeModal);

    // Confirm choice
    btnConfirmPicker.addEventListener('click', () => {
        const selectedDate = new Date(
            curSelectedYear,
            curSelectedMonth,
            curSelectedDay
        );

        if (activePickingTarget === 'start') {
            dateTakenVal = selectedDate;
        } else if (activePickingTarget === 'end') {
            dateSettlementVal = selectedDate;
        }

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
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#A0A0AB'
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
                        color: '#A0A0AB'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#A0A0AB'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });
}

// ITEMS RETAIL PRICE CALCULATOR
function initItemPricePredictor() {
    const btnPredictItem = document.getElementById('btn-predict-item-price');
    if (!btnPredictItem) return; // Prevent errors since form is cleared for Coming Soon
    btnPredictItem.addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('item-weight').value);
        const rate = parseFloat(document.getElementById('item-metal-price').value);
        const wastage = parseFloat(document.getElementById('item-wastage').value);
        const makingCharge = parseFloat(document.getElementById('item-making-charge').value);

        if (!weight || weight <= 0) {
            alert('Please specify the metal weight.');
            return;
        }
        if (!rate || rate <= 0) {
            alert('Please specify the metal rate.');
            return;
        }

        // Metal Cost including wastage
        const effectiveWeight = weight * (1 + (wastage / 100));
        const metalCost = effectiveWeight * rate;

        // Making charges
        const totalMaking = makingCharge * weight;

        // Subtotal before tax
        const subtotal = metalCost + totalMaking;

        // GST (Standard jewelry GST is 3%)
        const gst = subtotal * 0.03;

        // Final Payable retail price
        const finalRetailPrice = subtotal + gst;

        const resultCard = document.getElementById('item-price-result');
        resultCard.innerHTML = `
            <div class="statement-card">
                <h3 class="statement-title">Predicted Retail Valuation</h3>
                <div class="statement-grid">
                    <div class="statement-item">
                        <span class="label">Net Weight</span>
                        <span class="value">${weight.toFixed(3)} grams</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Effective Weight (+Wastage)</span>
                        <span class="value">${effectiveWeight.toFixed(3)} grams</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Metal Value</span>
                        <span class="value">₹${Math.round(metalCost).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Making Cost</span>
                        <span class="value">₹${Math.round(totalMaking).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">Taxable Subtotal</span>
                        <span class="value">₹${Math.round(subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="statement-item">
                        <span class="label">GST (3%)</span>
                        <span class="value">₹${Math.round(gst).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="statement-item total-payable" style="grid-column: span 2;">
                        <span class="label">Estimated Retail Billing Price</span>
                        <span class="value">₹${Math.round(finalRetailPrice).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        `;
    });
}
