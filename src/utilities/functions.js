export const notationConvertion = (num) => {
    let convertion = num;
    convertion = num.toLocaleString("en-US", {notation: "compact"})
    
    return convertion;
} 