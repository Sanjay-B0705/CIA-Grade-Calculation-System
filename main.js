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
    // Rule: Raw/30 * 90 + Notes
    // Wait, prompt says Raw(30) -> 90. So Raw * 3.
    const a1_conv = (a1_raw / 30) * 90;
    const a1_total = Math.min(a1_conv + a1_notes, 100);
    document.getElementById('res-a1').innerHTML = `<span>Mark:</span> <strong>${a1_total.toFixed(2)}</strong>`;

    // A2
    const a2_raw = getValue('a2-raw');
    const a2_mcq = getValue('a2-mcq');
    const a2_cluster = getValue('a2-cluster');
    // Rule: (Raw/50 * 100 * 0.7) -> (Raw/50 * 70) = Raw * 1.4
    const a2_conv = (a2_raw / 50) * 70;
    const a2_total = Math.min(a2_conv + a2_mcq + a2_cluster, 100);
    document.getElementById('res-a2').innerHTML = `<span>Mark:</span> <strong>${a2_total.toFixed(2)}</strong>`;

    // A3
    const a3_raw = getValue('a3-raw');
    const a3_assign = getValue('a3-assign');
    const a3_cluster = getValue('a3-cluster');
    // Rule: Raw/100 * 70 = Raw * 0.7
    const a3_conv = (a3_raw / 100) * 70;
    const a3_total = Math.min(a3_conv + a3_assign + a3_cluster, 100);
    document.getElementById('res-a3').innerHTML = `<span>Mark:</span> <strong>${a3_total.toFixed(2)}</strong>`;

    // ESE Mini Result
    const ese_raw = getValue('ese-raw');
    const eseInput = document.getElementById('ese-raw');

    // Only show if user has started typing
    if (eseInput.value.trim() !== '') {
        const ese_conv = (ese_raw / 100) * 60;
        document.getElementById('res-ese').innerHTML = `<span>Converted (60%):</span> <strong>${ese_conv.toFixed(2)} / 60</strong>`;
    } else {
        document.getElementById('res-ese').innerHTML = `<span>Converted (60%):</span> <strong>- / 60</strong>`;
    }

    return {
        a1: a1_total,
        a2: a2_total,
        a3: a3_total
    };
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
        let grade = "U";
        let gradeText = "Reappear";

        if (statusClass === "fail") {
            grade = "U";
            gradeText = "Reappear";
        } else {
            const t = final_total;
            if (t >= 91) { grade = "O"; gradeText = "Outstanding"; }
            else if (t >= 81) { grade = "A+"; gradeText = "Excellent"; }
            else if (t >= 71) { grade = "A"; gradeText = "Very Good"; }
            else if (t >= 61) { grade = "B+"; gradeText = "Good"; }
            else if (t >= 55) { grade = "B"; gradeText = "Below Average"; }
            else if (t >= 45) { grade = "C+"; gradeText = "Average"; }
            else if (t >= 40) { grade = "C"; gradeText = "Pass"; }
            else {
                grade = "U";
                gradeText = "Reappear";
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

        if (grade === "U" || statusClass === "fail") {
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

// Event Listeners
document.getElementById('calc-btn').addEventListener('click', calculateGrade);

document.getElementById('reset-btn').addEventListener('click', () => {
    // 1. Clear Inputs
    document.querySelectorAll('input').forEach(i => {
        i.value = '';
        i.parentElement.classList.remove('error'); // Remove validation errors
    });

    // 2. Reset Mini Results
    const defaultMini = `<span>Converted:</span> <strong>0 / 100</strong>`;
    document.getElementById('res-a1').innerHTML = defaultMini;
    document.getElementById('res-a2').innerHTML = defaultMini;
    document.getElementById('res-a3').innerHTML = defaultMini;

    // Reset ESE Mini Result
    document.getElementById('res-ese').innerHTML = `<span>Converted (60%):</span> <strong>- / 60</strong>`;

    // 3. Reset Final Summary
    document.getElementById('disp-internal').innerText = '0 / 300';
    document.getElementById('disp-cia').innerText = '0 / 40';
    document.getElementById('disp-ese-conv').innerText = '0 / 60';
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

    // 7. Scroll to top
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

