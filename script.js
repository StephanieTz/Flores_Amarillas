// --- 1. CONFIGURACIÓN DE CAPAS ---
const capaFondo = document.getElementById('capaFondo');
const ctxFondo = capaFondo.getContext('2d');
const capaFlores = document.getElementById('capaFlores');
const ctxFlores = capaFlores.getContext('2d');

let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

function resize() {
    capaFondo.width = window.innerWidth;
    capaFondo.height = window.innerHeight;
    capaFlores.width = window.innerWidth;
    capaFlores.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- 2. ESTRELLAS ---
const estrellas = [];
for (let i = 0; i < 200; i++) {
    estrellas.push({
        x: Math.random() * capaFondo.width,
        y: Math.random() * capaFondo.height,
        r: Math.random() * 1.5,
        a: Math.random() * 0.5 + 0.5,
        s: Math.random() * 0.02 + 0.01
    });
}

// --- 3. FLORES ---
const flores = [];
class Flor {
    constructor() {
        this.x = Math.random() * capaFlores.width;
        this.y = Math.random() * capaFlores.height;
        this.size = Math.random() * 15 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    draw() {
        ctxFlores.save();
        ctxFlores.translate(this.x, this.y);
        ctxFlores.rotate(this.angle);
        ctxFlores.shadowBlur = 20;
        ctxFlores.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctxFlores.fillStyle = '#FFD700';
        for (let i = 0; i < 5; i++) {
            ctxFlores.beginPath();
            ctxFlores.ellipse(0, -this.size * 0.6, this.size * 0.4, this.size * 0.8, 0, 0, Math.PI * 2);
            ctxFlores.fill();
            ctxFlores.rotate((Math.PI * 2) / 5);
        }
        ctxFlores.beginPath();
        ctxFlores.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctxFlores.fillStyle = '#FFA500';
        ctxFlores.fill();
        ctxFlores.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;

        if (this.x < 0 || this.x > capaFlores.width) this.vx *= -1;
        if (this.y < 0 || this.y > capaFlores.height) this.vy *= -1;

        if (mouse.x != null && mouse.y != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (150 - distance) / 150;
                this.x -= forceDirectionX * force * 3;
                this.y -= forceDirectionY * force * 3;
            }
        }
    }
}
for (let i = 0; i < 30; i++) flores.push(new Flor());

function animate() {
    ctxFondo.clearRect(0, 0, capaFondo.width, capaFondo.height);
    estrellas.forEach(e => {
        e.a += e.s;
        if (e.a > 1 || e.a < 0.2) e.s *= -1;
        ctxFondo.beginPath();
        ctxFondo.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctxFondo.fillStyle = `rgba(255, 255, 255, ${e.a})`;
        ctxFondo.fill();
    });

    ctxFlores.clearRect(0, 0, capaFlores.width, capaFlores.height);
    flores.forEach(f => {
        f.update();
        f.draw();
    });

    requestAnimationFrame(animate);
}
animate();

// --- 4. LÓGICA DE LA CARTA (MÚLTIPLES HOJAS) ---
const sobre = document.getElementById('sobre');
const solapa = document.querySelector('.solapa-sobre');
const btnAbrir = document.getElementById('btnAbrir');
const cartasContenedor = document.getElementById('cartasContenedor');
const escenaFinal = document.getElementById('escenaFinal');
const tituloPrincipal = document.getElementById('tituloPrincipal');

// Array con todas las cartas
const cartas = [
    document.getElementById('carta1'),
    document.getElementById('carta2'),
    document.getElementById('carta3'),
    document.getElementById('carta4')
];

let indiceActual = 0; // Índice de la carta que está al frente
let sobreAbierto = false;

// Función para actualizar los z-index y posiciones
function actualizarCartas() {
    cartas.forEach((carta, index) => {
        if (index === indiceActual) {
            // Carta al frente
            gsap.to(carta, {
                zIndex: 10,
                scale: 1,
                yPercent: 0,
                rotation: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        } else if (index < indiceActual) {
            // Cartas que ya pasaron (se van al fondo)
            gsap.to(carta, {
                zIndex: 1 + index,
                scale: 0.9,
                yPercent: 15 + (index * 5),
                rotation: (index % 2 === 0 ? 5 : -5),
                opacity: 0.4,
                duration: 0.6,
                ease: "power2.inOut"
            });
        } else {
            // Cartas que aún no se han visto (detrás)
            gsap.to(carta, {
                zIndex: 5 - index,
                scale: 0.95,
                yPercent: 5 * (index - indiceActual),
                rotation: (index % 2 === 0 ? -3 : 3),
                opacity: 0.6,
                duration: 0.6,
                ease: "power2.inOut"
            });
        }
    });
}

// Abrir el sobre
btnAbrir.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sobreAbierto) return;
    sobreAbierto = true;

    gsap.to(btnAbrir, { opacity: 0, duration: 0.3, onComplete: () => btnAbrir.style.display = 'none' });

    gsap.to(solapa, {
        rotationX: 180,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
            gsap.to(sobre, { opacity: 0, duration: 0.5, delay: 0.2, onComplete: () => sobre.style.display = 'none' });
            
            gsap.to(cartasContenedor, {
                opacity: 1,
                duration: 0.5,
                delay: 0.5,
                onStart: () => {
                    cartasContenedor.style.pointerEvents = 'auto';
                    // Mostrar la primera carta con animación
                    gsap.fromTo(cartas[0], 
                        { yPercent: 30, scale: 0.8, opacity: 0 }, 
                        { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" }
                    );
                    // Asegurar que las demás estén en su sitio
                    actualizarCartas();
                }
            });
        }
    });
});

// Botones "Siguiente"
document.querySelectorAll('.btn-siguiente').forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (indiceActual < cartas.length - 1) {
            indiceActual++;
            actualizarCartas();
        }
    });
});

// Botón "Cerrar" (última hoja)
document.getElementById('btnCerrar').addEventListener('click', (e) => {
    e.stopPropagation();
    
    // 1. Guardar todas las cartas en el sobre (animación)
    gsap.to(cartasContenedor, {
        y: 100,
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
            cartasContenedor.style.display = 'none';
            
            // 2. Mostrar la escena final
            gsap.to(escenaFinal, {
                opacity: 1,
                duration: 1,
                delay: 0.5,
                onStart: () => {
                    escenaFinal.style.pointerEvents = 'auto';
                }
            });
            
            // 3. Ocultar el título principal para que no estorbe
            gsap.to(tituloPrincipal, { opacity: 0, duration: 0.5 });
        }
    });
});

// Inicializar posiciones
actualizarCartas();