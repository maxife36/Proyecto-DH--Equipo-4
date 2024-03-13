/*cartIcon ya viene declarado de header-controller*/
// const cartIcon = document.querySelector(".cart-icon")

const sideCartContainer = document.querySelector(".sideCart-container")
const sideCartBackground = document.querySelector(".sideCart-background")
const backgroundOpacity = document.querySelector(".background-opacity")
const scProductContainer = document.querySelector(".sc-product-container")
const scShippingContainer = document.querySelector(".sc-shipping-container")
const scTotalContainer = document.querySelector(".sc-total-container")
const scShippingDistance = document.querySelector("#shippingDistance")
const scShippingTotal = document.querySelector(".sc-shipping-subtotal")
const cartForm = document.querySelector("#cartForm")
const pickupBtn = document.querySelector("#pickupBtn")
const cartExitBtn = document.querySelector("#cartExit")
const postalCodeBtn = document.querySelector("#postalCode")
const DOMpickupPlace = document.querySelector("#pickupPlace")
const modalMappBackground = document.querySelector(".modalMapp-background")
const radioStorePickup = document.querySelector("#storePickup")
const radioHomeDelivery = document.querySelector("#homeDelivery")

let sideCartFlag = false

/* ---- LISTENERS FUNCTIONS---- */
cartIcon.addEventListener("click", () => {
    const viewportWidth = window.innerWidth

    sideCartFlag = sideCartFlag ? false : true

    if (sideCartFlag) {
        sideCartContainer.style.width = viewportWidth >= 440 ? "440px" : "100vw"
        backgroundOpacity.style.width = "100vw"
        sideCartBackground.style.transform = "scale(4000)"
        scProductContainer.style.opacity = 1
        scShippingContainer.style.opacity = 1
        scTotalContainer.style.opacity = 1
    } else {
        sideCartContainer.style.width = "0px"
        backgroundOpacity.style.width = "0px"
        sideCartBackground.style.transform = "scale(1)"
        scProductContainer.style.opacity = 0
        scShippingContainer.style.opacity = 0
        scTotalContainer.style.opacity = 0
    }

})

backgroundOpacity.addEventListener("click", () => {

    sideCartContainer.style.width = "0px"
    backgroundOpacity.style.width = "0px"
    sideCartBackground.style.transform = "scale(1)"
    scProductContainer.style.opacity = 0
    scShippingContainer.style.opacity = 0
    scTotalContainer.style.opacity = 0

    sideCartFlag = false

})

cartExitBtn.addEventListener("click", () => {

    sideCartContainer.style.width = "0px"
    backgroundOpacity.style.width = "0px"
    sideCartBackground.style.transform = "scale(1)"
    scProductContainer.style.opacity = 0
    scShippingContainer.style.opacity = 0
    scTotalContainer.style.opacity = 0

    sideCartFlag = false
})

cartForm.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Evitar que el formulario se envíe al presionar "Enter"
    }
})

/* ---- ATTRIBUTES FUNCTIONS---- */

const deleteProduct = async (event) => {
    try {
        const target = event.target

        let productCard = target.parentNode.parentNode

        //Este if busca poder reutilizar la funcion con diferentes events
        if (target.classList.contains("sc-delete-product")) {
            productCard = target.parentNode 
        }
        
        const productCardContainer = productCard.parentNode //es el div que contiene todas las cards del producto
        const cartProductId = productCard.querySelector("#cartProductId").value

        const apiURL = `/cart/deleteProduct/${cartProductId}`

        const resultJSON = await fetch(apiURL, {
            method: 'DELETE'
        })
        const result = await resultJSON.json()

        if (!result[0]) return console.log(result[1]);// si no se elimina de la base de dato, no permito que se elimine del container

        productCardContainer.removeChild(productCard)

        updateTotal()

        // Cambio de cart Icon correspondiente
        const scProductId = productCard.querySelector("#productId").value

        const allProductsCards = document.querySelectorAll(".tarjeta-articulo")

        if (allProductsCards.length) {
            for (const productCard of allProductsCards) {
                const productId = productCard.querySelector("#productId").value
        
                if (scProductId === productId) {
                    const cartIcon = productCard.querySelector(".cart-icon")
                    cartIcon.style.color = "var(--azul-gotec)"
                }
            }    
        }
    } catch (err) {
        console.log("ERROR fn : deleteProduct ", err.message);
    }
}

const updateProduct = async (event, quantityParam) => {
    const productCard = event.target.parentNode.parentNode
    const inputQuantity = productCard.querySelector(".quantity-input")
    const cartProductId = productCard.querySelector("#cartProductId").value
    const productId = productCard.querySelector("#productId").value
    const productSubTotal = productCard.querySelector(".sc-product-subtotal")
    const quantity = quantityParam ? quantityParam : Number(inputQuantity.value)

    if (!quantity || quantity <= 0) quantity = 1

    const updateData = {
        cartProductId,
        productId,
        currentQuantity: quantity,
    };

    const resultJSON = await fetch("/cart/updateQuantity", {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
    })

    const result = await resultJSON.json()

    if (!result[0]) return console.log(result[1]);// si no se modifica en la base de dato, no permito que se cambie sus datos en el front 

    inputQuantity.value = result[1].quantity
    productSubTotal.textContent = result[1].total

    updateTotal()
}

const changeQuantity = (event, action) => {
    const productCard = event.target.parentNode.parentNode
    const inputQuantity = productCard.querySelector(".quantity-input")
    let quantity = Number(inputQuantity.value)

    if (quantity && quantity >= 1) {
        if (action) {
            quantity++
        } else {
            quantity--
        }

        updateProduct(event, quantity)
    }
}

const enterAction = (event) => {
    const inputQuantity = event.target
    inputQuantity.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            let quantity = Number(inputQuantity.value)

            if (quantity && quantity >= 1) updateProduct(event, quantity)

        }
    })
}


/*  CONFIGURACION DEL MAPA LEAFET */

const mapGenerator = (title) => {
    modalMappBackground.style.width = "100vw"
    modalMappBackground.style.height = "100vh"
    modalMappBackground.innerHTML = `
    <section class="mapContainer flx-c-nw">
        <i class="fa-solid fa-x" id="mapExit"></i>
        <p class="mapTitle flx-r-nw">${title}</p>
        <div id="pickupMap"></div>
    </section>
    `

    //Defino cual es el div que contendra el mapa pasando su div id
    const pickupMap = L.map("pickupMap")

    //Establezco que tipo de mapa se usara y se lo agrega al mapa
    const tileURL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    const tileLyer = L.tileLayer(tileURL, { maxZoom: 17, minZoom: 7 })

    tileLyer.addTo(pickupMap);

    //Pido permisos para utilizar el geolocalizador del navegador y establezco coordenadas segun su posicion
    pickupMap.locate({ enableHightAccuray: true })

    pickupMap.on("locationfound", event => {
        const coords = [event.latitude, event.longitude]
        pickupMap.setView([-27.802464, -64.256750], 13)
    })

    //En caso de no dar permiso el mapa se centra en coordenada spor defecto
    pickupMap.on("locationerror", e => {
        // Coordenadas por defecto
        const defaultCoords = [-27.761248, -64.252999];
        pickupMap.setView(defaultCoords, 12.5);
    });

    return pickupMap

}

const shippingCalculator = (distance) => {
    if (distance <= 300) {
        // Parte lineal
        const pendiente = (5000 - 800) / 300;
        const precio = pendiente * distance + 800;
        return Math.max(precio, 800);
    } else if (distance <= 1000) {
        // Parte lineal
        const pendiente = (10000 - 5000) / 1000;
        const precio = pendiente * distance + 5000;
        return Math.max(precio, 5000);
    } else if (distance <= 2000) {
        // Parte lineal
        const pendiente = (18000 - 10000) / 2000;
        const precio = pendiente * distance + 10000;
        return Math.max(precio, 10000);
    } else {
        return 20000;
    }
}

pickupBtn.addEventListener("click", () => {
    if (!radioHomeDelivery.checked && !radioStorePickup.checked) radioStorePickup.checked = true

    if (radioHomeDelivery.checked) {
        radioHomeDelivery.checked = false
        radioStorePickup.checked = true
    }

    if (radioStorePickup.checked) {

        // Cargo el mapa en el cual se inyectaran los markers
        const freePickup = mapGenerator("Punto de Recolección")

        // titulo del mapa
        const mapTitle = document.querySelector(".mapTitle")

        console.log(mapTitle);

        //Establezco coordenadas de pickups 
        const pickupCoords = {
            oca: {
                lat: -27.778042262966565,
                lng: -64.26787961025269,
                title: "OCA SRL"
            },
            andreani: {
                lat: -27.788891927602023,
                lng: -64.2617887489563,
                title: "Andreani"
            },
            correoArgSgo: {
                lat: -27.787877303545834,
                lng: -64.25623976550744,
                title: "Correo Arg. Sgo. del Estero"
            },
            correoArgBanda: {
                lat: -27.734103579415624,
                lng: -64.24240627786992,
                title: "Correo Arg. La Banda"
            },
        }

        for (const pickupPlace in pickupCoords) {
            const pickupObj = pickupCoords[pickupPlace]

            const marker = L.marker([pickupObj.lat, pickupObj.lng])
            marker.bindTooltip(pickupObj.title).openTooltip()
            marker.addTo(freePickup)

            //Agrego listener por cada amarcador
            marker.on('click', function (e) {
                // Recuperar la posición y titulo del marcador
                const position = marker.getLatLng();
                const title = marker.getTooltip().getContent();

                DOMpickupPlace.value = title
                modalMappBackground.style.width = "0px"
                modalMappBackground.style.height = "0px"
                closeBtnMap.style.display = "none"
                mapTitle.style.display = "none"


                //Actualizacion de distancia de envio
                scShippingDistance.value = 0

                //Actualizacion del valor de envio
                scShippingTotal.textContent = 0

                updateTotal()
            })
        }

        //Establezco listener para cerrar el modal
        const closeBtnMap = document.querySelector("#mapExit")

        closeBtnMap.addEventListener("click", () => {
            modalMappBackground.style.width = "0px"
            modalMappBackground.style.height = "0px"
            closeBtnMap.style.display = "none"
            mapTitle.style.display = "none"
        })
    }

})

postalCodeBtn.addEventListener("click", () => {
    if (!radioHomeDelivery.checked && !radioStorePickup.checked) {
        DOMpickupPlace.value = ""
        radioHomeDelivery.checked = true
    }

    if (radioStorePickup.checked) {
        DOMpickupPlace.value = ""
        radioStorePickup.checked = false
        radioHomeDelivery.checked = true
    }

    if (radioHomeDelivery.checked) {
        //Flag de control para que se pueda colcoar un solo marker
        let markerFlag = false
        // Cargo el mapa en el cual se inyectaran los markers
        const customeMap = mapGenerator("Envio a Domicilio")

        // titulo del mapa
        const mapTitle = document.querySelector(".mapTitle")

        // Agrego un marcador para la ubicación inicial
        const defaultMarker = L.marker([-27.847419, -64.265505])

        // variable que guardara la lat y long del pin que coloque el usuario, su respectivo marcador, y la distancia con el maracdoir por defecto
        let userLatLng = null
        let userMarker = null
        let shippingDistance = 0

        // Agregar un control de click para colocar marcadores
        customeMap.on('click', function (event) {
            if (markerFlag) userMarker.remove()

            userLatLng = event.latlng;
            userMarker = L.marker(userLatLng).addTo(customeMap);

            // Calculo la distancia entre el marcador del usuario y el marcador por defecto
            shippingDistance = defaultMarker.getLatLng().distanceTo(userLatLng) / 1000; // Convierto a kilómetros
            scShippingDistance.value = shippingDistance

            //Calculo del precio de envio
            const shippingPrice = shippingCalculator(shippingDistance)
            //Actualizacion del valor de envio
            scShippingTotal.textContent = shippingPrice.toFixed(2)

            updateTotal()

            markerFlag = true

        });

        //Establezco listener para cerrar el modal
        const closeBtnMap = document.querySelector("#mapExit")

        closeBtnMap.addEventListener("click", () => {
            modalMappBackground.style.width = "0px"
            modalMappBackground.style.height = "0px"
            closeBtnMap.style.display = "none"
            mapTitle.style.display = "none"

        })
    }
})

/*  ACTUALIZACION DEL TOTAL DE COMPRA */

function updateTotal() {
    const allProductsTotals = document.querySelectorAll(".sc-product-subtotal")
    const shippingPrice = document.querySelector(".sc-shipping-subtotal")
    const totalCart = document.querySelector(".sc-total")

    let totalProducts = 0

    if (allProductsTotals.length) {
        const allProductsPrice = []

        for (const pObj of allProductsTotals) {
            allProductsPrice.push(Number(pObj.textContent))
        }

        totalProducts = allProductsPrice.reduce((acum, value) => {
            return acum + value
        }, 0);
    }

    totalCart.textContent = (totalProducts + Number(shippingPrice.textContent)).toFixed(2)

}

//Ejecuto esta funcion para que actualice el total del carrito en la primer carga
updateTotal()


