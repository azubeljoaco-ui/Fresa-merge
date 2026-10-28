import {createCanvas,loadImage} from '@napi-rs/canvas';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Simulation} from '../src/simulation.js';
import {render} from '../src/renderer.js';
import {mix,wav} from '../src/audio.js';
import {W,H,FPS,config} from '../src/config.js';
export async function exportVideo(options={}, {output='exports/fresa-merge.mp4',assetDir='public/assets/characters',voicePath='public/assets/audio/wow.wav',onProgress=()=>{},width=W,height=H}={}){
 const cfg=config(options);await mkdir(resolve(output,'..'),{recursive:true});
 const images=await Promise.all(Array.from({length:7},(_,i)=>loadImage(join(assetDir,`${i+1}.png`)).catch(()=>{throw Error(`Falta ${i+1}.png. Importa las siete fresas originales antes de exportar.`);})));const sim=new Simulation(cfg),canvas=createCanvas(width,height),ctx=canvas.getContext('2d');let voice;
 const audioFile=output+'.audio.wav',voiceFile=output+'.voice.raw';
 try{await readFile(voicePath);await run('ffmpeg',['-y','-v','error','-i',voicePath,'-t','1.5','-ac','1','-ar','48000','-f','f32le',voiceFile]);const bytes=await readFile(voiceFile);voice=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));}catch(e){if(e.code!=='ENOENT')throw e;}
 const ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',output+'.silent.mp4'],{stdio:['pipe','ignore','pipe']});let errors='';ff.stderr.on('data',d=>errors+=d);let pipeError;ff.stdin.on('error',e=>{pipeError=e;});const completion=once(ff,'close');
 try{for(let frame=0;frame<cfg.duration*FPS;frame++){sim.advance(frame/FPS);ctx.save();ctx.scale(width/W,height/H);render(ctx,sim,images);ctx.restore();if(pipeError)throw pipeError;if(!ff.stdin.write(canvas.data()))await once(ff.stdin,'drain');if(frame%30===0)onProgress(frame/(cfg.duration*FPS)*.94);}
 ff.stdin.end();const [code]=await completion;if(code!==0)throw Error(errors||'Falló FFmpeg');
 await writeFile(audioFile,wav(mix(sim.events,cfg.duration,voice)));await run('ffmpeg',['-y','-v','error','-i',output+'.silent.mp4','-i',audioFile,'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',output]);
 const report={config:cfg,merges:sim.events,finalAt:sim.finalAt,voice:!!voice,width,height,fps:FPS};await writeFile(output+'.json',JSON.stringify(report,null,2));onProgress(1);return report;
 }catch(e){ff.kill();await rm(output,{force:true});throw e;}finally{await Promise.all([audioFile,voiceFile,output+'.silent.mp4'].map(f=>rm(f,{force:true})));}
}
function run(cmd,args){return new Promise((ok,no)=>{const p=spawn(cmd,args);let err='';p.stderr.on('data',d=>err+=d);p.on('error',no);p.on('close',c=>c===0?ok():no(Error(err)));});}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href){const input=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):{};exportVideo(input,{onProgress:p=>process.stdout.write(`\rExportando ${Math.round(p*100)}%`)}).then(r=>console.log(`\nListo. Forma final: ${r.finalAt??'no alcanzada'} s; voz: ${r.voice}`)).catch(e=>{console.error(e.message);process.exitCode=1;});}
