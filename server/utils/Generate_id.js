const { customAlphabet } = require('nanoid');

// Function to generate custom numeric IDs
function generateID() {
    const digits = '0123456789';
    const customId= customAlphabet(digits, 12);
    return parseInt(customId(), 10);
};

function generateBillID(){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const customId= customAlphabet(chars, 8);
    return (customId());
};

module.exports={
    generateID,
    generateBillID
}