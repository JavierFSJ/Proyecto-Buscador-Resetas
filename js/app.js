import { ajax } from "./helpers/ajax.js";

const catagoriasSelect = document.querySelector("#categorias");
const res = document.querySelector("#resultado");

/* Modal  */
const modal = new bootstrap.Modal("#modal", {});
const modalHeader = document.querySelector("#staticBackdropLabel");
const modalbody = document.querySelector("#info");

document.addEventListener("DOMContentLoaded", appStart);
catagoriasSelect.addEventListener("change", obtenPlatillos);

function appStart() {
  const urlCategorias =
    "https://www.themealdb.com/api/json/v1/1/categories.php";
  ajax({
    url: urlCategorias,
    cdSuccess: muestraCategorias,
  });
}

function muestraCategorias({ categories }) {
  categories.forEach((categoria) => {
    const { strCategory } = categoria;
    const option = document.createElement("option");
    option.textContent = strCategory;
    option.value = strCategory;
    catagoriasSelect.appendChild(option);
  });
}

function obtenPlatillos(e) {
  const categoria = e.target.value;
  const urlFoodByCategory = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
  cleanRes();
  ajax({
    url: urlFoodByCategory,
    cdSuccess: muestraPlatillos,
  });
}

function muestraPlatillos({ meals }) {
  meals.forEach((meal) => {
    const { strMeal, strMealThumb, idMeal } = meal;
    const mealContainer = document.createElement("DIV");
    mealContainer.classList.add("col-md-4");

    const card = document.createElement("DIV");
    card.classList.add("card", "mb-4");

    const img = document.createElement("IMG");
    img.classList.add("card-img-top");
    img.alt = `Imagen de la receta ${strMeal}`;
    img.src = strMealThumb;

    const bodyCard = document.createElement("DIV");
    bodyCard.classList.add("card-body");

    const recetaHeading = document.createElement("h3");
    recetaHeading.classList.add("card-title", "mb-3");
    recetaHeading.textContent = strMeal;

    const btnMeal = document.createElement("button");
    btnMeal.classList.add("btn", "btn-danger", "w.100");
    btnMeal.textContent = "Ver Receta";
    //btnMeal.dataset.bsTarget = "#modal";
    //btnMeal.dataset.bsToggle = "modal";
    btnMeal.onclick = () => showMeal(idMeal);

    //Renderizar
    bodyCard.appendChild(recetaHeading);
    bodyCard.appendChild(btnMeal);

    card.appendChild(img);
    card.appendChild(bodyCard);

    mealContainer.appendChild(card);

    res.appendChild(mealContainer);
  });
}

function showMeal(id) {
  const urlMeal = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  ajax({
    url: urlMeal,
    cdSuccess: showDetails,
  });
}

function cleanRes() {
  while (res.firstChild) {
    res.removeChild(res.firstChild);
  }
}

function showDetails({ meals }) {
  const [meal] = meals;
  //console.log(meal);
  llenaModal(meal);
  modal.show();
}

function llenaModal(meal) {
  const { strMeal, strCategory, strArea, strInstructions , strMealThumb } = meal;
  modalHeader.textContent = strMeal;
  modalbody.innerHTML = `
    <img class="img-fluid mb-3" src="${strMealThumb}">
    <p class="fw-bold">Category: <span class="fw-normal">${strCategory}</span></p>
    <p class="fw-bold">Area: <span class="fw-normal">${strArea}</span></p>
    <h3>Ingredients</h3>
  `;
  //Ingredientes
  const list = document.createElement('ul');
  list.classList.add('list-group');
  for (let i = 0; i < 20; i++) {
    if(meal[`strIngredient${i}`]){
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      const liIngrediente = document.createElement('li');
      liIngrediente.classList.add('list-group-item');
      liIngrediente.textContent = `${ingredient} - ${measure}`;
      list.appendChild(liIngrediente);
    }
  }

  modalbody.appendChild(list);
  
  modalbody.innerHTML += `
    <h3 class="mt-3">Intructions</h3>
    <p>${strInstructions}</p>
  `

}
