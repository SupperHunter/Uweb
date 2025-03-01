
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function addToCart(productId, productName, price, discountPrice, stock, color = null, size = null, quantity = 1) {
    let index = cart.findIndex(item => item.id === productId && item.color === color && item.size === size);
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
            price: discountPrice || price, 
            originalPrice: price,
            discountPrice: discountPrice,
            stock: stock,
            quantity: quantity,
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
document.addEventListener("DOMContentLoaded", updatequantityCard);

