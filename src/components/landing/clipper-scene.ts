import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

const CYAN = 0x22e6ff
const MAGENTA = 0xff2bd6
const TEETH = 27

export interface ClipperScene {
  setReducedMotion: (reduced: boolean) => void
  dispose: () => void
}

/** Side outline of the clipper body: wide at the blade, narrow at the tail. */
function bodyOutline(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(-0.62, -2.05)
  shape.bezierCurveTo(-0.82, -1.1, -1.08, -0.2, -1.12, 0.55)
  shape.bezierCurveTo(-1.15, 1.05, -1.14, 1.4, -1.08, 1.68)
  shape.lineTo(1.08, 1.68)
  shape.bezierCurveTo(1.14, 1.4, 1.15, 1.05, 1.12, 0.55)
  shape.bezierCurveTo(1.08, -0.2, 0.82, -1.1, 0.62, -2.05)
  shape.bezierCurveTo(0.4, -2.3, -0.4, -2.3, -0.62, -2.05)
  return shape
}

/** A neon line that follows the body outline, with a soft additive halo. */
function neonOutline(
  points: THREE.Vector2[],
  z: number,
  color: number
): THREE.Group {
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(point.x, point.y, z)),
    true
  )
  const group = new THREE.Group()
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 180, 0.018, 8, true),
      new THREE.MeshBasicMaterial({ color, toneMapped: false })
    ),
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.07, 8, true),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    )
  )
  return group
}

/** One row of blade teeth, drawn as a single instanced mesh. */
function bladeRow(
  width: number,
  height: number,
  material: THREE.Material,
  y: number,
  z: number
): THREE.InstancedMesh {
  const tooth = new THREE.BoxGeometry(width, height, 0.05)
  const row = new THREE.InstancedMesh(tooth, material, TEETH)
  const matrix = new THREE.Matrix4()
  for (let i = 0; i < TEETH; i += 1) {
    const x = ((i - (TEETH - 1) / 2) / (TEETH - 1)) * 2.02
    matrix.makeTranslation(x, y, z)
    row.setMatrixAt(i, matrix)
  }
  row.instanceMatrix.needsUpdate = true
  return row
}

function buildClipper(): { clipper: THREE.Group; movingBlade: THREE.Object3D } {
  const clipper = new THREE.Group()

  const shell = new THREE.MeshStandardMaterial({
    color: 0x17102e,
    metalness: 0.75,
    roughness: 0.3,
  })
  const steel = new THREE.MeshStandardMaterial({
    color: 0xdfe7f5,
    metalness: 1,
    roughness: 0.2,
  })
  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x4a4f68,
    metalness: 1,
    roughness: 0.34,
  })
  const cyanGlow = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false })
  const magentaGlow = new THREE.MeshBasicMaterial({
    color: MAGENTA,
    toneMapped: false,
  })

  const outline = bodyOutline()
  const depth = 0.72
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.16,
      bevelSegments: 6,
      curveSegments: 28,
    }),
    shell
  )
  body.position.z = -depth / 2
  clipper.add(body)

  const outlinePoints = outline.getSpacedPoints(90).slice(0, -1)
  const expanded = outlinePoints.map((point) => point.clone().multiplyScalar(1.09))
  clipper.add(
    neonOutline(expanded, depth / 2 + 0.205, CYAN),
    neonOutline(expanded, -depth / 2 - 0.205, MAGENTA)
  )

  // Blade housing.
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(2.36, 0.34, 0.92),
    darkSteel
  )
  housing.position.set(0, 1.92, 0)
  clipper.add(housing)

  // Fixed comb blade, with the cutting blade sliding just in front of it.
  const fixedPlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.08), steel)
  fixedPlate.position.set(0, 2.16, 0.1)
  clipper.add(fixedPlate, bladeRow(0.046, 0.34, steel, 2.38, 0.1))

  const movingBlade = new THREE.Group()
  const movingPlate = new THREE.Mesh(
    new THREE.BoxGeometry(2.08, 0.12, 0.06),
    darkSteel
  )
  movingPlate.position.set(0, 2.14, 0.17)
  movingBlade.add(movingPlate, bladeRow(0.04, 0.2, darkSteel, 2.28, 0.17))
  clipper.add(movingBlade)

  // Taper lever on the side.
  const leverArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.62, 16),
    steel
  )
  leverArm.rotation.z = Math.PI / 2.5
  leverArm.position.set(1.36, 1.15, 0.05)
  const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), cyanGlow)
  leverKnob.position.set(1.64, 1.27, 0.05)
  clipper.add(leverArm, leverKnob)

  // Power switch and indicator.
  const switchBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.86, 0.06),
    darkSteel
  )
  switchBase.position.set(0, 0.42, depth / 2 + 0.215)
  const switchThumb = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.08),
    magentaGlow
  )
  switchThumb.position.set(0, 0.62, depth / 2 + 0.26)
  const indicator = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 24),
    cyanGlow
  )
  indicator.position.set(0, 1.12, depth / 2 + 0.207)
  clipper.add(switchBase, switchThumb, indicator)

  // Grip ridges.
  for (let i = 0; i < 6; i += 1) {
    const width = 1.2 - i * 0.07
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.035, 0.03),
      i % 2 === 0 ? cyanGlow : darkSteel
    )
    ridge.position.set(0, -0.3 - i * 0.2, depth / 2 + 0.21)
    clipper.add(ridge)
  }

  // Power cord leaving the tail.
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2.28, 0),
    new THREE.Vector3(0.05, -2.9, -0.15),
    new THREE.Vector3(0.7, -3.55, -0.5),
    new THREE.Vector3(1.75, -3.85, -0.95),
    new THREE.Vector3(3.3, -4.5, -1.5),
    new THREE.Vector3(5.5, -5.2, -2),
  ])
  clipper.add(
    new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 90, 0.035, 8), magentaGlow),
    new THREE.Mesh(
      new THREE.TubeGeometry(cordCurve, 60, 0.11, 8),
      new THREE.MeshBasicMaterial({
        color: MAGENTA,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    )
  )

  return { clipper, movingBlade }
}

/**
 * Decorative 3D clipper behind the landing page. It never receives input and
 * holds no content. With reduced motion it is drawn as one still frame, and
 * it stops rendering while the tab is hidden.
 */
export function createClipperScene(
  canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; lowPower: boolean; onContextLost: () => void }
): ClipperScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !options.lowPower,
    powerPreference: options.lowPower ? "low-power" : "default",
  })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.42
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60)
  camera.position.z = 12

  const cyanLight = new THREE.PointLight(CYAN, 55, 22)
  cyanLight.position.set(-4, 3, 5)
  const magentaLight = new THREE.PointLight(MAGENTA, 60, 22)
  magentaLight.position.set(4.5, -2, 3)
  scene.add(cyanLight, magentaLight)

  const { clipper, movingBlade } = buildClipper()
  const rig = new THREE.Group()
  rig.add(clipper)
  scene.add(rig)

  let reducedMotion = options.reducedMotion
  let frame = 0
  let lastDraw = 0
  let pointerX = 0
  let pointerY = 0
  let scrollProgress = 0
  const frameInterval = options.lowPower ? 1000 / 30 : 0

  const pose = (time: number) => {
    const float = reducedMotion ? 0 : Math.sin(time * 0.8) * 0.09
    const sway = reducedMotion ? 0 : Math.sin(time * 0.35) * 0.3
    const spin = reducedMotion ? 0 : scrollProgress * Math.PI * 1.4

    clipper.rotation.set(
      -0.18 + pointerY * 0.08,
      -0.62 + sway + spin + pointerX * 0.14,
      -0.42
    )
    clipper.position.y = float
    movingBlade.position.x = reducedMotion ? 0 : Math.sin(time * 70) * 0.012
  }

  const layout = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const wide = width >= 1024
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, options.lowPower ? 1 : 1.75)
    )
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // Beside the copy on desktop, above it on a phone.
    rig.position.set(wide ? 2.05 : 0.55, wide ? 0.1 : 1.2, 0)
    rig.scale.setScalar(wide ? 1 : 0.72)
  }

  const draw = (time: number) => {
    pose(time)
    renderer.render(scene, camera)
  }

  const stop = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop)
    if (now - lastDraw < frameInterval) return
    lastDraw = now
    draw(now / 1000)
  }

  const start = () => {
    stop()
    if (reducedMotion || document.hidden) {
      draw(0)
      return
    }
    frame = requestAnimationFrame(loop)
  }

  const handleResize = () => {
    layout()
    if (reducedMotion) draw(0)
  }
  const handleScroll = () => {
    const viewport = Math.max(window.innerHeight, 1)
    const fade = Math.min(window.scrollY / viewport, 1)
    const max = Math.max(document.documentElement.scrollHeight - viewport, 1)
    scrollProgress = window.scrollY / max
    // Stays bright in the hero and recedes behind running text below it.
    canvas.style.opacity = String(1 - fade * 0.86)
  }
  const handlePointer = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return
    pointerX = event.clientX / window.innerWidth - 0.5
    pointerY = event.clientY / window.innerHeight - 0.5
  }
  const handleVisibility = () => {
    if (document.hidden) stop()
    else start()
  }
  const handleContextLost = (event: Event) => {
    event.preventDefault()
    stop()
    options.onContextLost()
  }

  window.addEventListener("resize", handleResize)
  window.addEventListener("scroll", handleScroll, { passive: true })
  window.addEventListener("pointermove", handlePointer, { passive: true })
  document.addEventListener("visibilitychange", handleVisibility)
  canvas.addEventListener("webglcontextlost", handleContextLost)

  layout()
  handleScroll()
  start()

  return {
    setReducedMotion(reduced) {
      reducedMotion = reduced
      start()
    },
    dispose() {
      stop()
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("pointermove", handlePointer)
      document.removeEventListener("visibilitychange", handleVisibility)
      canvas.removeEventListener("webglcontextlost", handleContextLost)

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        materials.forEach((material) => material.dispose())
        if (object instanceof THREE.InstancedMesh) object.dispose()
      })
      environment.dispose()
      renderer.dispose()
    },
  }
}
