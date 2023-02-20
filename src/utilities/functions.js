export const notationConvertion = (num) => {
    let convertion = num;

    if (num.toString().length >= 7) {
        convertion = (num / 1000000).toFixed(0) + 'm';
        return convertion
    }

    if (num.toString().length >= 4) {
        convertion = (num / 1000).toFixed(0) + 'k';
        return convertion;
    }
    
    return convertion;
} 