import type { SpotType } from '../models/types'
export const spots:SpotType[] = [
  ['vegetation','Schilf- oder Krautkante','Deckung, Nahrung und klare Übergänge.',['lake','canal'],'vegetation',[],['spring','summer','autumn'],1],
  ['rocks','Steinschüttung','Wärme, Kleintiere und viele Spalten.',['lake','river','canal'],'rocks',['Hängergefahr'],['spring','summer','autumn','winter'],2],
  ['vertical','Spundwand oder senkrechte Kante','Direkter Zugang zu mehreren Tiefen.',['canal','river'],'vertical',[],['summer','autumn','winter'],3],
  ['bridge','Brückenbereich','Schatten, Struktur und gebündelte Strömung.',['river','canal','lake'],'bridge',['Schiffsverkehr beachten'],['spring','summer','autumn','winter'],4],
  ['inflow','Einlauf oder Zufluss','Sauerstoff und eingetragene Nahrung.',['lake','river','canal'],'inflow',['Starke Strömung'],['spring','summer','autumn'],5],
  ['current-break','Kehrströmung oder Strömungsschatten','Energiesparende Standplätze neben Nahrungstransport.',['river'],'current_break',[],['spring','summer','autumn','winter'],1],
  ['harbor','Hafeneinfahrt oder Beckenübergang','Wanderkorridor zwischen ruhigem und offenem Wasser.',['river','canal','lake'],'harbor',['Verkehr beachten'],['autumn','winter'],5],
  ['shallow','Flachwasserzone','Schnell erwärmt und zeitweise voller Beutefisch.',['lake','river','canal'],'shallow',[],['spring','summer'],6],
  ['dropoff','Abbruchkante oder Tiefenübergang','Kurzer Weg zwischen Jagd- und Ruhezone.',['lake','river','canal'],'dropoff',[],['summer','autumn','winter'],1],
  ['wood','Totholz oder Schattenkante','Deckung und konzentrierte Beute.',['lake','river','canal'],'wood',['Hohe Hängergefahr'],['spring','summer','autumn'],4],
].map(([id,label,description,waters,feature,risks,seasonalAffinity,priority])=>({id,label,description,waters,feature,risks,seasonalAffinity,priority} as SpotType))
