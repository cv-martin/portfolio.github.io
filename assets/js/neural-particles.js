
/**
 * 2026 Neural Network Particle Animation
 * Features:
 * - Responsive canvas resizing
 * - Mouse interaction (repulsion/connection)
 * - Constellation effect (connecting lines)
 * - Optimized for performance (requestAnimationFrame)
 */

const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;

// Get colors from CSS variables for consistency
const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const primaryColor = '#38bdf8'; // Fallback or fetch from var(--primary-color)

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 80) * (canvas.width / 80)
}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Create Particle Class
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color; 
        ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
        // Check if particle is still within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Check collision detection - mouse position / particle position
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 10;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 10;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 10;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 10;
            }
        }
        
        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;

        // Draw particle
        this.draw();
    }
}

// Create particle array
function init() {
    particlesArray = [];
    // Optimize for mobile: fewer particles on small screens
    const particleDensity = window.innerWidth < 768 ? 15000 : 9000;
    let numberOfParticles = (canvas.height * canvas.width) / particleDensity;
    
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 1; // Speed
        let directionY = (Math.random() * 2) - 1;
        let color = '#38bdf8'; // Electric Blue

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Check if particles are close enough to draw line between them
function connect() {
    let opacityValue = 1;
    const maxDistance = 150; // Fixed max distance for better predictability
    const maxDistanceSq = maxDistance * maxDistance;

    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const p1 = particlesArray[a];
            const p2 = particlesArray[b];
            
            let dx = p1.x - p2.x;
            let dy = p1.y - p2.y;
            let distanceSq = dx * dx + dy * dy;

            if (distanceSq < maxDistanceSq) {
                let distance = Math.sqrt(distanceSq);
                opacityValue = 1 - (distance / maxDistance);
                
                ctx.strokeStyle = `rgba(56, 189, 248, ${opacityValue * 0.5})`; // Slightly more subtle
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
let lastTime = 0;
function animate(timestamp) {
    // Limit to ~60fps if needed, though browser handles this naturally
    requestAnimationFrame(animate);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// Resize event
window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = ((canvas.height/80) * (canvas.height/80));
    init();
});

// Run
init();
animate();
