importScripts('./vendor/garbo.js');
self.onmessage=function(e){try{self.postMessage(GARBO.choose(e.data.fen,e.data.ms,e.data.depth));}catch(error){self.postMessage({error:String(error)});}};
