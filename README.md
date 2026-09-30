# OmniCalc Pro 🧮⚡
### Advanced Multi-Mode Scientific, Programmer, Financial, Converter & 2D Graphing Calculator

OmniCalc Pro is an ultra-modern, high-precision web-based calculator application engineered with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Math.js**. Designed for engineers, programmers, students, and financial analysts, OmniCalc Pro delivers an all-in-one computational powerhouse with a fluid UI, tactile audio feedback, and rich data visualizations.

---

## ✨ Key Features & Calculator Modes

### 1. 🔬 Scientific Calculator Mode
- **Full Expression Entry & Interactive Cursor Navigation**: Click anywhere in the expression or use the step arrows (← / →) to place the cursor and edit equations dynamically.
- **Trigonometry & Hyperbolics**: `sin`, `cos`, `tan`, `sinh`, `cosh`, `tanh`, with a **2nd** toggle for inverse functions (`asin`, `acos`, `atan`, `asinh`, `acosh`, `atanh`).
- **DEG / RAD Switcher**: Real-time angle unit toggle with live visual badge and precision angle normalization.
- **Mathematical Constants**: $\pi$ (Pi), $e$ (Euler's number), $\phi$ (Golden Ratio).
- **Logarithms & Powers**: $\ln$, $\log_{10}$, $\log_2$, $x^2$, $x^3$, $x^y$, $10^x$, $e^x$.
- **Roots & Factorials**: Square root $\sqrt{x}$, cube root $\sqrt[3]{x}$, $n!$, absolute value $|x|$, and modulo.
- **Memory Operations**: MC (Clear), MR (Recall), M+ (Add), M- (Subtract), MS (Store) with a live active memory indicator `[M]`.
- **Live Preview**: Real-time evaluation preview shown beneath the formula line as you type.

### 2. 💻 Programmer Calculator Mode
- **Simultaneous Real-Time Base Conversion**: Displays live conversion across **HEX**, **DEC**, **OCT**, and **BIN**.
- **Word Size Architecture**: Switch effortlessly between **QWORD (64-bit)**, **DWORD (32-bit)**, **WORD (16-bit)**, and **BYTE (8-bit)**.
- **Signed / Unsigned Toggle**: Instant two's complement signed vs. unsigned decimal representations.
- **Interactive Bit-Level Visualizer**: Interactive bit grid (up to 64 bits) organized into nibbles and bytes. Click any bit to flip it (`0` ⇄ `1`) with instant recalculation across all numerical bases!
- **Bitwise Operations**: `AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`, Bit Shift Left (`<<`), Bit Shift Right (`>>`), Rotate Left (`ROL`), and Rotate Right (`ROR`).
- **Dynamic Keypad Protection**: Automatically disables keys outside the active base (e.g. disabling 2–9 & A–F when in Binary mode).

### 3. 🔄 Unit & Currency Converter Mode
- **8 Measurement Categories**:
  1. **Length**: Meters, Kilometers, Centimeters, Millimeters, Miles, Yards, Feet, Inches, Nautical Miles.
  2. **Weight / Mass**: Kilograms, Grams, Milligrams, Metric Tons, Pounds, Ounces, Stones.
  3. **Temperature**: Celsius (°C), Fahrenheit (°F), Kelvin (K), Rankine (°R).
  4. **Speed**: m/s, km/h, mph, knots, ft/s.
  5. **Data Storage**: Bytes, KB, MB, GB, TB, PB, bits.
  6. **Energy**: Joules, Kilojoules, Calories, Kilocalories, Watt-hours, Kilowatt-hours, BTU.
  7. **Area**: Square Meters, Square Kilometers, Square Feet, Square Miles, Acres, Hectares.
  8. **Volume**: Liters, Milliliters, Cubic Meters, Gallons (US), Quarts, Pints, Cups, Fluid Ounces.
- **Editable Currency Converter**: Real-time currency conversions (USD, EUR, GBP, INR, JPY, CAD, AUD, CHF, CNY, SGD).
  - Includes an **Edit Exchange Rates** manager to customize rates or test real-time currency scenarios.
- **Equivalent Matrix**: Displays real-time equivalent values across all category units simultaneously.

### 4. 📈 Financial & Mortgage Calculator Mode
- **Loan & Mortgage (EMI) Calculator**:
  - Computes Monthly EMI, Total Principal, and Total Interest.
  - Interactive Donut Breakdown Chart (Principal vs. Interest) powered by Recharts.
- **Compound Interest & Wealth Growth Calculator**:
  - Calculates Future Investment Balance, Total Contributions, and Compound Interest profit.
  - Interactive multi-layer Area Chart visualizing exponential growth curve over time.
- **Tip & Bill Splitter**:
  - Calculates tip amounts (10%, 15%, 18%, 20%, 25%, or custom), tax additions, and per-person breakdown.

### 5. 📉 Interactive 2D Graphing Calculator Mode
- **HTML5 High-DPI Canvas Engine**: Plot $f(x)$ equations (e.g., $\sin(x)$, $x^2 - 4$, $x^3 - 3x$, $e^x$, $1/x$).
- **Multi-Function Plotting**: Supports up to 5 simultaneous functions with custom color coding.
- **Interactive Navigation**: Smooth drag-to-pan in any direction, mouse-wheel zooming, and zoom buttons.
- **Real-Time Cursor Point Inspection**: Hovering anywhere displays precision coordinate crosshairs and exact coordinates $(x, y)$ with nearest function values.
- **Preset Function Gallery**: One-click presets for trigonometric, polynomial, exponential, and damped wave functions.

---

## ⚡ Core Power Features Across All Modes

- **⌨️ Physical Keyboard Typing**: Full support for physical keyboards including Numpad, Enter (`=`), Backspace (`⌫`), Escape (`AC`), parentheses, operators (`+`, `-`, `*`, `/`, `^`, `%`), arrow keys, and hotkeys.
  - Press `?` or `Shift + /` anywhere to reveal the comprehensive Keyboard Shortcuts guide.
  - `Alt + 1` through `Alt + 5` for instant mode switching.
  - `Alt + H` to toggle the Calculation History drawer.
- **📜 Calculation History Drawer**:
  - Persistent log of past calculations with timestamps and mode tags.
  - **Click-to-Recall**: Click any previous expression or result to load it into the active calculator input.
  - **Export Options**: One-click export of calculation history to **CSV** or **JSON**.
- **🎨 4 Theme Customizer**:
  1. **Modern Dark**: Sleek slate & indigo with soft glassmorphism.
  2. **Clean Light**: Crisp, high-contrast light theme.
  3. **Cyberpunk Neon**: Glowing cyan, magenta, and electric futuristic accents.
  4. **Minimal OLED Black**: Pure #000000 black for maximum contrast and battery efficiency.
- **📋 Single-Click Copy**: Instant clipboard copying with smooth animated toast notifications.
- **🔊 Tactile Audio Feedback**: Synthesized mechanical clicks on keypress built using the native Web Audio API (zero external audio file dependencies).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Math Engine**: [mathjs](https://mathjs.org/) (for precision parsing, trig, and expression compilation)
- **Visualizations**: Recharts & Custom HTML5 Canvas 2D Engine
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Persistence**: Browser LocalStorage

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/vipin-dev3/Advanced-Calculator.git

# Navigate into the project directory
cd Advanced-Calculator

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 📦 Production Build & Deployment

### Build for Production
```bash
npm run build
```
This compiles TypeScript and builds optimized production assets into the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Vercel**: Import the repository and select Vite preset; build command: `npm run build`, output directory: `dist`.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.
- **GitHub Pages**: Deploy the `dist` directory using GitHub Actions.

---

## 📄 License
This project is open-source under the MIT License.
