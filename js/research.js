async function loadResearch(){


const researchResponse =
await fetch(
"data/research.json"
);


const publicationResponse =
await fetch(
"data/publications.json"
);



const research =
await researchResponse.json();


const publications =
await publicationResponse.json();




const container =
document.getElementById(
"research-container"
);





research.forEach(area=>{


let html = `

<section class="research-area">


<h2>
${area.title}
</h2>


<p class="research-description">
${area.description}
</p>


<div class="research-publications">

`;




area.publications.forEach(item=>{


const pub =
publications.find(
p =>
p.entrykey === item.key
);



if(!pub)
return;



html += `


<div class="research-paper">


<div class="paper-image">


<img
src="${item.image}"
alt="${pub.title}"
>


</div>




<div class="paper-info">


<h3>

${pub.title}

</h3>



<p class="authors">

${formatAuthors(pub)}

</p>



<p class="venue">

${pub.journal ||
pub.booktitle ||
""},

${pub.year}

</p>



<p>

${item.highlight}

</p>




<div class="links">

${createLinks(pub)}

</div>



</div>



</div>


`;



});




html += `

</div>

</section>

`;



container.innerHTML += html;


});


}







function formatAuthors(pub){


return (pub.authors || [])

.map(
author=>{


if(
author.includes("Pei")
){

return `<strong>
Jiaming Pei
</strong>`;

}


return author;


}

)
.join(", ");

}








function createLinks(pub){


let html="";



if(pub.pdf){

html +=
`
<a href="${pub.pdf}">
PDF
</a>
`;

}


if(pub.doi){


let doi =
pub.doi;


if(!doi.startsWith("http")){

doi =
"https://doi.org/"+doi;

}



html +=
`
<a href="${doi}">
DOI
</a>
`;

}



if(pub.code){


html +=
`
<a href="${pub.code}">
Code
</a>
`;

}



return html;


}







loadResearch();