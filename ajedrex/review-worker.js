importScripts('./vendor/chess.js','./vendor/garbo.js','./insights.js');
self.onmessage=function(event){
 const data=event.data;
 try{
  if(data.kind==='position'){const score=evaluatePosition(new Chess(data.fen),{ms:120,depth:3});self.postMessage({kind:'position',id:data.id,score});}
  else if(data.kind==='review'){
   const report=buildReview(data.startFen,data.moves,{ms:90,depth:3},(done,total)=>self.postMessage({kind:'progress',id:data.id,done,total}));
   self.postMessage({kind:'review',id:data.id,report});
  }
 }catch(error){self.postMessage({kind:'error',id:data.id,error:String(error)});}
};