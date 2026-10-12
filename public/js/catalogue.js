var modalBackground;
var productFormContainer;
var productName;
var productCategory;
var productUnits;

function loadCatalogue() {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => {
            const tbody = document.querySelector('#productsTable tbody');

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">В каталоге нет товаров.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>${p.sku ?? "Не указано"}</td>
                    <td>${p.name ?? "Не указано"}</td>
                    <td>${p.category ?? "Не указано"}</td>
                    <td>${p.unit ?? "Не указано"}</td>
                </tr>
            `).join('');
        })
        .catch(err => console.error(err));
    
    // Получаем элементы (форма и ее задний фон)
    modalBackground = document.getElementById("modal-background");
    productFormContainer = document.getElementById("product-form"); // Контейнер формы
    productFormFields = productFormContainer.querySelector("form"); // Сама форма (все поля и подписи)
    // Поля формы
    productName = document.getElementById("product-name");
    productCategory = document.getElementById("product-category");
    productUnits = document.getElementById("product-units");

    modalBackground.addEventListener('click', (event) => { // Любое нажатие ВНЕ формы приводит к ее закрытию
        if (event.target === modalBackground) {
            closeProductForm();
        }
    });
    // showProductForm(); <-- test
}

function showProductForm() {
    productFormFields.reset();
    modalBackground.classList.toggle("not-visible");
}

function closeProductForm() {
    modalBackground.classList.toggle("not-visible");
}

function getCategoryValues() {
    fetch('/api/products/categories')
}