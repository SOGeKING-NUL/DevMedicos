// Quantity to sell
let quantityToSell = 30;

// To track the total cost of apples sold
let totalCost = 0;

for (let i = 0; i < inventory.length; i++) {
  if (quantityToSell > inventory[i].quantity) {
      totalCost += inventory[i].quantity * inventory[i].rate;
      quantityToSell -= inventory[i].quantity;
  } else {
      totalCost += quantityToSell * inventory[i].rate;
      quantityToSell = 0;
      break;
  }
}

console.log("Total cost of apples sold:", totalCost);

