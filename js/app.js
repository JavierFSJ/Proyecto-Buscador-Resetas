import { ajax } from "./helpers/ajax.js";
import { showToast } from "./helpers/toast.js";

const catagoriasSelect = document.querySelector("#categorias");
const res = document.querySelector("#resultado");
const divFavorites = document.querySelector(".favoritos");

/* Modal  */
const modal = new bootstrap.Modal("#modal", {});
const modalHeader = document.querySelector("#staticBackdropLabel");
const modalbody = document.querySelector("#info");

document.addEventListener("DOMContentLoaded", appStart);
if (catagoriasSelect) {
  catagoriasSelect.addEventListener("change", obtenPlatillos);
}

function appStart() {
  if (catagoriasSelect) {
    const urlCategorias =
      "https://www.themealdb.com/api/json/v1/1/categories.php";
    ajax({
      url: urlCategorias,
      cdSuccess: muestraCategorias,
    });
  }

  /*  Pestaña de favoritos  */
  if (divFavorites) {
    obtenerFavoritos();
  }
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
  ajax({
    url: urlFoodByCategory,
    cdSuccess: muestraPlatillos,
  });
}

function muestraPlatillos({ meals }) {
  clean(res);
  meals.forEach((meal) => {
    const { strMeal, strMealThumb, idMeal } = meal;
    const mealContainer = document.createElement("DIV");
    mealContainer.classList.add("col-md-4");

    const card = document.createElement("DIV");
    card.classList.add("card", "mb-4");

    const img = document.createElement("IMG");
    img.classList.add("card-img-top");
    img.alt = `Imagen de la receta ${strMeal}`;
    img.src = strMealThumb ?? meal.img;

    const bodyCard = document.createElement("DIV");
    bodyCard.classList.add("card-body");

    const recetaHeading = document.createElement("h3");
    recetaHeading.classList.add("card-title", "mb-3");
    recetaHeading.textContent = strMeal ?? meal.title;

    const btnMeal = document.createElement("button");
    btnMeal.classList.add("btn", "btn-danger", "w.100");
    btnMeal.textContent = "Ver Receta";
    //btnMeal.dataset.bsTarget = "#modal";
    //btnMeal.dataset.bsToggle = "modal";
    btnMeal.onclick = () => {showMeal(idMeal ?? meal.id)};

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

function clean(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function showDetails({ meals }) {
  const [meal] = meals;
  llenaModal(meal);
  modal.show();
}

function llenaModal(meal) {
  const {
    strMeal,
    strCategory,
    strArea,
    strInstructions,
    strMealThumb,
    idMeal,
  } = meal;

  modalHeader.textContent = strMeal;
  modalbody.innerHTML = `
    <img class="img-fluid mb-3" src="${strMealThumb}">
    <p class="fw-bold">Category: <span class="fw-normal">${strCategory}</span></p>
    <p class="fw-bold">Area: <span class="fw-normal">${strArea}</span></p>
    <h3>Ingredients</h3>
  `;

  //Ingredientes
  const list = document.createElement("ul");
  list.classList.add("list-group");
  for (let i = 0; i < 20; i++) {
    if (meal[`strIngredient${i}`]) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      const liIngrediente = document.createElement("li");
      liIngrediente.classList.add("list-group-item");
      liIngrediente.textContent = `${ingredient} - ${measure}`;
      list.appendChild(liIngrediente);
    }
  }

  modalbody.appendChild(list);

  modalbody.innerHTML += `
    <h3 class="mt-3">Intructions</h3>
    <p>${strInstructions}</p>
  `;

  const modalFooter = document.querySelector(".modal-footer");
  clean(modalFooter);
  /* Botones de cerrar */
  const btnFavorite = document.createElement("BUTTON");
  btnFavorite.classList.add("btn", "btn-danger", "col");
  btnFavorite.textContent = existeStorage(idMeal)
    ? "Eliminar Favorito"
    : "Guardar Favorito";

  //Local Storege
  btnFavorite.onclick = () => {
    if (existeStorage(idMeal)) {
      deleteFavorite(idMeal);
      btnFavorite.textContent = "Guardar Favorito";
      showToast("Eliminado Correctamente");
      return;
    }

    addToFavorites({
      id: idMeal,
      title: strMeal,
      img: strMealThumb,
    });
    showToast("Agregado Correctamente");
    btnFavorite.textContent = "Eliminar Favorito";
  };

  const btnCerrar = document.createElement("BUTTON");
  btnCerrar.classList.add("btn", "btn-secondary", "col");
  btnCerrar.textContent = "Cerrar";
  btnCerrar.onclick = () => {
    modal.hide();
  };

  modalFooter.appendChild(btnFavorite);
  modalFooter.appendChild(btnCerrar);
}

function addToFavorites(meal) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  localStorage.setItem("favorites", JSON.stringify([...favorites, meal]));
}

function deleteFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  const deleted = favorites.filter((favorite) => favorite.id !== id);
  localStorage.setItem("favorites", JSON.stringify(deleted));
}

function existeStorage(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
  return favorites.some((favorite) => favorite.id === id);
}

/*  ============================
        Favoritos
  =============================*/

function obtenerFavoritos() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
  if(favorites.length){
    const obj = {meals: favorites}
    muestraPlatillos(obj);
    return;
  }
  const noFavoritos = document.createElement('P');
  noFavoritos.textContent = 'No hay favoritos aún';
  noFavoritos.classList.add('fs-4' , 'text-center' , 'font-bold' , 'mt-5');
  res.appendChild(noFavoritos);
}
