export const defaults = Object.freeze({seed:42,gravity:1.05,restitution:0.48,interval:4.25,duration:54});
export const W=1080,H=1920,FPS=30,DT=1000/120;
export const vessel={x:540,y:1000,r:438};
export const names=['Comienzos','Nueva vida','Confianza','Glamour','Elegancia','Lujo','La reina'];
// Two legal chains each produce a level 6; their collision produces level 7.
export const recipe=[1,1,2,3,4,5,1,1,2,3,4,5];
export function config(input={}) {const c={...defaults}; const ranges={seed:[0,2147483647],gravity:[0.2,2],restitution:[0.05,0.85],interval:[1,6],duration:[45,90]};for(const [k,[a,b]] of Object.entries(ranges)){if(input[k]!==undefined){const n=Number(input[k]);if(!Number.isFinite(n)||n<a||n>b)throw Error(`Valor inválido: ${k}`);c[k]=n;}}c.seed=Math.trunc(c.seed);return c;}
