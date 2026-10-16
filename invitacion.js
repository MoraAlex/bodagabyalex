/* =========================================================================
   Invitación personalizada — Gaby & Alex
   Rutas soportadas:
     /invitacion/:token          (ruta limpia, requiere rewrite en servidor)
     /#/invitacion/:token        (hash routing, funciona sin config de servidor)
     /?token=:token              (query param como fallback)
   Los tokens viven en invitados.js (generado desde badinvites.txt).
   ========================================================================= */

// Número de WhatsApp al que llegan las confirmaciones.
// Código de país incluido, sin '+', espacios ni guiones.
const WHATSAPP_NUMERO = "523316943732";

// Qué se muestra cuando el link no trae token o el token no existe.
const INVITADO_GENERICO = {
    nombre: "",
    saludo: "",
    pases: 0,
    pasesTexto: "Nos encantaría contar con tu presencia.",
    mensaje:
        "Acompáñanos a poner este tercer hilo, que es nuestra fe.\nNos harías un gran favor si confirmas tu asistencia.",
    confirmacion: "¡Hola! Confirmo mi asistencia a la boda de Gaby y Alex.",
    acompañantes: [],
};

function obtenerTokenDeURL() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;

    // 1. Ruta limpia: /invitacion/:token
    const pathMatch = path.match(/\/invitacion\/([a-z0-9]+)/i);
    if (pathMatch && pathMatch[1]) {
        return pathMatch[1].toLowerCase();
    }

    // 2. Hash routing: /#/invitacion/:token
    if (hash && hash.startsWith("#")) {
        const hashPath = hash.slice(1);
        const hashMatch = hashPath.match(/\/invitacion\/([a-z0-9]+)/i);
        if (hashMatch && hashMatch[1]) {
            return hashMatch[1].toLowerCase();
        }
        // Legacy: solo hash directo (#token)
        const directHash = hash.slice(1).toLowerCase();
        if (directHash && !directHash.includes("/")) {
            return directHash;
        }
    }

    // 3. Query param: ?token=xxx
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");
    if (tokenParam) {
        return tokenParam.trim().toLowerCase();
    }

    // 4. Legacy query param: ?id=xxx (numérico)
    const idParam = params.get("id");
    if (idParam && /^\d+$/.test(idParam.trim())) {
        return "id:" + idParam.trim();
    }

    return "";
}

function obtenerInvitado() {
    const token = obtenerTokenDeURL();
    const lista = window.INVITADOS || {};

    // Búsqueda directa por token (clave del diccionario)
    if (token && !token.startsWith("id:") && lista[token]) {
        return lista[token];
    }

    // Búsqueda por token en el campo token del objeto (por si se accede directo al objeto)
    if (token && !token.startsWith("id:")) {
        const porToken = Object.values(lista).find(
            (inv) => inv.token === token,
        );
        if (porToken) return porToken;
    }

    // Búsqueda legacy por ID numérico
    if (token.startsWith("id:")) {
        const id = token.slice(3);
        const porNumero = Object.values(lista).find(
            (inv) => String(inv.id) === id,
        );
        if (porNumero) return porNumero;
    }

    // Fallback genérico
    return INVITADO_GENERICO;
}

function enlaceWhatsApp(invitado) {
    const texto = encodeURIComponent(
        invitado.confirmacion || INVITADO_GENERICO.confirmacion,
    );
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
}

function textoBoletos(pases) {
    if (typeof pases !== "number" || pases <= 0) return "";
    const numeros = [
        "cero",
        "un",
        "dos",
        "tres",
        "cuatro",
        "cinco",
        "seis",
        "siete",
        "ocho",
        "nueve",
        "diez",
    ];
    const palabra = numeros[pases] || pases;
    return `Tienes ${palabra} boleto${pases > 1 ? "s" : ""}`;
}

function personalizarInvitacion() {
    const invitado = obtenerInvitado();

    const envelopeGreeting = document.getElementById("envelope-greeting");
    const envelopePasses = document.getElementById("envelope-passes");
    if (envelopeGreeting) {
        envelopeGreeting.textContent = invitado.saludo
            ? `Hola,\u00A0 ${invitado.saludo}`
            : "Estás invitado";
    }
    if (envelopePasses) {
        if (invitado.pases) {
            envelopePasses.textContent = textoBoletos(invitado.pases);
        } else if (invitado.pasesTexto) {
            envelopePasses.textContent = invitado.pasesTexto;
        } else {
            envelopePasses.textContent = "Acompáñanos a celebrar";
        }
    }

    const insideGreeting = document.getElementById("envelope-inside-greeting");
    const insidePasses = document.getElementById("envelope-inside-passes");
    if (insideGreeting) {
        insideGreeting.textContent = invitado.saludo
            ? `Hola, ${invitado.saludo}`
            : "Nos encantaría contar contigo";
    }
    if (insidePasses) {
        if (invitado.pases) {
            insidePasses.textContent = textoBoletos(invitado.pases);
        } else if (invitado.pasesTexto) {
            insidePasses.textContent = invitado.pasesTexto;
        }
    }

    const saludo = document.getElementById("saludo-invitado");
    if (saludo) {
        saludo.textContent = invitado.saludo
            ? `Hola, ${invitado.saludo}`
            : "Nos encantaría contar contigo";
    }

    const mensaje = document.getElementById("mensaje-invitado");
    if (mensaje) {
        const texto = (invitado && invitado.mensaje) ? invitado.mensaje : INVITADO_GENERICO.mensaje;
        mensaje.textContent = (invitado && invitado.saludo)
            ? texto.replace(`Hola, ${invitado.saludo}, `, "")
            : texto;
    }

    const pases = document.getElementById("pases-invitado");
    if (pases) pases.textContent = invitado.pasesTexto || "";

    const boton = document.getElementById("btn-whatsapp");
    if (boton) boton.setAttribute("href", enlaceWhatsApp(invitado));

    if (invitado.saludo) {
        document.title = `${invitado.saludo} | Boda Gaby & Alex`;
    }
}

document.addEventListener("DOMContentLoaded", personalizarInvitacion);