// --- Scroll Reveal Animations (Intersection Observer) ---
document.addEventListener('DOMContentLoaded', () => {
    // Observer for pop-in and slide animations
    const observerOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add show class which triggers the CSS keyframes
                entry.target.classList.add('show');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.hidden').forEach((el) => {
        observer.observe(el);
    });

    // Mobile menu toggle logic
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
                mobileBtn.innerHTML = '☰';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '60px';
                navLinks.style.backgroundColor = '#fcefe3';
                navLinks.style.width = '100%';
                navLinks.style.left = '0';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '4px solid #1e1e24';
                mobileBtn.innerHTML = '✖';
            }
        });
    }
});

// --- Theme Colors for 3D Objects ---
const themeColors = [
    0xff85ff, // pop-pink
    0x70d6ff, // pop-blue
    0xffec5c, // pop-yellow
    0x00ffca, // pop-green
    0xc7a1ff  // pop-purple
];
const inkColor = 0x1e1e24; // black outlines

// Function to create a Toon-styled Mesh
function createToonMesh(geometry, colorHex) {
    const group = new THREE.Group();

    // The solid colored interior material
    const material = new THREE.MeshLambertMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // The thick black brutalist outline
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: inkColor, linewidth: 2 });
    const lines = new THREE.LineSegments(edges, lineMaterial);
    
    // Slight scale up for the outline to make it thicker/visible
    lines.scale.set(1.02, 1.02, 1.02);
    group.add(lines);

    return group;
}

// --- Three.js Background Animation (Floating Geometric Shapes) ---
const initBackground = () => {
    const canvasBg = document.getElementById('bg-canvas');
    if (!canvasBg) return;

    const sceneBg = new THREE.Scene();
    
    // Add light to make colors pop
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    sceneBg.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    sceneBg.add(dirLight);

    const cameraBg = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraBg.position.z = 40;

    const rendererBg = new THREE.WebGLRenderer({ canvas: canvasBg, alpha: true, antialias: true });
    rendererBg.setSize(window.innerWidth, window.innerHeight);
    rendererBg.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performant

    const objects = [];
    const geometries = [
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.ConeGeometry(2, 4, 8),
        new THREE.IcosahedronGeometry(2.5, 0),
        new THREE.TorusGeometry(2, 0.8, 8, 16),
        new THREE.OctahedronGeometry(2.5, 0)
    ];

    const objectCount = 30;

    // Create floating shapes
    for (let i = 0; i < objectCount; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const color = themeColors[Math.floor(Math.random() * themeColors.length)];
        
        const meshGroup = createToonMesh(geo, color);

        // Random positions spreading over screen
        meshGroup.position.x = (Math.random() - 0.5) * 80;
        meshGroup.position.y = (Math.random() - 0.5) * 120;
        meshGroup.position.z = (Math.random() - 0.5) * 50 - 10;

        // Random rotation
        meshGroup.rotation.x = Math.random() * Math.PI;
        meshGroup.rotation.y = Math.random() * Math.PI;

        // Custom properties for animation
        meshGroup.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: (Math.random() * 0.02) + 0.01,
            startY: meshGroup.position.y
        };

        sceneBg.add(meshGroup);
        objects.push(meshGroup);
    }

    // Interactive Scroll Parallax tracking
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Mouse movement interactive tracking
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animateBg() {
        requestAnimationFrame(animateBg);
        
        const time = clock.getElapsedTime();

        // Animate all background shapes
        objects.forEach((obj, idx) => {
            // Constant rotation
            obj.rotation.x += obj.userData.rotSpeedX;
            obj.rotation.y += obj.userData.rotSpeedY;

            // Bobbing up and down + scroll offset
            // When user scrolls down, shapes move UP
            const scrollOffset = scrollY * 0.03;
            obj.position.y = obj.userData.startY + Math.sin(time + idx) * 2 + scrollOffset;
            
            // Push away slightly based on mouse
            obj.position.x += mouseX * 0.05;
        });
        
        // Gentle camera sway
        cameraBg.position.x += (mouseX * 5 - cameraBg.position.x) * 0.05;
        cameraBg.position.y += (mouseY * 5 - cameraBg.position.y) * 0.05;

        rendererBg.render(sceneBg, cameraBg);
    }
    animateBg();

    window.addEventListener('resize', () => {
        cameraBg.aspect = window.innerWidth / window.innerHeight;
        cameraBg.updateProjectionMatrix();
        rendererBg.setSize(window.innerWidth, window.innerHeight);
    });
};

// --- Three.js Skills Interactive Fun Object ---
const initSkillInteractive = () => {
    const container = document.getElementById('cube-container');
    if(!container) return;

    const scene = new THREE.Scene();
    
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 12;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Lights for 3D play object
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Create a fun combined geometry (A sphere embedded in a torus)
    const compositeGroup = new THREE.Group();
    
    // Torus in pink
    const geo1 = new THREE.TorusGeometry(3, 1, 16, 32);
    const mesh1 = createToonMesh(geo1, themeColors[0]);
    compositeGroup.add(mesh1);
    
    // Sphere in yellow
    const geo2 = new THREE.DodecahedronGeometry(1.8, 0);
    const mesh2 = createToonMesh(geo2, themeColors[2]);
    compositeGroup.add(mesh2);

    scene.add(compositeGroup);
    
    // Drag variables for interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = { x: 0.01, y: 0.01 }; // initial auto-spin
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
    });
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            
            dragVelocity.x = deltaMove.x * 0.005;
            dragVelocity.y = deltaMove.y * 0.005;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    
    // Same for touch
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    container.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.touches[0].clientX - previousMousePosition.x,
                y: e.touches[0].clientY - previousMousePosition.y
            };
            dragVelocity.x = deltaMove.x * 0.005;
            dragVelocity.y = deltaMove.y * 0.005;
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchend', () => { isDragging = false; });

    function animateCube() {
        requestAnimationFrame(animateCube);
        
        // Apply rotation based on velocity
        compositeGroup.rotation.y += dragVelocity.x;
        compositeGroup.rotation.x += dragVelocity.y;
        
        // Add a fun bounce effect on hover/scale
        const time = Date.now() * 0.003;
        compositeGroup.scale.set(
            1 + Math.sin(time) * 0.05,
            1 + Math.sin(time + 1) * 0.05,
            1 + Math.sin(time + 2) * 0.05
        );
        
        // Slowly dampen the velocity if not dragging (inertia)
        if (!isDragging) {
            dragVelocity.x += (0.01 - dragVelocity.x) * 0.02; // Return to gentle auto-spin
            dragVelocity.y += (0.01 - dragVelocity.y) * 0.02;
        }
        
        renderer.render(scene, camera);
    }
    
    animateCube();
    
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if(newWidth === 0) return;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
};

// Start everything up!
initBackground();
initSkillInteractive();
