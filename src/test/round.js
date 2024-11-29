function customRound(num) {
    return (num % 1 > 0.5) ? Math.ceil(num) : num;
}

// Example usage:
console.log(customRound(2.7)); // Outputs: 3
console.log(customRound(2.5)); // Outputs: 2.5
console.log(customRound(2.3)); // Outputs: 2.3