/* ============================================
   FOCUS B - CONFIGURACIÓN SUPABASE
   ============================================ */

const SUPABASE_URL = "PEGA_AQUI_TU_API_URL";

const SUPABASE_KEY = "PEGA_AQUI_TU_PUBLISHABLE_KEY";


/* ============================================
   CONEXIÓN
   ============================================ */

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ============================================
   CARRITO
   ============================================ */

let cart = [];


/* ============================================
   CARGAR PRODUCTOS DESDE SUPABASE
   ============================================ */

async function loadProducts() {

    const container =
        document.getElementById("products-container");

    container.innerHTML =
        `<div class="loading">Cargando productos...</div>`;


    const { data, error } = await db
        .from("productos")
        .select("*")
        .order("id_producto", {
            ascending: true
        });


    if (error) {

        console.error("Error Supabase:", error);

        container.innerHTML = `
            <div class="loading">
                <h3>No se pudieron cargar los productos.</h3>
                <p>Revisa la conexión con Supabase.</p>
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading">
                <h3>No hay productos disponibles.</h3>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    data.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-item";


        let emoji = "🍬";

        const category =
            String(product.categoria || "").toLowerCase();

        const name =
            String(product.nombre || "").toLowerCase();


        if (
            category.includes("mora") ||
            name.includes("mora")
        ) {
            emoji = "🫐";
        }


        if (
            category.includes("limón") ||
            category.includes("limon") ||
            name.includes("limón") ||
            name.includes("limon")
        ) {
            emoji = "🍋";
        }


        card.innerHTML = `

            <div class="product-image">
                ${emoji}
            </div>

            <div class="product-content">

                <span class="product-category">
                    ${product.categoria || "Focus B"}
                </span>

                <h3>
                    ${product.nombre || "Focus B"}
                </h3>

                <p class="product-description">
                    ${product.descripcion || ""}
                </p>

                <div class="product-bottom">

                    <span class="product-price">
                        $${Number(product.precio || 0).toFixed(2)}
                    </span>

                    <button
                        class="add-button"
                        onclick='addToCart(${JSON.stringify(product)})'
                    >
                        + Agregar
                    </button>

                </div>

            </div>
        `;


        container.appendChild(card);

    });

}


/* ============================================
   AGREGAR AL CARRITO
   ============================================ */

function addToCart(product) {

    const existing =
        cart.find(
            item => item.id_producto === product.id_producto
        );


    if (existing) {

        existing.cantidad++;

    } else {

        cart.push({
            ...product,
            cantidad: 1
        });

    }


    updateCart();

    openCart();
}


/* ============================================
   ACTUALIZAR CARRITO
   ============================================ */

function updateCart() {

    const container =
        document.getElementById("cart-items");


    const count =
        document.getElementById("cart-count");


    const totalElement =
        document.getElementById("cart-total");


    const totalQuantity =
        cart.reduce(
            (sum, item) => sum + item.cantidad,
            0
        );


    count.textContent = totalQuantity;


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                🛒
                <p>Tu carrito está vacío.</p>
            </div>
        `;

        totalElement.textContent = "$0.00";

        return;
    }


    container.innerHTML = "";


    let total = 0;


    cart.forEach((item, index) => {

        const subtotal =
            Number(item.precio) * item.cantidad;


        total += subtotal;


        const div =
            document.createElement("div");


        div.className = "cart-item";


        div.innerHTML = `

            <div class="cart-item-info">

                <h4>
                    ${item.nombre}
                </h4>

                <p>
                    ${item.cantidad} ×
                    $${Number(item.precio).toFixed(2)}
                </p>

            </div>

            <div>

                <strong>
                    $${subtotal.toFixed(2)}
                </strong>

                <br>

                <button
                    onclick="removeFromCart(${index})"
                >
                    Eliminar
                </button>

            </div>
        `;


        container.appendChild(div);

    });


    totalElement.textContent =
        `$${total.toFixed(2)}`;
}


/* ============================================
   ELIMINAR
   ============================================ */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();
}


/* ============================================
   ABRIR / CERRAR CARRITO
   ============================================ */

function openCart() {

    document
        .getElementById("cart")
        .classList.add("active");


    document
        .getElementById("cart-overlay")
        .classList.add("active");
}


function closeCart() {

    document
        .getElementById("cart")
        .classList.remove("active");


    document
        .getElementById("cart-overlay")
        .classList.remove("active");
}


/* ============================================
   FINALIZAR COMPRA
   ============================================ */

async function checkout() {

    if (cart.length === 0) {

        alert("Tu carrito está vacío.");

        return;
    }


    alert(
        "El carrito funciona correctamente. " +
        "En el siguiente paso conectaremos " +
        "el formulario de cliente con la tabla ventas de Supabase."
    );
}


/* ============================================
   INICIAR
   ============================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        updateCart();

    }
);
