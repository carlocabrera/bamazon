// Dependencies
var mysql = require("mysql");
var Table = require("cli-table");
var inquirer = require("inquirer");

// MySQL Connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
});

// Create Table
var table = new Table({
    head: ["ITEM ID", "PRODUCT NAME", "DEPARTMENT", "PRICE", "STOCK QUANTITY"],
    colWidths: [10, 35, 25, 10, 20]
});

// Buy & Update Functions
function buyProduct(amount, product_id, price) {
    inquirer
        .prompt([
            {
                type: "input",
                message: "How Many?",
                name: "amount",
                validate: value => {
                    let valid = !isNaN(parseFloat(value));
                    return valid || "Please Enter Item ID #";
                }
            }
        ])
        .then(res => {
            if (amount > res.amount) {
                console.log("SUCCESS");
                totalPrice(res.amount, price);
                updateStock(res.amount, product_id, amount);
            } else {
                console.log("Out of stock!");
                buyProduct(amount, product_id, price);
            }
        });
}

// User Selects Items
function selectItems(product) {
    connection.query(
        "SELECT * FROM products WHERE item_id = ?",
        [product],
        (err, res) => {
            let quantity;
            for (let i in res) {
                quantity = res[i].stock_quantity;
                product_id = res[i].item_id;
                price = res[i].price;
            }
            buyProduct(quantity, product_id, price);
        }
    );
}
// Track Total Price
let total = 0;


function totalPrice(amount, price) {
    total += amount * price;
}

// Update Stock Quantity
function updateStock(amount, item, product_stock) {
    connection.query("UPDATE products SET ? WHERE ?", [
        {
            stock_quantity: product_stock - amount
        },
        {
            item_id: item
        }
    ]),
        anythingElse();
}

function purchase() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Item ID?",
                name: "choice",
                validate: value => {
                    let valid = !isNaN(parseFloat(value));
                    return valid || "Please Enter A Number";
                }
            }
        ])
        .then(res => {
            selectItems(res.choice);
        });
}

// Select More Items Function
function anythingElse() {
    inquirer
        .prompt([
            {
                type: "confirm",
                message: "Anything Else?",
                name: "choice"
            }
        ])
        .then(res => {
            if (res.choice) {
                displayProducts();
            } else {
                console.log("Thank You!");
                console.log(`Total: $${total}`);
                connection.end();
            }
        });
}

// Create and display products
function displayProducts() {
    table.length = 0;
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;

        for (let i in res) {
            let item_id = res[i].item_id;
            let product_name = res[i].product_name;
            let department_name = res[i].department_name;
            let price = res[i].price;
            let stock = res[i].stock_quantity;

            table.push([item_id, product_name, department_name, price, stock]);
        }
        console.log(table.toString());
        purchase();
    });
}
// Run Display Products Function
displayProducts();