import props from 'js/core/props'

import imageDiffVert from '../shaders/image-diff.v'
import imageDiffFrag from '../shaders/image-diff.f'

class Example extends THREE.Object3D {
  constructor(w, h) {
    super()

    // Initialize Video plane
    this.w = w
    this.h = h

    // - object
    const planeGeomerty = new THREE.PlaneGeometry(1000,1000 * (h / w),1,1)
    // - CREATE MESH
    this.planeMesh = new THREE.Mesh(planeGeomerty)

    // ##
    // ADD TO EXAMPLE OBJECT
    this.add(this.planeMesh)

    // ##
    // SAVE BINDING
    this.onUpdate = this.onUpdate.bind(this)
  }

  onUpdate() {
    if(this.source && this.source.readyState && this.source.readyState === this.source.HAVE_ENOUGH_DATA)
      this.videoTexture.needsUpdate = true
  }

  onResize(w, h) {
    // Resize object
    this.w = w
    this.h = h
  }

  setVideoSource(source, keyTexture) {
    this.source = source
    // Define video texture and make sure it's a power-of-2 sized
    this.videoTexture = new THREE.Texture(source)
    this.videoTexture.minFilter = THREE.LinearFilter

    // Create a shader material from the video texture
    this.videoMaterial = new THREE.ShaderMaterial({
      uniforms: {
        t: { type: 'f', value: 0.5 },
        map: { type: 't', value: this.videoTexture },
        backdrop: { type: 't', value: keyTexture },
        compare: { type: 'b', value: false },
      },
      defines: {
        USE_MAP: true
      },
      vertexShader: imageDiffVert,
      fragmentShader: imageDiffFrag,
    })

    this.videoMaterial.transparent = true

    // Define a plane facing the camera
    const planeGeomerty = new THREE.PlaneGeometry(1000,1000 * (this.h / this.w),1,1)

    // Create the final mesh and add to scene
    this.videoPlaneMesh = new THREE.Mesh(planeGeomerty, this.videoMaterial)
    this.add(this.videoPlaneMesh)
  }

  setBackgroundSource(source) {
    this.backdrop = true
    this.source = source
    // Define video texture and make sure it's a power-of-2 sized
    this.videoTexture = new THREE.Texture(source)
    this.videoTexture.needsUpdate = true
    this.videoTexture.minFilter = THREE.LinearFilter

    var parameters = { color: 0xffffff, map: this.videoTexture }

    // Create a shader material from the video texture
    this.videoMaterial = new THREE.MeshBasicMaterial( parameters )

    // this.videoMaterial.transparent = true

    // Define a plane facing the camera
    const planeGeomerty = new THREE.PlaneGeometry(1000,1000 * (this.h / this.w),1,1)

    // Create the final mesh and add to scene
    this.videoPlaneMesh = new THREE.Mesh(planeGeomerty, this.videoMaterial)
    this.add(this.videoPlaneMesh)
  }

  updateThreashold(t) {
    this.videoPlaneMesh.material.uniforms.t.value = t
    this.videoPlaneMesh.material.uniforms.t.needsUpdate = true
  }
}

module.exports = Example
