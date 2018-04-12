uniform float t;
uniform sampler2D map;
uniform sampler2D backdrop;
uniform bool compare;
varying vec2 vUv;

void main() {
  vec4 fg = texture2D(map, vUv);
  vec4 bg = texture2D(backdrop, vUv);

  // Subtract colors at point
  vec4 diff = abs(fg - bg);

  // Apply threshold
  float s = step(t, diff.r + diff.g + diff.b);

  gl_FragColor = fg * s;
}
