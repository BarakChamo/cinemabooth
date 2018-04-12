import RecordRTC from 'recordrtc'
import Webgl from 'js/core/Webgl'
import loop from 'js/core/Loop'
// import props from 'js/core/props'
import VideoPlane from 'js/components/VideoPlane'

// ##
// INIT
const webgl = new Webgl(window.innerWidth, window.innerHeight)
const fileInput = document.getElementById('fileUpload')
document.body.appendChild(webgl.dom)

// - Add object update to loop
loop.add(webgl.onUpdate)

// ##
// GUI

const props = {
  capture: function() {
    captureFrame()
  },
  record: function() {
    createVideoPlane()
  },
  upload: function() {
    fileInput.click()
  },
  showCamera: true,
  'Key threshold': 0.5,
}
const gui = new dat.GUI()
gui.add(props, 'capture').name(`Set\&nbsp;backdrop`)
gui.add(props, 'record').name(`Record\&nbsp;scene`)
gui.add(props, 'upload').name(`Upload\&nbsp;view`)
gui.add(props, 'showCamera').name(`Show\&nbsp;camera`).onChange(value => { feedPlane.visible = value })
gui.add(props, 'Key threshold', 0.0, 1).name(`Key\&nbsp;threshold`).onChange(value => {
  feedPlane.updateThreashold(value)
  videoPlanes.forEach(videoPlane => { videoPlane.updateThreashold(value) })
})
gui.close()

// ##
// EXAMPLE LIGHT
const light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(1, 1, 1)
webgl.add(light)

// ##
// EXAMPLE BOX
const feedPlane = new VideoPlane(window.innerWidth, window.innerHeight)
const backgroundPlane = new VideoPlane(window.innerWidth, window.innerHeight)

webgl.add(feedPlane)
webgl.add(backgroundPlane)

loop.add(feedPlane.onUpdate)
loop.add(backgroundPlane.onUpdate)

// ##
// CENTER CAMERA / FILL SCREEN
var box = new THREE.Box3().setFromObject(feedPlane)
box.getCenter(feedPlane.position)

feedPlane.localToWorld(box)
feedPlane.position.multiplyScalar(-1)

webgl.camera.zoom = Math.min(window.innerWidth / (box.max.x - box.min.x), window.innerHeight / (box.max.y - box.min.y))
webgl.camera.updateProjectionMatrix()
webgl.camera.updateMatrix()

// ##
// RENDERER
loop.start()

// ##
// START CAMERA

let recorder, keyTexture,
    feed = document.createElement('video'),
    videoPlanes = []

navigator.getUserMedia({audio: false, video: { width: window.innerWidth, height: window.innerHeight }}, stream => {
  // Initialize Video player element to screen size

  // configure video feed element
  feed.width = window.innerWidth
  feed.height = window.innerHeight
  feed.autoplay = true
  feed.srcObject = stream
  feed.play()

  // create video recorder
  recorder = RecordRTC(stream, {type: 'video'})

  // Assign webcam stream to video element
  feedPlane.setVideoSource(feed)
}, function(error) {
  console.log("Failed to get a stream due to", error)
})

// ##
// HANDLE CLICKS
function createVideoPlane() {
  recorder.startRecording()

  setTimeout(() => recorder.stopRecording(() => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(recorder.getBlob())
    video.autoplay = true
    video.loop = true

    // Create new video plane
    const videoPlane = new VideoPlane(window.innerWidth, window.innerHeight)
    videoPlane.setVideoSource(video, keyTexture)

    webgl.add(videoPlane)
    loop.add(videoPlane.onUpdate)
    videoPlanes.push(videoPlane)
  }), 3000)
}

function captureFrame() {
  var capture = document.createElement('canvas')
  capture.width = feed.videoWidth || feed.clientWidth
  capture.height = feed.videoHeight || feed.clientHeight

  var context = capture.getContext('2d')
  context.drawImage(feed, 0, 0, capture.width, capture.height)

  new THREE.TextureLoader().load(capture.toDataURL('image/png'), texture => {
      keyTexture = texture
      keyTexture.minFilter = THREE.LinearFilter
  })


  // TODO: update keyTexture for all existing video planes
}

window.onkeypress = ({ which }) => {
  switch (which) {
    case 49: // key 1 - capture a keying frame
      captureFrame()
      break;

    case 50: // key 2 - record video plane
      createVideoPlane()
      break;

    case 51: // key 2 - hide live video feed
      feedPlane.visible = !feedPlane.visible
      break;

    default:
      return
  }
}

fileInput.onchange = e => {
  const reader = new FileReader()
  const image = document.createElement( 'img' )
  // const texture = new THREE.Texture( image )

  image.onload = () => {
    // texture.needsUpdate = true
    backgroundPlane.setBackgroundSource(image)
  }

  reader.onload = e => {
    image.src = e.target.result
  }

  reader.readAsDataURL(fileInput.files[0])
}

// ##
// ON RESIZE / ORIENTATION CHANGE
function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight

  webgl.onResize(w, h)
  feedPlane.onResize(w, h)
}

window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', onResize)
