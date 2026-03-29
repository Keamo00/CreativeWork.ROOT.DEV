// VendingMachine.js - Instructional & Transactional Interaction
class VendingMachine {
    constructor() {
        this.inventory = {
            'A1': { name: 'Energy Drink', price: 25, stock: 5 },
            'A2': { name: 'Protein Bar', price: 15, stock: 0 },
            'B1': { name: 'Water', price: 10, stock: 8 }
        };
        this.balance = 0;
        this.selection = "";
        this.init();
    }

    init() {
        console.log("Vending System Online.");
    }

    insertCoin(amount) {
        this.balance += amount;
        document.getElementById('display').innerText = `Credit: R${this.balance}`;
        document.getElementById('balance-readout').innerText = `R${this.balance}`;
    }

    pressKey(key) {
        this.selection += key;
        document.getElementById('display').innerText = `Select: ${this.selection}`;
        
        if (this.selection.length === 2) {
            this.processSelection();
        }
    }

    processSelection() {
        const item = this.inventory[this.selection];
        const display = document.getElementById('display');

        if (!item) {
            display.innerText = "INVALID CODE";
        } else if (item.stock <= 0) {
            display.innerText = "SOLD OUT";
        } else if (this.balance < item.price) {
            display.innerText = `NEED R${item.price - this.balance}`;
        } else {
            this.dispense(item);
        }
        this.selection = ""; // Reset after 2 keys
    }

    dispense(item) {
        this.balance -= item.price;
        item.stock -= 1;
        document.getElementById('display').innerText = "DISPENSING...";
        
        // GSAP Animation for the "Mechanical" feel
        gsap.to("#product-slot", {
            rotation: 360,
            duration: 1.5,
            onComplete: () => {
                document.getElementById('display').innerText = `ENJOY ${item.name}!`;
                document.getElementById('balance-readout').innerText = `R${this.balance}`;
            }
        });
    }
}

const VM = new VendingMachine();