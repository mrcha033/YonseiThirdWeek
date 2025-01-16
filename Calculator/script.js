let currentInput = '0';
let memory = 0;
const MAX_DIGITS = 12;

function updateDisplay() {
    const display = document.getElementById('display');
    // 숫자 길이 제한
    if (currentInput.replace(/[^0-9]/g, '').length > MAX_DIGITS) {
        display.textContent = 'Error: 숫자 초과';
        return;
    }
    display.textContent = currentInput;
}

function updateMemoryDisplay() {
    const memoryDisplay = document.getElementById('memoryDisplay');
    memoryDisplay.textContent = memory !== 0 ? `M: ${memory}` : '';
}

function appendNumber(num) {
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    currentInput += ` ${op} `;
    updateDisplay();
}

function calculate() {
    try {
        // eval 대신 Function 사용하여 보안 강화
        currentInput = String(Function('"use strict";return (' + currentInput + ')')());
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
    }
}

function clearDisplay(type) {
    if (type === 'C') {
        currentInput = '0';
    } else if (type === 'CE') {
        currentInput = currentInput.split(' ').slice(0, -1).join(' ') || '0';
    }
    updateDisplay();
}

function memoryOperation(op) {
    const currentValue = parseFloat(currentInput) || 0;

    switch (op) {
        case 'M+':
            memory += currentValue;
            break;
        case 'M-':
            memory -= currentValue;
            break;
        case 'MR':
            currentInput = String(memory);
            updateDisplay();
            break;
        case 'MC':
            memory = 0;
            break;
    }
    updateMemoryDisplay();
}

// 초기 디스플레이 업데이트
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    updateMemoryDisplay();
}); 