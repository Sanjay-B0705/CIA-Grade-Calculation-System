# Student CIA & Grade Calculation Portal

A responsive web application designed for **UG B.Tech students** to verify their Continuous Internal Assessment (CIA) marks, End Semester Examination (ESE) results, and final Grade outcome based on official examination regulations.

## 🚀 Live Demo
Access the portal via: [https://Sanjay-B0705.github.io/CIA-Grade-Calculation-System/](https://Sanjay-B0705.github.io/CIA-Grade-Calculation-System/)
*(Note: Ensure GitHub Pages is enabled in repository settings)*

## 📋 What This Code Does
This project provides a clean, user-friendly interface for students to:
1.  **Input Marks**: Enter raw marks for three internal assessments and the end semester exam.
2.  **Automated Conversions**: Automatically converts raw marks into the specific weightages required by PMIST regulations.
3.  **Calculate CIA**: Computes the final Internal Mark out of 40 using the `(Total/300) * 40` formula.
4.  **Determine Grade**: Combines CIA and ESE scores to determine the final Pass/Fail status and Letter Grade (O to U).

## 🧮 How It Works (Calculation Logic)

### 1. Assessment Calculations
*   **Assessment 1**: (Raw Mark / 30) × 90 + Notes (10) = **Max 100**
*   **Assessment 2**: (Raw Mark / 50) × 70 + MCQ (20) + Cluster (10) = **Max 100**
*   **Assessment 3**: (Raw Mark / 100) × 70 + Assignment (20) + Cluster (10) = **Max 100**

### 2. CIA Score (Internal Marks)
*   The sum of all three assessments (Max 300) is converted:
    *   `CIA Score = Round((Total Internals / 300) * 40)`

### 3. End Semester Exam (ESE)
*   **Pass Condition**: Student must score **≥ 40** in the raw ESE mark to pass.
*   **Weightage**: Raw ESE mark (100) is converted to **60%** weightage for the final total.

### 4. Final Grade & Status
*   **Final Total**: `CIA Score (40) + ESE Weighted Score (60)`
*   **Grading Scale**:
    *   **O (Outstanding)**: 91 - 100
    *   **A+ (Excellent)**: 81 - 90
    *   **A (Very Good)**: 71 - 80
    *   **B+ (Good)**: 61 - 70
    *   **B (Below Average)**: 55 - 60
    *   **C+ (Average)**: 45 - 54
    *   **C (Pass)**: 40 - 44
    *   **U (Reappear)**: < 40 or Fail in ESE

## 🛠️ Tech Stack
*   **HTML5**: Structure and Layout.
*   **CSS3**: Glassmorphism design, animations, and responsive layout.
*   **JavaScript (ES6+)**: Real-time calculation logic and DOM manipulation.

## 🏃‍♂️ How to Run Locally
1.  Clone the repository:
    ```bash
    git clone https://github.com/Sanjay-B0705/CIA-Grade-Calculation-System.git
    ```
2.  Open `index.html` in any web browser (Chrome, Edge, Firefox).
