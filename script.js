/* ============================================
   FOCUS B - SUPABASE
   ============================================ */

const SUPABASE_URL =
    "https://yzrrsdihccbgccqgjoux.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_lNxUrW2aAcjYXEUswq4R8Q_B5qeEKUO";


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
   CARGAR PRODUCTOS
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

        console.error(error);

        container.innerHTML = `
            <div class="loading">
                <h3>No se pudieron cargar los productos.</h3>
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

        const card =
            document.createElement("article");

        card.className = "product-item";


        let emoji = "🍬";

        const category =
            String(product.categoria || "")
                .toLowerCase();

        const name =
            String(product.nombre || "")
                .toLowerCase();


        if (
            category.includes("mora") ||
            name.includes("mora")
        ) {
            emoji = "🫐";
        }


        if (
            category.includes("maracuyá") ||
            category.includes("maracuya") ||
            name.includes("maracuyá") ||
            name.includes("maracuya")
        ) {
            emoji = "🥭";
        }


        if (
            category.includes("limón") ||
            category.includes("limon") ||
            name.includes("limón") ||
            name.includes("limon")
        ) {
            emoji = "🍋";
        }


        if (
            category.includes("guayusa") ||
            name.includes("guayusa")
        ) {
            emoji = "🌿";
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
            item =>
                item.id_producto ===
                product.id_producto
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
            (sum, item) =>
                sum + item.cantidad,
            0
        );


    count.textContent =
        totalQuantity;


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                🛒
                <p>Tu carrito está vacío.</p>
            </div>
        `;

        totalElement.textContent =
            "$0.00";

        return;
    }


    container.innerHTML = "";


    let total = 0;


    cart.forEach((item, index) => {

        const subtotal =
            Number(item.precio) *
            item.cantidad;


        total += subtotal;


        const div =
            document.createElement("div");


        div.className =
            "cart-item";


        div.innerHTML = `

            <div class="cart-item-info">

                <h4>
                    ${item.nombre}
                </h4>

                <p>
                    ${item.cantidad}
                    ×
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
   ELIMINAR PRODUCTO
   ============================================ */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();
}


/* ============================================
   CARRITO
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


    /*
       FORMULARIO DEL CLIENTE
    */

    const nombre =
        prompt("Escribe tu nombre:");

    if (!nombre) {
        return;
    }


    const ciudad =
        prompt("Escribe tu ciudad:");

    if (!ciudad) {
        return;
    }


    const telefono =
        prompt("Escribe tu teléfono:");

    if (!telefono) {
        return;
    }


    /*
       BUSCAR CLIENTE
    */

    let cliente = null;


    const { data: clientesExistentes, error: errorBusqueda } =
        await db
            .from("clientes")
            .select("*")
            .eq("telefono", telefono)
            .limit(1);


    if (errorBusqueda) {

        console.error(errorBusqueda);

        alert(
            "No se pudo consultar el cliente."
        );

        return;
    }


    if (
        clientesExistentes &&
        clientesExistentes.length > 0
    ) {

        cliente =
            clientesExistentes[0];

    } else {

        /*
           CREAR NUEVO CLIENTE
        */

        const { data: nuevoCliente, error } =
            await db
                .from("clientes")
                .insert({
                    nombre: nombre,
                    ciudad: ciudad,
                    telefono: telefono
                })
                .select()
                .single();


        if (error) {

            console.error(error);

            alert(
                "No se pudo registrar el cliente."
            );

            return;
        }


        cliente =
            nuevoCliente;
    }


    /*
       REGISTRAR CADA PRODUCTO
       COMO UNA VENTA
    */

    for (const item of cart) {

        const total =
            Number(item.precio) *
            item.cantidad;


        const { error } =
            await db
                .from("ventas")
                .insert({

                    id_producto:
                        item.id_producto,

                    id_cliente:
                        cliente.id_cliente,

                    fecha:
                        new Date().toISOString(),

                    cantidad:
                        item.cantidad,

                    precio_unitario:
                        Number(item.precio),

                    total:
                        total
                });


        if (error) {

            console.error(error);

            alert(
                "El cliente fue registrado, " +
                "pero ocurrió un error al registrar la venta."
            );

            return;
        }

    }


    /*
       ÉXITO
    */

    cart = [];

    updateCart();


    alert(
        "¡Compra registrada correctamente! 🎉\n\n" +
        "Tu pedido ha sido registrado en Focus B."
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
