function getConfig() {
    const modeEl = document.querySelector('input[name="calc-mode"]:checked');
    const mode = modeEl ? modeEl.value : 'detailed';
    
    if (mode === 'direct') {
        return {
            ciaWeight: parseFloat(document.getElementById('config-cia-weight').value) || 40,
            eseWeight: parseFloat(document.getElementById('config-ese-weight').value) || 60,
            esePass: parseFloat(document.getElementById('config-ese-pass').value) || 40,
            totalPass: parseFloat(document.getElementById('config-total-pass').value) || 50
        };
    } else {
        return {
            ciaWeight: 40,
            eseWeight: 60,
            esePass: 40,
            totalPass: 50
        };
    }
}

function updateUIFromConfig() {
    const config = getConfig();
    
    const badgeCiaDirect = document.getElementById('badge-cia-direct');
    if(badgeCiaDirect) badgeCiaDirect.innerText = `Max ${config.ciaWeight}`;
    
    const labelDirectCia = document.getElementById('label-direct-cia');
    if(labelDirectCia) labelDirectCia.innerText = `Enter Total CIA Mark (Out of ${config.ciaWeight})`;
    
    const directCia = document.getElementById('direct-cia');
    if(directCia) {
        directCia.setAttribute('max', config.ciaWeight);
        directCia.setAttribute('placeholder', `0-${config.ciaWeight}`);
    }
    
    const badgeEsePass = document.getElementById('badge-ese-pass');
    if(badgeEsePass) badgeEsePass.innerText = `Pass ≥ ${config.esePass}`;
    
    const eseWarning = document.getElementById('ese-warning');
    if(eseWarning) eseWarning.innerText = `* Minimum ${config.esePass} marks required in ESE to pass.`;
    
    const labelEseMini = document.getElementById('label-ese-mini');
    if(labelEseMini) labelEseMini.innerText = `Converted (${config.eseWeight}%):`;
    
    updateMiniResults();
    if(document.getElementById('disp-status').innerText !== "-") {
        calculateGradeNew();
    }
}

function resetConfig() {
    const ciaEl = document.getElementById('config-cia-weight');
    if (ciaEl) {
        ciaEl.value = 40;
        document.getElementById('config-ese-weight').value = 60;
        document.getElementById('config-ese-pass').value = 40;
        document.getElementById('config-total-pass').value = 50;
        updateUIFromConfig();
    }
}

function getValue(id) {
    const val = parseFloat(document.getElementById(id).value);
    return isNaN(val) ? 0 : val;
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function updateMiniResults() {
    // A1
    const a1_raw = getValue('a1-raw');
    const a1_notes = getValue('a1-notes');
    // Rule: (Raw/30) * 90 + Notes
    const a1_conv = (a1_raw / 30) * 90;
    const a1_total = Math.min(a1_conv + a1_notes, 100);
    document.getElementById('res-a1').innerHTML = `<span>Out of 100:</span> <strong>${a1_total.toFixed(2)}</strong>`;

    // A2
    const a2_raw = getValue('a2-raw');
    const a2_mcq = getValue('a2-mcq');
    const a2_cluster = getValue('a2-cluster');
    // Rule: (Raw/50 * 70) + Assignment(20) + Notes(10)
    const a2_conv = (a2_raw / 50) * 70;
    const a2_total = Math.min(a2_conv + a2_mcq + a2_cluster, 100);
    document.getElementById('res-a2').innerHTML = `<span>Out of 100:</span> <strong>${a2_total.toFixed(2)}</strong>`;

    // A3
    const a3_raw = getValue('a3-raw');
    const a3_assign = getValue('a3-assign');
    const a3_cluster = getValue('a3-cluster');
    // Rule: (Raw/100 * 70) + Assignment(20) + Notes(10)
    const a3_conv = (a3_raw / 100) * 70;
    const a3_total = Math.min(a3_conv + a3_assign + a3_cluster, 100);
    document.getElementById('res-a3').innerHTML = `<span>Out of 100:</span> <strong>${a3_total.toFixed(2)}</strong>`;

    // ESE Mini Result
    const ese_raw = getValue('ese-raw');
    const eseInput = document.getElementById('ese-raw');

    // Only show if user has started typing
    const config = getConfig();
    if (eseInput.value.trim() !== '') {
        const ese_conv = (ese_raw / 100) * config.eseWeight;
        document.getElementById('res-ese').innerHTML = `<span id="label-ese-mini">Converted (${config.eseWeight}%):</span> <strong>${ese_conv.toFixed(2)} / ${config.eseWeight}</strong>`;
    } else {
        document.getElementById('res-ese').innerHTML = `<span id="label-ese-mini">Converted (${config.eseWeight}%):</span> <strong>- / ${config.eseWeight}</strong>`;
    }


    return {
        a1: a1_total,
        a2: a2_total,
        a3: a3_total
    };
}

function toggleMode() {
    const mode = document.querySelector('input[name="calc-mode"]:checked').value;
    const assessmentCards = document.querySelectorAll('.assessment-card');
    const directCard = document.getElementById('direct-entry-card');
    const configCard = document.getElementById('config-card');

    if (mode === 'direct') {
        assessmentCards.forEach(card => card.style.display = 'none');
        directCard.style.display = 'block';
        if (configCard) configCard.style.display = 'block';
    } else {
        assessmentCards.forEach(card => card.style.display = 'block');
        directCard.style.display = 'none';
        if (configCard) configCard.style.display = 'none';
    }

    updateUIFromConfig();

    // Clear logs when switching
    const config = getConfig();
    document.getElementById('calc-log').innerHTML = '<li>Mode changed. Enter marks to see breakdown...</li>';
    document.getElementById('res-ese').innerHTML = `<span id="label-ese-mini">Converted (${config.eseWeight}%):</span> <strong>- / ${config.eseWeight}</strong>`;
}


function calculateGrade() {
    // Validation: Check if all internal assessment inputs are provided
    const requiredIds = [
        'a1-raw', 'a1-notes',
        'a2-raw', 'a2-mcq', 'a2-cluster',
        'a3-raw', 'a3-assign', 'a3-cluster'
    ];

    let allFilled = true;
    for (const id of requiredIds) {
        if (document.getElementById(id).value.trim() === '') {
            allFilled = false;
            break;
        }
    }

    if (!allFilled) {
        alert("Please enter data for all Internal Assessment marks (Assessment 1, 2, and 3) to calculate.");
        return;
    }

    // 1. Get Assessments
    const scores = updateMiniResults();

    // 2. CIA Calculation
    const total_internal = scores.a1 + scores.a2 + scores.a3; // Out of 300
    // Rounding logic: Standard Rounding (x.5 rounds up)
    const cia_score = Math.round((total_internal / 300) * 40); // Out of 40

    // 3. ESE Calculation Check
    const eseInput = document.getElementById('ese-raw');
    const hasEse = eseInput.value.trim() !== '';
    const ese_raw = getValue('ese-raw');

    // Display Internal Stats (Always)
    document.getElementById('disp-internal').innerText = `${total_internal.toFixed(1)} / 300`;
    document.getElementById('disp-cia').innerText = `${cia_score} / 40`;

    // 4. Mode Selection: Internal Only vs Overall
    if (!hasEse) {
        // Internal Only Mode
        document.getElementById('disp-ese-conv').innerText = "-";
        document.getElementById('disp-ese-raw').innerText = "-";
        document.getElementById('disp-total').innerText = "-";

        document.getElementById('disp-grade').innerText = "-";
        document.getElementById('disp-status').innerText = "Pending ESE";
        document.getElementById('disp-status').className = ""; // Neutral
        document.getElementById('disp-status').style.color = "var(--text-dim)";

        document.getElementById('ese-warning').style.display = 'none';

        // Log
        const log = document.getElementById('calc-log');
        log.innerHTML = `
            <li><strong>A1:</strong> ${scores.a1.toFixed(1)}</li>
            <li><strong>A2:</strong> ${scores.a2.toFixed(1)}</li>
            <li><strong>A3:</strong> ${scores.a3.toFixed(1)}</li>
            <li>---------------------------</li>
            <li><strong>Internal Total:</strong> ${total_internal.toFixed(1)} / 300</li>
            <li><strong>CIA Score:</strong> ${cia_score} / 40</li>
            <li><em>* Enter End Semester Mark to see Final Grade.</em></li>
        `;
    } else {
        // Overall Mode (Full Calculation)

        // Minimum 40 pass check for ESE
        if (ese_raw < 40) {
            document.getElementById('ese-warning').style.display = 'block';
        } else {
            document.getElementById('ese-warning').style.display = 'none';
        }

        // Convert ESE to 60 weightage
        const ese_weighted = (ese_raw / 100) * 60;

        // Final Total Calculation
        const final_total_raw = cia_score + ese_weighted;
        const final_total = Math.round(final_total_raw);

        // Pass/Fail Logic
        let status = "PASS";
        let statusClass = "pass";

        if (ese_raw < 40) {
            status = "FAIL (ESE < 40)";
            statusClass = "fail";
        }

        // Grade Logic
        let grade = "RA";
        let gradeText = "Reappearance";

        if (statusClass === "fail") {
            grade = "RA";
            gradeText = "Reappearance";
        } else {
            const t = final_total;
            if (t >= 90) { grade = "O"; gradeText = "Outstanding"; }
            else if (t >= 80) { grade = "A+"; gradeText = "Excellent"; }
            else if (t >= 70) { grade = "A"; gradeText = "Very Good"; }
            else if (t >= 60) { grade = "B+"; gradeText = "Good"; }
            else if (t >= 50) { grade = "B"; gradeText = "Average"; }
            else if (t >= 40) { grade = "C"; gradeText = "Satisfactory"; }
            else {
                grade = "RA";
                gradeText = "Reappearance";
                status = "FAIL (Total < 40)";
                statusClass = "fail";
            }
        }

        // Display Full Stats
        document.getElementById('disp-ese-conv').innerText = `${ese_weighted.toFixed(2)} / 60`;
        document.getElementById('disp-ese-raw').innerText = ese_raw;
        document.getElementById('disp-total').innerText = `${final_total} / 100`;

        // Display Grade/Status
        const statusEl = document.getElementById('disp-status');
        const gradeEl = document.getElementById('disp-grade');

        statusEl.innerText = status;
        statusEl.className = statusClass;
        statusEl.style.color = ""; // Reset inline color (use class)

        gradeEl.innerHTML = `${grade}<div style="font-size:1rem; margin-top:0.5rem; opacity:0.8">${gradeText}</div>`;

        if (grade === "RA" || statusClass === "fail") {
            gradeEl.style.color = "var(--danger)";
        } else {
            gradeEl.style.color = "var(--success)";
        }

        // Breakdown Log
        const log = document.getElementById('calc-log');
        log.innerHTML = `
            <li><strong>A1:</strong> ${scores.a1.toFixed(1)}</li>
            <li><strong>A2:</strong> ${scores.a2.toFixed(1)}</li>
            <li><strong>A3:</strong> ${scores.a3.toFixed(1)}</li>
            <li>---------------------------</li>
            <li><strong>Internal Total:</strong> ${total_internal.toFixed(1)} / 300</li>
            <li><strong>CIA Score:</strong> ${cia_score} / 40</li>
            <li><strong>ESE Weighted:</strong> (${ese_raw} / 100) * 60 = ${ese_weighted.toFixed(2)}</li>
            <li><strong>Final Total:</strong> Math.round(${cia_score} + ${ese_weighted.toFixed(2)}) = <strong>${final_total}</strong></li>
        `;
    }


    // Scroll to result
    document.getElementById('final-result').scrollIntoView({ behavior: 'smooth' });
}

function calculateGradeNew() {
    const config = getConfig();
    const mode = document.querySelector('input[name="calc-mode"]:checked').value;

    let cia_score = 0;
    let total_internal_display = 0; // For display purposes
    let calculation_breakdown_html = "";

    if (mode === 'detailed') {
        // Detailed Mode (Original Logic)

        // Validation: Check if all internal assessment inputs are provided
        const requiredIds = [
            'a1-raw', 'a1-notes',
            'a2-raw', 'a2-mcq', 'a2-cluster',
            'a3-raw', 'a3-assign', 'a3-cluster'
        ];

        let allFilled = true;
        for (const id of requiredIds) {
            if (document.getElementById(id).value.trim() === '') {
                allFilled = false;
                break;
            }
        }

        if (!allFilled) {
            alert("Please enter data for all Internal Assessment marks to calculate, or switch to 'Direct Internal Entry' mode.");
            return;
        }

        // 1. Get Assessments
        const scores = updateMiniResults();

        // 2. CIA Calculation
        const total_internal = scores.a1 + scores.a2 + scores.a3; // Out of 300
        total_internal_display = total_internal;
        // Rounding logic: Standard Rounding (x.5 rounds up)
        cia_score = Math.round((total_internal / 300) * config.ciaWeight); // Out of config.ciaWeight

        calculation_breakdown_html += `
            <li><strong>A1:</strong> ${scores.a1.toFixed(1)}</li>
            <li><strong>A2:</strong> ${scores.a2.toFixed(1)}</li>
            <li><strong>A3:</strong> ${scores.a3.toFixed(1)}</li>
            <li>---------------------------</li>
            <li><strong>Internal Total:</strong> ${total_internal.toFixed(1)} / 300</li>
            <li><strong>CIA Score:</strong> Math.round(${((total_internal / 300) * config.ciaWeight).toFixed(2)}) = <strong>${cia_score}</strong></li>
        `;

    } else {
        // Direct Entry Mode
        const directInput = document.getElementById('direct-cia');

        if (directInput.value.trim() === '') {
            alert(`Please enter your Total CIA Mark (out of ${config.ciaWeight}).`);
            return;
        }

        const raw_direct = parseFloat(directInput.value);
        if (raw_direct < 0 || raw_direct > config.ciaWeight) {
            alert(`CIA Mark must be between 0 and ${config.ciaWeight}.`);
            return;
        }

        cia_score = raw_direct;
        total_internal_display = (cia_score / config.ciaWeight) * 300;

        calculation_breakdown_html += `
            <li><strong>Direct Entry Mode</strong></li>
            <li><strong>CIA Score:</strong> ${cia_score} / ${config.ciaWeight}</li>
        `;
    }

    // 3. ESE Calculation Check
    const eseInput = document.getElementById('ese-raw');
    const hasEse = eseInput.value.trim() !== '';
    const ese_raw = getValue('ese-raw');

    // Display Internal Stats (Always)
    document.getElementById('disp-internal').innerText = `${total_internal_display.toFixed(1)} / 300`;
    document.getElementById('disp-cia').innerText = `${cia_score} / ${config.ciaWeight}`;

    // 4. Mode Selection: Internal Only vs Overall
    if (!hasEse) {
        // Internal Only Mode
        document.getElementById('disp-ese-conv').innerText = "-";
        document.getElementById('disp-ese-raw').innerText = "-";
        document.getElementById('disp-total').innerText = "-";

        document.getElementById('disp-grade').innerText = "-";
        document.getElementById('disp-status').innerText = "Pending ESE";
        document.getElementById('disp-status').className = ""; // Neutral
        document.getElementById('disp-status').style.color = "var(--text-dim)";

        document.getElementById('ese-warning').style.display = 'none';

        // Log
        const log = document.getElementById('calc-log');
        log.innerHTML = calculation_breakdown_html + `<li><em>* Enter End Semester Mark to see Final Grade.</em></li>`;

    } else {
        // Overall Mode (Full Calculation)

        // Minimum pass check for ESE
        if (ese_raw < config.esePass) {
            document.getElementById('ese-warning').style.display = 'block';
        } else {
            document.getElementById('ese-warning').style.display = 'none';
        }

        // Convert ESE
        let ese_weighted = (ese_raw / 100) * config.eseWeight;

        // Final Total Calculation
        const final_total_raw = cia_score + ese_weighted;
        const final_total = Math.round(final_total_raw);

        // Pass/Fail Logic
        let status = "PASS";
        let statusClass = "pass";

        if (ese_raw < config.esePass) {
            status = `FAIL (ESE < ${config.esePass})`;
            statusClass = "fail";
        } else if (final_total < config.totalPass) {
            status = `FAIL (Total < ${config.totalPass})`;
            statusClass = "fail";
        }

        // Grade Logic
        let grade = "RA";
        let gradeText = "Reappearance";

        if (statusClass === "fail") {
            grade = "RA";
            gradeText = "Reappearance";
        } else {
            const t = final_total;
            if (t >= 91) { grade = "O"; gradeText = "Outstanding"; }
            else if (t >= 81) { grade = "A+"; gradeText = "Excellent"; }
            else if (t >= 71) { grade = "A"; gradeText = "Very Good"; }
            else if (t >= 61) { grade = "B+"; gradeText = "Good"; }
            else if (t >= 56) { grade = "B"; gradeText = "Above Average"; }
            else if (t >= 50) { 
                grade = config.totalPass < 50 ? "C+" : "C"; 
                gradeText = config.totalPass < 50 ? "Average" : "Pass";
            }
            else if (t >= 40) { grade = "C"; gradeText = "Pass"; }
            else {
                grade = "RA";
                gradeText = "Reappearance";
                status = `FAIL (Total < ${config.totalPass})`;
                statusClass = "fail";
            }
        }

        // Display Full Stats
        document.getElementById('disp-ese-conv').innerText = `${ese_weighted.toFixed(2)} / ${config.eseWeight}`;
        document.getElementById('disp-ese-raw').innerText = ese_raw;
        document.getElementById('disp-total').innerText = `${final_total} / 100`;

        // Display Grade/Status
        const statusEl = document.getElementById('disp-status');
        const gradeEl = document.getElementById('disp-grade');

        statusEl.innerText = status;
        statusEl.className = statusClass;
        statusEl.style.color = ""; // Reset inline color (use class)

        gradeEl.innerHTML = `${grade}<div style="font-size:1rem; margin-top:0.5rem; opacity:0.8">${gradeText}</div>`;

        if (grade === "RA" || statusClass === "fail") {
            gradeEl.style.color = "var(--danger)";
        } else {
            gradeEl.style.color = "var(--success)";
        }

        // Breakdown Log
        const log = document.getElementById('calc-log');
        let ese_log_text = `<li><strong>ESE Weighted:</strong> (${ese_raw} / 100) * ${config.eseWeight} = ${ese_weighted.toFixed(2)}</li>`;
        log.innerHTML = calculation_breakdown_html + ese_log_text + `
            <li><strong>Final Total:</strong> Math.round(${cia_score} + ${ese_weighted.toFixed(2)}) = <strong>${final_total}</strong></li>
        `;
    }

    // Scroll to result
    document.getElementById('final-result').scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
document.getElementById('calc-btn').addEventListener('click', calculateGradeNew);


document.getElementById('reset-btn').addEventListener('click', () => {
    // 1. Clear Inputs
    document.querySelectorAll('input').forEach(i => {
        if(!i.id.startsWith('config-') && i.type !== 'radio') {
            i.value = '';
            i.parentElement.classList.remove('error'); // Remove validation errors
        }
    });

    // 2. Reset Mini Results
    const defaultMini = `<span>Out of 100:</span> <strong>0.00</strong>`;
    document.getElementById('res-a1').innerHTML = defaultMini;
    document.getElementById('res-a2').innerHTML = defaultMini;
    document.getElementById('res-a3').innerHTML = defaultMini;

    // Reset ESE Mini Result
    const config = getConfig();
    document.getElementById('res-ese').innerHTML = `<span id="label-ese-mini">Converted (${config.eseWeight}%):</span> <strong>- / ${config.eseWeight}</strong>`;

    // 3. Reset Final Summary
    document.getElementById('disp-internal').innerText = '0 / 300';
    document.getElementById('disp-cia').innerText = `0 / ${config.ciaWeight}`;
    document.getElementById('disp-ese-conv').innerText = `0 / ${config.eseWeight}`;
    document.getElementById('disp-ese-raw').innerText = '0';
    document.getElementById('disp-total').innerText = '0 / 100';

    // 4. Reset Status & Grade
    const statusEl = document.getElementById('disp-status');
    const gradeEl = document.getElementById('disp-grade');

    statusEl.innerText = '-';
    statusEl.className = ''; // Remove pass/fail classes
    statusEl.style.color = '';

    gradeEl.innerText = '-';
    gradeEl.style.color = '';

    // 5. Hide Warnings
    document.getElementById('ese-warning').style.display = 'none';

    // 6. Reset Log
    document.getElementById('calc-log').innerHTML = '<li>Enter marks to see breakdown...</li>';

    // 7. Reset Mode to Detailed (Default)
    const detailedRadio = document.querySelector('input[value="detailed"]');
    if (detailedRadio) {
        detailedRadio.checked = true;
        toggleMode(); // Trigger UI update (hide direct, show assessments)
    }

    // 8. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Auto-calc on input change for mini results only
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        // Enforce max values
        const max = parseFloat(input.getAttribute('max'));
        if (parseFloat(input.value) > max) {
            input.parentElement.classList.add('error');
        } else {
            input.parentElement.classList.remove('error');
        }
        updateMiniResults();
    });
});

// Add Print button dynamically if not exists, or just use browser print
// We can add a print button to controls in HTML or just advise user to Ctrl+P.
// Let's add a specific Print button to controls if requested? 
// The user asked for "Print / Download result summary". 
// I'll add a button in JS that triggers window.print().

const controls = document.querySelector('.controls');
if (!document.getElementById('print-btn')) {
    const printBtn = document.createElement('button');
    printBtn.id = 'print-btn';
    printBtn.className = 'btn secondary';
    printBtn.innerText = 'Print Summary';
    printBtn.onclick = () => window.print();
    controls.appendChild(printBtn);
}


window.addEventListener('DOMContentLoaded', updateUIFromConfig);
