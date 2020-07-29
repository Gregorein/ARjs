/* renderer */
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})
renderer.setClearColor(new THREE.Color("black"), 0)
// renderer.setPixelRatio( 1/2 )
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.style.position = "absolute"
renderer.domElement.style.top = "0px"
renderer.domElement.style.left = "0px"
document.body.appendChild(renderer.domElement)

var onRenderFunctions = []

var scene = new THREE.Scene()

/* camera init */
var camera = new THREE.Camera()
scene.add(camera)

/* ArToolkitSource */
var ArToolkitSource = new THREEx.ArToolkitSource({sourceType: "webcam"})
ArToolkitSource.init(function onReady() { onResize() })

/* handle resize */
window.addEventListener("resize", function() { onResize() })

function onResize() {
  ArToolkitSource.onResize()
  ArToolkitSource.copySizeTo(renderer.domElement)
  if (arToolkitContext.arController !== null) ArToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
}

/* arToolkitContext */
var arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: THREEx.ArToolkitContext.baseURL + "camera_para.dat",
  detectionMode: "mono",
  maxDetectionRate: 30,
  canvasWidth: 80*3,
  canvasHeight: 60*3,
})
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
})

onRenderFunctions.push(function() {
  if (ArToolkitSource.ready === false) return

  arToolkitContext.update(ArToolkitSource.domElement)
})

/* arMarkerControls */
var markerRoot = new THREE.Group()
scene.add(markerRoot)
arToolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: "pattern",
  patternUrl: THREEx.ArToolkitContext.baseURL + "marker.patt",
})

var smoothedRoot = new THREE.Group()
scene.add(smoothedRoot)
var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
  lerpPosition: 0.4,
  lerpQuaternion: 0.3,
  lerpScale: 1,
})
onRenderFunctions.push(function(delta) {
  smoothedControls.update(markerRoot)
})


/* object to display */
var worldRoot = smoothedRoot

var textureLoader = new THREE.TextureLoader()
var normal = textureLoader.load("mun_n.png")
var geometry = new THREE.SphereGeometry(1, 32, 64)
var material = new THREE.MeshPhysicalMaterial({
  color: 16776698,
  roughness: 1,
  metalness: 0.4,
  normalMap: normal,
})
var mun = new THREE.Mesh(geometry, material)
mun.position.set(0, 1.25, 0)
worldRoot.add(mun)

onRenderFunctions.push(function() {
  mun.rotation.y -= 0.01
})


/* lights */
var t = new THREE.PointLight(0xffffff, 0.33)
t.position.set(0, 5, 0)
worldRoot.add(t)

var t = new THREE.PointLight(0xffffff, 0.1)
t.position.set(2, 3, 2)
worldRoot.add(t)
var t = new THREE.PointLight(0xffffff, 0.1)
t.position.set(2, 3, -2)
worldRoot.add(t)
var t = new THREE.PointLight(0xffffff, 0.1)
t.position.set(-2, 3, -2)
worldRoot.add(t)
var t = new THREE.PointLight(0xffffff, 0.1)
t.position.set(-2, 3, 2)
worldRoot.add(t)

onRenderFunctions.push(function() {
  var cameraPosition = camera.position
})


/* rendering */
onRenderFunctions.push(function() {
  renderer.render(scene, camera)
})

var dT = null
  requestAnimationFrame(function animate(t) {
    requestAnimationFrame(animate);

    // measure time
    dT  = dT || t-1000/60
    var d = Math.min(200, t - dT)
    dT  = t
    // call each update function

    onRenderFunctions.forEach(function(onRenderFunction) {
      onRenderFunction(d/1000, t/1000)
    })
  })
