function simulationApplyFarmPassive(elapsedSec,dps,policy,summary){
  if(elapsedSec<=0 || dps<=0) return;
  var damage = dps*elapsedSec;
  if(damage+SIM_EPS < state.enemyHp){
    state.enemyHp -= damage;
    return;
  }

  var maxHp = state.enemyMaxHp>0 ? state.enemyMaxHp : enemyHpFor(state.depth);
  var remainingDamage = Math.max(0,damage-state.enemyHp);
  var additionalKills = Math.floor(remainingDamage/maxHp+1e-12);
  // Avoid catastrophic cancellation from subtracting a huge kills*maxHp
  // product from a similarly huge damage value. Modulo preserves the
  // represented damage remainder directly and is compositional across the
  // fixed Farm batching boundaries.
  var leftover = remainingDamage%maxHp;
  if(leftover<SIM_EPS) leftover=0;
  if(leftover>=maxHp-SIM_EPS){
    additionalKills++;
    leftover=0;
  }

  simulationBatchFarmKills(1+additionalKills,policy,summary);
  if(leftover>0) state.enemyHp = Math.max(SIM_EPS,state.enemyMaxHp-leftover);
}
