#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.000);
vec3 colorB = vec3(0.000,0.924,1.000);

float plot (vec2 st, float pct){
  return  smoothstep( pct-0.005, pct, st.y) -
          smoothstep( pct, pct+0.005, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    float t1 = sin(u_time * 2.) * 0.05;
    float t2 = cos(u_time * 2.) * 0.15 + 1.;
    float dist = distance(vec2(0.25 + t2 * 0.25,0.864 + t1), st.xy) * (0.4 + t1);
    vec3 pct = vec3(smoothstep(0.0, 1.0, dist), smoothstep(0.0, 1.0, dist), smoothstep(0.0, 1.0, dist));

    color = mix(colorA, colorB, pct);

    // Add a tint of white to the brightest part of the gradient
    color = mix(color, vec3(1.0), smoothstep(0.390, 1.0, dist));

    // Plot transition lines for each channel
    //color = mix(color,vec3(1.0,0.0,0.0),plot(st,pct.r));
    //color = mix(color,vec3(0.0,1.0,0.0),plot(st,pct.g));
    //color = mix(color,vec3(0.0,0.0,1.0),plot(st,pct.b));

    gl_FragColor = vec4(color,1.0);
}