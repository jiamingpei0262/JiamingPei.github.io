const selectedOrder = [

"pei2026distributed",

"zhong2021super",

"pei2025f3",

"pei2024review",

"pei2022tkagfl",

"pei2022ecnn",

"pei2025neuro",

"wang2025communication",

"pei2022pac",

"pei2024entropy",

"pei2023clustered"

];





function clean(text){

if(!text)
return "";

return text
.replace(/[{}]/g,"")
.trim();

}






function hasKeyword(pub,key){

let keywords =
pub.keywords || [];


if(typeof keywords==="string"){

keywords =
keywords.split(",");

}


return keywords
.map(k=>k.trim().toLowerCase())
.includes(key);

}







function formatAuthor(pub){


let authors =
pub.authors ||
[];




return authors.map(author=>{


let name =
clean(author);


let family =
"";


let given =
"";



if(name.includes(",")){


let parts =
name.split(",");


family =
parts[0].trim();


given =
parts[1].trim();



name =
given+" "+family;


}





let html =
name;



if(
name.toLowerCase()
==="jiaming pei"
){

html =
"<strong>Jiaming Pei</strong>";



if(hasKeyword(pub,"corresp")){

html +=
"<sup class='corresponding'>*</sup>";

}

}



return html;


}).join(", ");



}







function createLinks(pub){


let html="";


if(pub.pdf){

html +=
`<a href="${pub.pdf}">
PDF
</a>`;

}


if(pub.doi){

let doi =
pub.doi;


if(!doi.startsWith("http")){

doi =
"https://doi.org/"+doi;

}


html +=
`<a href="${doi}">
DOI
</a>`;

}


if(pub.code){

html +=
`<a href="${pub.code}">
Code
</a>`;

}



return html;


}







function createPublication(pub,label){


let venue =
pub.journal ||
pub.booktitle ||
"";


let year =
pub.year || "";



let note="";


if(pub.addendum ||
pub.note){

note =
`
<span class="note">
[${pub.addendum || pub.note}]
</span>
`;

}



return `

<li class="publication-item">


<div class="pub-number">

[${label}]

</div>



<div class="pub-content">


<div class="author">

${formatAuthor(pub)}

</div>


<div>

<span class="title">

"${clean(pub.title)}."

</span>


<span class="venue">

${venue}, ${year}.

</span>

${note}

</div>



<div class="links">

${createLinks(pub)}

</div>



</div>


</li>

`;

}








function sortYear(list){

return list.sort(

(a,b)=>

parseInt(b.year || 0)
-
parseInt(a.year || 0)

);

}







async function loadPublications(){


let response =
await fetch(
"data/publications.json"
);


let pubs =
await response.json();





// Selected


let selected =
selectedOrder
.map(
key =>
pubs.find(
p=>p.entrykey===key
)

)
.filter(Boolean);



document
.getElementById(
"selected-publications"
)
.innerHTML =
selected.map(
(p,i)=>
createPublication(
p,
"S"+(i+1)
)

).join("");







// Journal


let journals =
sortYear(

pubs.filter(
p=>p.entrytype==="article"
)

);



document
.getElementById(
"journal-publications"
)
.innerHTML =

journals.map(

(p,i)=>

createPublication(

p,

"J"+(journals.length-i)

)

).join("");







// Conference


let conferences =
sortYear(

pubs.filter(

p=>

p.entrytype==="inproceedings"

)

);



document
.getElementById(
"conference-publications"
)
.innerHTML =


conferences.map(

(p,i)=>

createPublication(

p,

"C"+(conferences.length-i)

)

).join("");



}



loadPublications();