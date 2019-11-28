import content from './cards';
import endings from './endings';

const page = /cards/;
const match = page.exec(document.URL);

if(match){
  content();
}

endings();