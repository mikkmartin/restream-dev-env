#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    //Example colors.  In practise these would be passed in
    // as parameters
    vec4 color0 = vec4(0.918, 0.824, 0.573, 1.0); // EAD292
    vec4 color1 = vec4(0.494, 0.694, 0.659, 1.0); // 7EB1A8
    vec4 color2 = vec4(0.992, 0.671, 0.537, 1.0); // FDAB89
    vec4 color3 = vec4(0.859, 0.047, 0.212, 1.0); // DB0C36
 
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
 
    //Example coordinates.  In practise these would be passed in
    // as parameters
    vec2 P0 = vec2(0.31,0.3);
    vec2 P1 = vec2(0.7,0.32);
    vec2 P2 = vec2(0.28,0.71);
    vec2 P3 = vec2(0.72,0.75);
 
    vec2 Q = P0 - P2;
    vec2 R = P1 - P0;
    vec2 S = R + P2 - P3;
    vec2 T = P0 - uv;
 
    float u;
    float t;
 
    if(Q.x == 0.0 && S.x == 0.0) {
        u = -T.x/R.x;
        t = (T.y + u*R.y) / (Q.y + u*S.y);
    } else if(Q.y == 0.0 && S.y == 0.0) {
        u = -T.y/R.y;
        t = (T.x + u*R.x) / (Q.x + u*S.x);
    } else {
        float A = S.x * R.y - R.x * S.y;
        float B = S.x * T.y - T.x * S.y + Q.x*R.y - R.x*Q.y;
        float C = Q.x * T.y - T.x * Q.y;
        // Solve Au^2 + Bu + C = 0
        if(abs(A) < 0.0001)
            u = -C/B;
        else
        u = (-B+sqrt(B*B-4.0*A*C))/(2.0*A);
        t = (T.y + u*R.y) / (Q.y + u*S.y);
    }
    u = clamp(u,0.0,1.0);
    t = clamp(t,0.0,1.0);
 
    // These two lines smooth out t and u to avoid visual 'lines' at the boundaries.  They can be removed to improve performance at the cost of graphics quality.
    t = smoothstep(0.0, 1.0, t);
    u = smoothstep(0.0, 1.0, u);
 
    vec4 colorA = mix(color0,color1,u);
    vec4 colorB = mix(color2,color3,u);
    gl_FragColor = mix(colorA, colorB, t);
}
