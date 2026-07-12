import {readFileSync} from 'node:fs'

const index=readFileSync(new URL('../index.html',import.meta.url),'utf8')
const fallback=readFileSync(new URL('../public/404.html',import.meta.url),'utf8')
const required=['__route','/angelkompass']

if(!required.every(marker=>index.includes(marker)&&fallback.includes(marker))){
  throw new Error('Der GitHub-Pages-Fallback und die Wiederherstellung in index.html sind nicht synchron.')
}

console.log('GitHub-Pages-Routingfallback gültig.')
