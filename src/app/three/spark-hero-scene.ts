import * as THREE from 'three';

// Loop: sphere → akroma → sphere → instagram → sphere → linkedin → sphere → facebook → repeat
const SPHERE_DURATION = 3.2;
const MORPH_DURATION  = 1.6;
const LOGO_DURATION   = 2.4;
const PARTICLE_COUNT  = 2500;

const SPARK_YELLOW = 0xfbbf24;

type AnimState = 'sphere' | 'to-logo' | 'logo' | 'to-sphere';

// Simple Simple Icons-style paths (24x24 viewBox). Filled, single-color glyphs.
const INSTAGRAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;

const LINKEDIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;

const FACEBOOK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

type ShapeKey = 'akroma' | 'instagram' | 'linkedin' | 'facebook';

const SHAPE_ORDER: ShapeKey[] = ['akroma', 'instagram', 'linkedin', 'facebook'];

export class SparkHeroScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private posAttr!: THREE.BufferAttribute;

  private animationId: number | null = null;
  private mouse = new THREE.Vector2();
  private resizeHandler: () => void;
  private mouseMoveHandler: (e: MouseEvent) => void;

  private spherePos!: Float32Array;
  private currentPos!: Float32Array;
  private shapes: Partial<Record<ShapeKey, Float32Array>> = {};

  private state: AnimState = 'sphere';
  private stateTime = 0;
  private lastTime = 0;
  private shapeIdx = 0;

  private accumRotY = 0;
  private accumRotX = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.offsetWidth / Math.max(canvas.offsetHeight, 1),
      0.1, 1000
    );
    // Canvas occupies only the right half of the hero on desktop (aspect ≈ 0.55),
    // so push the camera further back than the akroma.com.br scene (z=3) to keep
    // every shape comfortably inside the frame.
    this.camera.position.z = 4;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.resizeHandler = () => {
      this.camera.aspect = canvas.offsetWidth / Math.max(canvas.offsetHeight, 1);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };
    this.mouseMoveHandler = (e: MouseEvent) => {
      this.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);

    void this.initScene();
  }

  private async initScene(): Promise<void> {
    this.spherePos = this.buildSpherePositions();
    this.currentPos = new Float32Array(this.spherePos);

    // Pre-build social icon shapes (SVG → canvas). Akroma loads from PNG async.
    this.shapes.instagram = this.buildShapeFromSvg(INSTAGRAM_SVG);
    this.shapes.linkedin = this.buildShapeFromSvg(LINKEDIN_SVG);
    this.shapes.facebook = this.buildShapeFromSvg(FACEBOOK_SVG);
    try {
      this.shapes.akroma = await this.buildAkromaPositions();
    } catch {
      this.shapes.akroma = this.buildSpherePositions();
    }

    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.currentPos, 3);
    geo.setAttribute('position', this.posAttr);

    const mat = new THREE.PointsMaterial({
      size: 0.013, color: SPARK_YELLOW, transparent: true, opacity: 0.92,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    this.lastTime = performance.now();
    this.animate();
  }

  private buildSpherePositions(): Float32Array {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1 + Math.random() * 0.28;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }

  private buildShapeFromSvg(svg: string): Float32Array {
    if (typeof document === 'undefined') return this.buildSpherePositions();
    const SIZE = 300;
    const cv = document.createElement('canvas');
    cv.width = cv.height = SIZE;
    const ctx = cv.getContext('2d');
    if (!ctx) return this.buildSpherePositions();

    // Rasterize synchronously via drawImage on a data-URI <img> — but data URI
    // decode is async. So we fall back: use Path2D for speed. Since shapes use
    // <path>, we parse out the d="..." and fill it directly.
    const match = svg.match(/d="([^"]+)"/);
    if (!match) return this.buildSpherePositions();
    const d = match[1];
    const path = new Path2D(d);
    ctx.fillStyle = '#000';
    // SVG viewBox is 24x24 — scale to 300
    ctx.scale(SIZE / 24, SIZE / 24);
    ctx.fill(path);

    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    const pool: [number, number][] = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        if (data[i + 3] > 30) pool.push([x, y]);
      }
    }
    if (pool.length < 200) return this.buildSpherePositions();
    return this.samplePool(pool, SIZE);
  }

  private buildAkromaPositions(): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      if (typeof Image === 'undefined') { reject(new Error('no Image')); return; }
      const img = new Image();
      img.onload = () => {
        try {
          const SIZE = 300;
          const cv = document.createElement('canvas');
          cv.width = cv.height = SIZE;
          const ctx = cv.getContext('2d')!;
          ctx.drawImage(img, 0, 0, SIZE, SIZE);
          const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
          const pool: [number, number][] = [];
          for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
              const i = (y * SIZE + x) * 4;
              if (data[i + 3] > 30 && data[i] + data[i+1] + data[i+2] < 480) {
                pool.push([x, y]);
              }
            }
          }
          if (pool.length < 200) { reject(new Error('too few pixels')); return; }
          resolve(this.samplePool(pool, SIZE));
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('img load failed'));
      img.src = 'assets/icone-akroma.png';
    });
  }

  private samplePool(pool: [number, number][], size: number): Float32Array {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const [x, y] = pool[Math.floor(Math.random() * pool.length)];
      pos[i * 3]     =  (x / size - 0.5) * 2.5;
      pos[i * 3 + 1] = -(y / size - 0.5) * 2.5;
      pos[i * 3 + 2] =  (Math.random() - 0.5) * 0.06;
    }
    return pos;
  }

  private currentShape(): Float32Array {
    const key = SHAPE_ORDER[this.shapeIdx];
    return this.shapes[key] ?? this.spherePos;
  }

  private ease(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private lerp(a: Float32Array, b: Float32Array, t: number): void {
    for (let i = 0, n = a.length; i < n; i++) {
      this.currentPos[i] = a[i] + (b[i] - a[i]) * t;
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.particles) { this.renderer.render(this.scene, this.camera); return; }

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.stateTime += dt;

    switch (this.state) {
      case 'sphere': {
        this.accumRotY += 0.005 + this.mouse.x * 0.001;
        this.accumRotX = Math.sin(now * 0.0004) * 0.15 + this.mouse.y * 0.0008;
        this.particles.rotation.y = this.accumRotY;
        this.particles.rotation.x = this.accumRotX;
        this.particles.rotation.z = 0;

        if (this.stateTime >= SPHERE_DURATION) {
          this.state = 'to-logo';
          this.stateTime = 0;
          this.spherePos = this.buildSpherePositions();
        }
        break;
      }
      case 'to-logo': {
        const raw = Math.min(this.stateTime / MORPH_DURATION, 1);
        const t = this.ease(raw);
        this.lerp(this.spherePos, this.currentShape(), t);
        this.posAttr.needsUpdate = true;
        this.particles.rotation.y = this.accumRotY * (1 - t);
        this.particles.rotation.x = this.accumRotX * (1 - t);
        if (raw >= 1) {
          this.state = 'logo';
          this.stateTime = 0;
          this.particles.rotation.y = 0;
          this.particles.rotation.x = 0;
        }
        break;
      }
      case 'logo': {
        this.particles.rotation.z = Math.sin(now * 0.0009) * 0.018;
        this.particles.rotation.x = Math.sin(now * 0.0007) * 0.015;
        if (this.stateTime >= LOGO_DURATION) {
          this.state = 'to-sphere';
          this.stateTime = 0;
          this.accumRotY = 0;
          this.accumRotX = 0;
        }
        break;
      }
      case 'to-sphere': {
        const raw = Math.min(this.stateTime / MORPH_DURATION, 1);
        const t = this.ease(raw);
        this.lerp(this.currentShape(), this.spherePos, t);
        this.posAttr.needsUpdate = true;
        this.accumRotY += 0.005 * t + this.mouse.x * 0.001 * t;
        this.accumRotX = Math.sin(now * 0.0004) * 0.15 * t;
        this.particles.rotation.y = this.accumRotY * t;
        this.particles.rotation.x = this.accumRotX * t;
        this.particles.rotation.z = this.particles.rotation.z * (1 - t);
        if (raw >= 1) {
          this.state = 'sphere';
          this.stateTime = 0;
          // advance to next shape for the next morph cycle
          this.shapeIdx = (this.shapeIdx + 1) % SHAPE_ORDER.length;
        }
        break;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    this.renderer.dispose();
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
  }
}
