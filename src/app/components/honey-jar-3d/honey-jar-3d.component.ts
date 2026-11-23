import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

@Component({
  selector: 'app-honey-jar-3d',
  standalone: true,
  template: `<div #canvasHost class="jar-canvas-host"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .jar-canvas-host {
      width: 100%;
      height: 100%;
      cursor: grab;
      touch-action: none;
    }
    .jar-canvas-host:active {
      cursor: grabbing;
    }
  `]
})
export class HoneyJar3dComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;
  @Input() autoRotate = true;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private resizeObserver?: ResizeObserver;
  private animFrameId = 0;

  private jarGroup = new THREE.Group();
  private honeyBodyGeo!: THREE.BufferGeometry;
  private honeyBodyBasePos!: Float32Array;
  private honeySurfaceGeo!: THREE.BufferGeometry;
  private honeySurfaceBasePos!: Float32Array;
  private honeySurfaceMesh!: THREE.Mesh;
  private bubbles: Array<{ mesh: THREE.Mesh; speed: number; baseX: number; baseZ: number }> = [];

  // فيزياء حركة العسل السائل (نابض مخمد لتموج العسل اللزج)
  private sloshX = 0;
  private sloshZ = 0;
  private velX = 0;
  private velZ = 0;
  private waveEnergy = 0.08;
  private prevAzimuth = 0;
  private prevPolar = 0;

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['autoRotate'] && this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(0, 0.35, 4.05);
    this.controls.target.set(0, 0.02, 0);
    this.controls.update();
    this.swirlHoney(0.5);
  }

  swirlHoney(impulse = 1.0): void {
    this.velX += (Math.random() - 0.5) * 0.16 * impulse;
    this.velZ += 0.14 * impulse;
    this.waveEnergy = Math.min(1.0, this.waveEnergy + 0.55 * impulse);
  }

  private initScene(): void {
    const host = this.canvasHost.nativeElement;
    const width = host.clientWidth || 500;
    const height = host.clientHeight || 400;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    this.camera.position.set(0, 0.35, 4.05);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.6;
    this.controls.maxDistance = 6.0;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.1;
    this.controls.target.set(0, 0.02, 0);
    this.controls.update();

    this.prevAzimuth = this.controls.getAzimuthalAngle();
    this.prevPolar = this.controls.getPolarAngle();

    // إضاءة استوديو دافئة تبرز لون عسل السدر العنبري
    const keyLight = new THREE.DirectionalLight(0xfff5df, 2.3);
    keyLight.position.set(3.2, 4.5, 3.8);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffedd5, 1.1);
    fillLight.position.set(-3.0, 2.0, 2.5);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xe5b84b, 2.8, 12);
    rimLight.position.set(-2.5, 1.5, -2.5);
    this.scene.add(rimLight);

    const underGlow = new THREE.PointLight(0xb45309, 1.9, 8);
    underGlow.position.set(0, -1.7, 0.8);
    this.scene.add(underGlow);

    this.buildHoneyJar();
    this.scene.add(this.jarGroup);

    this.resizeObserver = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
    this.resizeObserver.observe(host);
  }

  private buildHoneyJar(): void {
    // 1. شكل العبوة الزجاجية المطابق للعبوة الحقيقية مع تضليع سفلي مدمج ومتناسق تماماً
    const outerPoints = [
      new THREE.Vector2(0.0, -0.98),
      new THREE.Vector2(0.68, -0.98),
      new THREE.Vector2(0.83, -0.93),
      new THREE.Vector2(0.91, -0.84),
      new THREE.Vector2(0.95, -0.72),
      new THREE.Vector2(0.96, 0.46),
      new THREE.Vector2(0.93, 0.62),
      new THREE.Vector2(0.79, 0.74),
      new THREE.Vector2(0.79, 0.86)
    ];
    const glassGeo = new THREE.LatheGeometry(outerPoints, 128);
    // تشكيل التضليع الزجاجي المائل في الجزء السفلي من نفس شبكة الزجاج لضمان التناسق التام 360°
    const gPos = glassGeo.attributes['position'];
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      const y = gPos.getY(i);
      const z = gPos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      if (y > -0.94 && y < -0.72 && r > 0.72) {
        const angle = Math.atan2(z, x);
        // تلاشي ناعم عند الحواف العلوية والسفلية للتضليع
        const t = (y - -0.94) / (-0.72 - -0.94);
        const envelope = Math.sin(t * Math.PI);
        const wave = Math.sin(angle * 36 + y * 14) * 0.015 * envelope;
        const scale = (r + wave) / r;
        gPos.setX(i, x * scale);
        gPos.setZ(i, z * scale);
      }
    }
    glassGeo.computeVertexNormals();

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      metalness: 0.0,
      ior: 1.5,
      thickness: 0.1,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0xffffff),
      attenuationDistance: 12.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.renderOrder = 3;
    this.jarGroup.add(glassMesh);

    // 2. العسل السائل: اللون الدقيق #B45A2C (RGB: 180, 90, 44) مع عمق ضوئي ومينسكاس واقعي
    const honeyMat = new THREE.MeshPhysicalMaterial({
      color: 0xb45a2c,
      emissive: 0x6b2f14,
      emissiveIntensity: 0.38,
      roughness: 0.08,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xe07b42)
    });

    // قلب إضاءة داخلي يعطي تدرجاً واقعياً متناغماً مع #B45A2C
    const innerCoreGeo = new THREE.CylinderGeometry(0.62, 0.58, 1.05, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xc86d3b,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.position.y = -0.18;
    innerCore.renderOrder = 0;
    this.jarGroup.add(innerCore);

    const honeyBodyPoints = [
      new THREE.Vector2(0.0, -0.82),
      new THREE.Vector2(0.82, -0.82),
      new THREE.Vector2(0.9, -0.68),
      new THREE.Vector2(0.9, 0.15),
      new THREE.Vector2(0.9, 0.36),
      new THREE.Vector2(0.88, 0.48),
      new THREE.Vector2(0.86, 0.54)
    ];
    this.honeyBodyGeo = new THREE.LatheGeometry(honeyBodyPoints, 64);
    this.honeyBodyBasePos = new Float32Array(this.honeyBodyGeo.attributes['position'].array);
    const honeyBodyMesh = new THREE.Mesh(this.honeyBodyGeo, honeyMat);
    honeyBodyMesh.renderOrder = 1;
    this.jarGroup.add(honeyBodyMesh);

    // سطح العسل السائل القابل للتموج والميلان مع مينسكاس ملتصق بالزجاج
    const planeGeo = new THREE.PlaneGeometry(1.72, 1.72, 34, 34);
    planeGeo.rotateX(-Math.PI / 2);
    const pos = planeGeo.attributes['position'];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      if (r > 0.86) {
        const scale = 0.86 / r;
        pos.setX(i, x * scale);
        pos.setZ(i, z * scale);
      }
    }
    planeGeo.computeVertexNormals();
    this.honeySurfaceGeo = planeGeo;
    this.honeySurfaceBasePos = new Float32Array(pos.array);

    const honeySurfaceMat = honeyMat.clone();
    honeySurfaceMat.side = THREE.DoubleSide;
    this.honeySurfaceMesh = new THREE.Mesh(this.honeySurfaceGeo, honeySurfaceMat);
    this.honeySurfaceMesh.position.y = 0.54;
    this.honeySurfaceMesh.renderOrder = 2;
    this.jarGroup.add(this.honeySurfaceMesh);

    // فقاعات ذهبية دقيقة داخل العسل
    const bubbleGeo = new THREE.SphereGeometry(0.02, 10, 10);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      transmission: 0.7,
      transparent: true,
      roughness: 0.05
    });
    for (let i = 0; i < 20; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat);
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.7;
      const bx = Math.cos(angle) * rad;
      const bz = Math.sin(angle) * rad;
      b.scale.setScalar(0.5 + Math.random() * 1.0);
      b.position.set(bx, -0.74 + Math.random() * 1.2, bz);
      this.jarGroup.add(b);
      this.bubbles.push({
        mesh: b,
        speed: 0.08 + Math.random() * 0.14,
        baseX: bx,
        baseZ: bz
      });
    }

    // 3. الغطاء البني الداكن المضلع المطابق للصورة
    const brownCapMat = new THREE.MeshStandardMaterial({
      color: 0x3b2013,
      roughness: 0.42,
      metalness: 0.08
    });
    const capGeo = new THREE.CylinderGeometry(0.84, 0.85, 0.35, 64);
    const capMesh = new THREE.Mesh(capGeo, brownCapMat);
    capMesh.position.y = 0.99;
    this.jarGroup.add(capMesh);

    // تضليعات الغطاء العمودية
    const capRibGeo = new THREE.BoxGeometry(0.018, 0.32, 0.024);
    const ribCount = 64;
    for (let i = 0; i < ribCount; i++) {
      const a = (i / ribCount) * Math.PI * 2;
      // إخفاء التضليعات تحت الشريط الأسود الأمامي
      const normA = Math.atan2(Math.sin(a), Math.cos(a));
      if (Math.abs(normA - Math.PI / 2) < 0.34) continue;
      const rib = new THREE.Mesh(capRibGeo, brownCapMat);
      rib.position.set(Math.cos(a) * 0.848, 0.99, Math.sin(a) * 0.848);
      rib.rotation.y = -a;
      this.jarGroup.add(rib);
    }

    // 4. شريط الأمان الأسود الممتد من أعلى الغطاء إلى الملصق الدائري الأمامي
    const blackStripMat = new THREE.MeshStandardMaterial({
      color: 0x151311,
      roughness: 0.52,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // الجزء العلوي فوق الغطاء
    const topStripGeo = new THREE.BoxGeometry(0.56, 0.015, 0.95);
    const topStrip = new THREE.Mesh(topStripGeo, blackStripMat);
    topStrip.position.set(0, 1.168, 0.38);
    this.jarGroup.add(topStrip);

    // الجزء الأمامي على الغطاء
    const capFrontStripGeo = new THREE.CylinderGeometry(0.862, 0.862, 0.355, 24, 1, true, -0.34, 0.68);
    const capFrontStrip = new THREE.Mesh(capFrontStripGeo, blackStripMat);
    capFrontStrip.position.y = 0.99;
    capFrontStrip.renderOrder = 4;
    this.jarGroup.add(capFrontStrip);

    // الشريط العمودي أسفل الغطاء مع نص Natural Yemeni —honey %100—
    const neckTex = this.createNeckStripTexture();
    const neckStripGeo = new THREE.CylinderGeometry(0.966, 0.966, 0.48, 24, 1, true, -0.31, 0.62);
    const neckStripMat = new THREE.MeshStandardMaterial({
      map: neckTex,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const neckStrip = new THREE.Mesh(neckStripGeo, neckStripMat);
    neckStrip.position.y = 0.54;
    neckStrip.renderOrder = 4;
    this.jarGroup.add(neckStrip);

    // الملصق الدائري الأسود والذهبي بشعار عالم العسل اليمني
    const medallionTex = this.createMedallionTexture();
    const medallionGeo = new THREE.CylinderGeometry(0.972, 0.972, 0.98, 48, 1, true, -0.58, 1.16);
    const medallionMat = new THREE.MeshStandardMaterial({
      map: medallionTex,
      roughness: 0.32,
      metalness: 0.25,
      transparent: true,
      alphaTest: 0.08
    });
    const medallionMesh = new THREE.Mesh(medallionGeo, medallionMat);
    medallionMesh.position.y = -0.18;
    medallionMesh.renderOrder = 5;
    this.jarGroup.add(medallionMesh);
  }

  private createNeckStripTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#151311';
    ctx.fillRect(0, 0, 512, 400);

    // خط متقطع للفتح
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(20, 75);
    ctx.lineTo(492, 75);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E8DFD1';
    ctx.font = '600 34px Cairo, sans-serif';
    ctx.fillText('Natural Yemeni', 256, 170);
    ctx.font = '700 34px Cairo, sans-serif';
    ctx.fillText('—honey %100—', 256, 222);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createMedallionTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    const drawBase = (logoImg?: HTMLImageElement) => {
      ctx.clearRect(0, 0, 768, 768);

      // وصلة الشريط العلوي المتصلة بالدائرة
      ctx.fillStyle = '#151311';
      ctx.fillRect(236, 0, 296, 160);

      // الدائرة السوداء الرئيسية
      ctx.beginPath();
      ctx.arc(384, 410, 336, 0, Math.PI * 2);
      ctx.fillStyle = '#151311';
      ctx.fill();

      // إطار ذهبي رفيع حول الدائرة
      ctx.beginPath();
      ctx.arc(384, 410, 326, 0, Math.PI * 2);
      ctx.strokeStyle = '#C89B3C';
      ctx.lineWidth = 6;
      ctx.stroke();

      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(384, 410, 316, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, 64, 90, 640, 640);
        ctx.restore();
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#E5B84B';
        ctx.font = '900 62px Cairo, sans-serif';
        ctx.fillText('عالم العسل', 384, 395);
        ctx.fillStyle = '#D7C8B6';
        ctx.font = '700 26px Cairo, sans-serif';
        ctx.fillText('YEMENI HONEY WORLD', 384, 455);
      }
    };

    drawBase();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    // تحميل الشعار الرسمي من الأصول ودمجه تلقائياً فور جاهزيته
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawBase(img);
      tex.needsUpdate = true;
    };
    img.src = 'assets/logo.png';

    return tex;
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.controls.update();

    const time = performance.now() * 0.001;

    const az = this.controls.getAzimuthalAngle();
    const pol = this.controls.getPolarAngle();
    const dAz = az - this.prevAzimuth;
    const dPol = pol - this.prevPolar;
    this.prevAzimuth = az;
    this.prevPolar = pol;

    const motion = Math.min(0.15, Math.abs(dAz) + Math.abs(dPol));
    if (motion > 0.0015) {
      this.velX += dAz * 0.34;
      this.velZ += dPol * 0.34;
      this.waveEnergy = Math.min(0.65, this.waveEnergy + motion * 0.9);
    }

    // فيزياء لزوجة العسل الثقيلة: استجابة بطيئة وتخميد سريع بدون ارتداد مائي
    const stiffness = 0.012;
    const damping = 0.78;
    this.velX = (this.velX - this.sloshX * stiffness) * damping;
    this.velZ = (this.velZ - this.sloshZ * stiffness) * damping;
    this.sloshX = THREE.MathUtils.clamp(this.sloshX + this.velX, -0.14, 0.14);
    this.sloshZ = THREE.MathUtils.clamp(this.sloshZ + this.velZ, -0.14, 0.14);
    this.waveEnergy = Math.max(0.03, this.waveEnergy * 0.96);

    // تحديث سطح العسل السائل بتموج ثقيل وبطيء يناسب كثافة العسل
    const pos = this.honeySurfaceGeo.attributes['position'];
    for (let i = 0; i < pos.count; i++) {
      const bx = this.honeySurfaceBasePos[i * 3];
      const bz = this.honeySurfaceBasePos[i * 3 + 2];
      const r = Math.sqrt(bx * bx + bz * bz);
      const meniscus = Math.pow(Math.min(1, r / 0.86), 5) * 0.034;
      const tilt = bx * this.sloshX + bz * this.sloshZ;
      const ripple =
        Math.sin(r * 2.8 - time * 0.85) * 0.01 * this.waveEnergy +
        Math.cos((bx - bz) * 2.0 + time * 0.65) * 0.006 * this.waveEnergy;
      pos.setY(i, tilt + ripple + meniscus);
    }
    pos.needsUpdate = true;
    this.honeySurfaceGeo.computeVertexNormals();

    // مزامنة الجدار الجانبي للعسل ليرتفع وينخفض ببطء ولزوجة على الزجاج
    const bPos = this.honeyBodyGeo.attributes['position'];
    for (let i = 0; i < bPos.count; i++) {
      const bx = this.honeyBodyBasePos[i * 3];
      const by = this.honeyBodyBasePos[i * 3 + 1];
      const bz = this.honeyBodyBasePos[i * 3 + 2];
      if (by > 0.16) {
        const factor = (by - 0.16) / (0.54 - 0.16);
        const r = Math.sqrt(bx * bx + bz * bz);
        const meniscus = factor > 0.9 ? 0.034 : 0;
        const tilt = bx * this.sloshX + bz * this.sloshZ;
        const ripple =
          Math.sin(r * 2.8 - time * 0.85) * 0.01 * this.waveEnergy +
          Math.cos((bx - bz) * 2.0 + time * 0.65) * 0.006 * this.waveEnergy;
        bPos.setY(i, by + (tilt + ripple) * factor + meniscus);
      }
    }
    bPos.needsUpdate = true;
    this.honeyBodyGeo.computeVertexNormals();

    for (const b of this.bubbles) {
      b.mesh.position.y += b.speed * 0.0025;
      b.mesh.position.x = b.baseX + Math.sin(time * 0.55 + b.baseZ * 4) * 0.012;
      if (b.mesh.position.y > 0.46) {
        b.mesh.position.y = -0.76;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
  }
}
