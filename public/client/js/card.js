
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function addToCart(productId, productName, price, discountPrice, stock,image ,  color = null, size = null, quantity = 1) {
    let index = cart.findIndex(item => item.id === productId);

    console.log(image);
    if (index !== -1) {
        if (cart[index].quantity + quantity > stock) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }
        cart[index].quantity += 1;
    } else {
        if (quantity > stock) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }
        cart.push({
            id: productId,
            name: productName,
            image :"data:image/png;base64,"+ image,
            price: discountPrice || price, 
            originalPrice: price,
            discountPrice: discountPrice,
            stock: stock,
            quantity: quantity || 1,
            color: color,
            size: size
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart)); 

    Swal.fire({
        title: "Đã thêm vào giỏ hàng!",
        icon: "success",
        draggable: true
      });
      updatequantityCard();
}

function Increase(productid){
    let index = cart.findIndex(item => item.id === productid);
    if(index !== -1 ){
        cart[index].quantity += 1;
    }
    updatequantityCard();
}

function Decrease(productid){
    let index = cart.findIndex(item => item.id === productid);
    if(index !== -1){
        if(cart[index].quantity > 0){
            cart[index].quantity -= 1;
            updatequantityCard();
        }
    }
}

function updatequantityCard(){
    let cardviewquanlity = document.getElementById("cardviewquanlity");
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cardviewquanlity) cardviewquanlity.textContent = totalItems;
}

function removeItemIncard(idproduct){
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function redirectToCheckout(){
    if(cart.length <=0){
        Swal.fire("trong giở hàng của bản chưa có sản phẩm nào cả!");
        return;
    }
    window.location.href = "/checkout";
}


function formatVND(Number){
    return new Intl.NumberFormat('vi-VN').format(Number);
}

function Caculator(quantity , price){
    console.log("quantity: "+ quantity + " ,price: "+ price);
    return quantity * price
}

function viewcard(){
    let cardTable = document.getElementById("cart-body");

    console.log(cart);
    if(cardTable === null) return;
    cardTable.innerHTML = "";
    cart.forEach((item , index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td class="product-remove">
                    <a href="#" class="remove-item" data-index="${index}">
                        <span class="ion-ios-close"></span>
                    </a>
                </td>
                <td class="image-prod">
                    <div class="img" style="background-image: url('<%= item.image %>');"></div>
                </td>
                <td class="product-name">
                    <h3>${item.name}</h3>
                </td>
                <td class="price">$${formatVND(item.originalPrice)}</td>
                <td class="quantity">
                    <div class="input-group mb-3">
                        <input type="number" name="quantity" class="quantity form-control input-number"
                            value="${item.quantity}" min="1" max="100" data-index="${index}">
                    </div>
                </td>
                <td class="total">$${Caculator(item.originalPrice ,item.quantity )}</td>
         `;
    cardTable.appendChild(row);
    });

}

viewcard();

document.addEventListener("DOMContentLoaded", updatequantityCard);

