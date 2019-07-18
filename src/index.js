import content from './content_scripts';

const page = /cards/;
const match = page.exec(document.URL);

if(match){
  content();
}