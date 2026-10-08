'use strict';
// Adapt the immutable independent engine's clock only. Prices, damage/reward
// formulas, save input and scheduling order stay in that frozen engine.
function clockReference(original){
 const replacements=[
  ['  var targetGridPositionSec = startPhaseSec+elapsedSec;\n  var targetFarmGridCrossings = Math.floor(targetGridPositionSec);\n  var targetGridPhaseSec = targetGridPositionSec-targetFarmGridCrossings;',
   '  var targetGridPhaseMs = (((clockStartMs%1000)+1000)%1000)+targetFractionSec*1000;\n  var targetGridCarry = Math.floor(targetGridPhaseMs/1000);\n  var targetFarmGridCrossings = targetWholeSec+targetGridCarry;\n  var targetGridPhaseSec = (targetGridPhaseMs-targetGridCarry*1000)/1000;'],
  ['    var elapsedWholeBefore = elapsedWholeSec;\n    var elapsedFractionBefore = elapsedFractionSec;',
   '    var gridCrossingsBefore = farmGridCrossings;\n    var gridRemainingBefore = farmGridRemainingSec;'],
  ['if(elapsedWholeSec===elapsedWholeBefore && elapsedFractionSec===elapsedFractionBefore && actions===0){',
   'if(farmGridCrossings===gridCrossingsBefore && farmGridRemainingSec===gridRemainingBefore && actions===0){'],
  ['function advanceAuthoritativeTime(elapsedSec,options){',
   'var SIM_TICK_REMAINING = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9].map(function(phase){return 1-phase;});\nfunction advanceAuthoritativeTime(elapsedSec,options){'],
  ['  while(remaining>0){',
   '  remaining = simulationRemainingSec();\n  while(remaining>0){'],
  ['    var farmGridStep = Infinity;\n    var economyStep = Infinity;\n    if(state.riftMode===\'farm\'){\n      farmGridStep = farmGridRemainingSec;\n      economyStep = simulationFarmEconomyBoundarySeconds(dps,rewardScale);\n      next = Math.min(next,farmGridStep);',
   '    var farmGridStep = farmGridRemainingSec;\n    var economyStep = Infinity;\n    for(var tickGridIndex=0;tickGridIndex<SIM_TICK_REMAINING.length;tickGridIndex++){\n      var tickTarget=SIM_TICK_REMAINING[tickGridIndex];\n      if(tickTarget<farmGridRemainingSec){farmGridStep=farmGridRemainingSec-tickTarget;break;}\n    }\n    if(Number.isFinite(buffStep) && buffStep>=next && buffStep-next<=32*Number.EPSILON*Math.max(1,buffStep) && (next===abilityStep || next===autoTapStep || next===autoEmpowerStep)) next=buffStep;\n    next = Math.min(next,farmGridStep);\n    if(state.riftMode===\'farm\'){\n      economyStep = simulationFarmEconomyBoundarySeconds(dps,rewardScale);'],
  ['var hitsFarmGrid = state.riftMode===\'farm\' && next===farmGridStep;',
   'var hitsFarmGrid = next===farmGridRemainingSec;']
 ];
 for(const [before,after] of replacements){if(original.split(before).length!==2)throw Error('Non-unique frozen clock marker: '+before);original=original.replace(before,after);}
 return original;
}
module.exports={clockReference};
