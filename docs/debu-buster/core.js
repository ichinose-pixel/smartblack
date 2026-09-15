/* Pure, bounded game flow. Times count foreground seconds only. */
(function(root){
  'use strict';
  const LENGTHS={intro:2,eat:6,run:8,result:2,care:5,finish:1,cta:Infinity};
  const NEXT={intro:'eat',eat:'run',run:'result',result:'care',care:'finish',finish:'cta'};
  class Flow {
    constructor(){this.reset();}
    reset(){this.phase='intro';this.elapsed=0;this.total=0;this.meals=0;this.steps=0;this.brewed=false;this.lastStep=-Infinity;this.lastMeal=-Infinity;return this;}
    advance(seconds){
      if(!Number.isFinite(seconds)||seconds<0||this.phase==='cta')return;
      this.elapsed+=seconds;this.total+=seconds;
      while(this.phase!=='cta'&&this.elapsed>=LENGTHS[this.phase]){
        this.elapsed-=LENGTHS[this.phase];this.phase=NEXT[this.phase];
        if(this.phase==='finish')this.brewed=true;
      }
    }
    eat(){if(this.phase!=='eat'||this.meals>=5||this.total-this.lastMeal<0.3)return false;this.lastMeal=this.total;this.meals++;return true;}
    step(){if(this.phase!=='run'||this.steps>=24||this.total-this.lastStep<0.16)return false;this.lastStep=this.total;this.steps++;return true;}
    brew(){if(this.phase!=='care'||this.brewed)return false;this.brewed=true;this.phase='finish';this.elapsed=0;return true;}
    remaining(){return Math.max(0,Math.ceil(LENGTHS[this.phase]-this.elapsed));}
    level(){return Math.min(3,Math.floor(this.meals*0.7));}
  }
  root.SmartblackFlow=Flow;
  if(typeof module!=='undefined')module.exports={Flow,LENGTHS};
})(typeof window==='undefined'?globalThis:window);
