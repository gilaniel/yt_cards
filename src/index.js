import content from './content_scripts';

const page = /tools/;
const match = page.exec(document.URL);

if(match){
  content();
}