
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function addToCart(productId, productName, price, discountPrice, stock, color = null, size = null, quantity = 1) {
    let index = cart.findIndex(item => item.id === productId && item.color === color && item.size === size);

    if (index !== -1) {
        if (cart[index].quantity + quantity > stock) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }
        cart[index].quantity += quantity;
    } else {
        if (quantity > stock) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }
        cart.push({
            id: productId,
            name: productName,
            price: discountPrice || price, // Nếu có giá giảm thì dùng giá giảm
            originalPrice: price, // Lưu giá gốc để hiển thị
            discountPrice: discountPrice, // Lưu giá giảm (nếu có)
            stock: stock, // Lưu số lượng trong kho
            quantity: quantity,
            color: color,
            size: size
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Lưu vào localStorage
    alert('Đã thêm vào giỏ hàng!');
}
