function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
  if(elapsedSec<=0 || dps<=0) return;
  var damage = dps*elapsedSec;
  if(damage+SIM_EPS < state.enemyHp){
    state.enemyHp -= damage;
    return;
  }

  var maxHp = state.enemyMaxHp>0 ? state.enemyMaxHp : enemyHpFor(state.depth);
  // Decompose damage before subtracting the partially damaged enemy. This
  // avoids both a rounded quotient/modulo counting the same boundary twice
  // and cancellation of a small current HP from a huge damage value.
  var remainder = damage%maxHp;
  var kills = Math.round((damage-remainder)/maxHp);
  // Retain the existing 1e-12 quotient and SIM_EPS HP boundary tolerances,
  // applying a carry once to this shared decomposition, never twice.
  if(remainder>=maxHp-SIM_EPS || remainder/maxHp+1e-12>=1){
    kills++;
    remainder=0;
  }
  var difference = remainder-state.enemyHp;
  var leftover;
  if(difference>=-SIM_EPS || difference/maxHp>=-1e-12){
    kills++;
    leftover=Math.max(0,difference);
  } else {
    leftover=maxHp+ difference;
  }
  if(leftover<SIM_EPS) leftover=0;

  simulationBatchFarmKills(kills,policy,summary);
  if(leftover>0) state.enemyHp = Math.max(SIM_EPS,state.enemyMaxHp-leftover);
}
