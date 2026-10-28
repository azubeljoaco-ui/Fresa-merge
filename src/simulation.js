import Matter from 'matter-js';
import {config,DT,vessel,recipe} from './config.js';
const {Engine,Bodies,Body,Composite,Events}=Matter;
export class Simulation {
 constructor(options={}){this.config=config(options);this.time=0;this.tick=0;this.drop=0;this.events=[];this.finalAt=null;this.rng=this.config.seed>>>0;this.nextId=1;this.pending=[];this.engine=Engine.create({enableSleeping:true,positionIterations:10,velocityIterations:10});this.engine.gravity.y=this.config.gravity;this.characters=[];
 const walls=[];for(let i=0;i<120;i++){const angle=(i+.5)*Math.PI*2/120;const x=vessel.x+Math.cos(angle)*vessel.r,y=vessel.y+Math.sin(angle)*vessel.r;if(y<620&&Math.abs(x-540)<112)continue;walls.push(Bodies.rectangle(x,y,2*Math.PI*vessel.r/120+4,30,{isStatic:true,angle:angle+Math.PI/2,restitution:this.config.restitution}));}
 walls.push(Bodies.rectangle(429,390,18,465,{isStatic:true}),Bodies.rectangle(651,390,18,465,{isStatic:true}));Composite.add(this.engine.world,walls);
 Events.on(this.engine,'collisionStart',e=>{for(const p of e.pairs){const a=p.bodyA.parent,b=p.bodyB.parent;if(a.plugin.level&&a.plugin.level===b.plugin.level&&a.plugin.level<7)this.pending.push([a,b]);}});
 }
 random(){this.rng=(1664525*this.rng+1013904223)>>>0;return this.rng/4294967296;}
 spawn(level,x=540,y=250,velocity={x:0,y:0}){const ry=62+level*16,rx=ry*.46;const vertices=Array.from({length:24},(_,i)=>({x:Math.cos(i*Math.PI/12)*rx,y:Math.sin(i*Math.PI/12)*ry}));const b=Bodies.fromVertices(x,y,[vertices],{restitution:this.config.restitution,friction:.18,frictionStatic:.5,frictionAir:.003,slop:.3,sleepThreshold:90});b.plugin={level,id:this.nextId++,rx,ry,born:this.time};Body.setVelocity(b,velocity);Body.setAngularVelocity(b,(this.random()-.5)*.012);this.characters.push(b);Composite.add(this.engine.world,b);return b;}
 step(){if(this.time>=this.config.duration)return;const period=Math.min(this.config.interval,(this.config.duration-5)/(recipe.length-1));if(this.finalAt===null&&this.drop<recipe.length&&this.time>=this.drop*period){this.spawn(recipe[this.drop++],540+(this.random()-.5)*15);}
 Engine.update(this.engine,DT);const consumed=new Set();for(const [a,b]of this.pending){if(consumed.has(a)||consumed.has(b)||!this.characters.includes(a)||!this.characters.includes(b))continue;consumed.add(a);consumed.add(b);const level=a.plugin.level+1,x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2;Composite.remove(this.engine.world,[a,b]);this.characters=this.characters.filter(c=>c!==a&&c!==b);const born=this.spawn(level,x,y,{x:(a.velocity.x+b.velocity.x)/2,y:(a.velocity.y+b.velocity.y)/2});Body.setAngle(born,(a.angle+b.angle)/2);this.events.push({time:this.time,level,x,y,id:born.plugin.id});if(level===7)this.finalAt=this.time;}
 this.pending=[];this.tick++;this.time=this.tick*DT/1000;
 }
 advance(t){while(this.time+1e-8<t&&this.time<this.config.duration)this.step();}
}
