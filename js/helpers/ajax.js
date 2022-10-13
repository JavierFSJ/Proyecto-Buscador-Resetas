export function ajax(props) {
  const { url, cdSuccess } = props;
  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject(res)))
    .then(json => cdSuccess(json))
    .catch(err => {
      let message = err.statusText || 'Ocurrio un error';
      document.getElementById("error").innerHTML = `
        <div class="alert alert-danger">
          <p>Error ${err.status} : ${message}</p>
        </div>
      `
    });
}


