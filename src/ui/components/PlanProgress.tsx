const steps=['Zielfisch','Bedingungen','Angelplan'] as const

export function PlanProgress({step}:{step:0|1|2}){
  return <ol role="list" className="plan-progress" aria-label="Dein Weg zum Angelplan">
    {steps.map((label,index)=><li key={label} aria-current={index===step?'step':undefined}><span aria-hidden="true">{index+1}</span>{label}</li>)}
  </ol>
}
