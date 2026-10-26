(function(g){
  var S=g.SR;
  S.progression={
    // Later maps need sustained base growth, independent of first ring/pet RNG.
    lateGrowthStart:35,
    lateGrowth:0.12,
    // From level 40, practice accrues only while battle is running and settles
    // on actual kills. 59 levels take about 71 combat hours before kill bonuses.
    practiceSeconds:4320,
    killExpScale:0.05,
    // Rested experience compensates for reduced offline combat opportunity;
    // loot, resources and battle time still use the ordinary 70% simulation.
    offlineExpBonus:1.35,
    expToNext:function(level){return level<40?level*15:Math.round(44000*Math.pow(level/40,1.3));}
  };
})(typeof window!=='undefined'?window:globalThis);
