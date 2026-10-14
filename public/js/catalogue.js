let categoriesList = [];
let unitsList = [];

function loadProducts() {
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
}

function queryElements() {
    // Получаем элементы (форма и ее задний фон)
    modalBackground = document.getElementById("modal-background");
    productFormContainer = document.getElementById("product-form"); // Контейнер формы
    productFormFields = productFormContainer.querySelector("form"); // Сама форма (все поля и подписи)
    // Поля формы
    productName = document.getElementById("product-name");
    productCategory = document.getElementById("product-category");
    productUnits = document.getElementById("product-units");
    productFormSubmitButton = productFormFields.querySelector("sumbit");
}

function loadCatalogue() {
    queryElements();
    loadProducts();

    // Заполнение полей списков значений значениями из БД
    fetch('/api/products/categories')
        .then(res => res.json())
        .then(categories => {
            categoriesList = categories.slice();
            productCategory.innerHTML = categories.map(c =>
                `<option value="${c}">${c}</option>`
            ).join('');
            productCategory.innerHTML += `<option value="">Не указано</option>`;
        })
        .catch(err => console.error(err));
    fetch('/api/products/units')
        .then(res => res.json())
        .then(units => {
            unitsList = units.slice();
            productUnits.innerHTML = units.map(u =>
                `<option value="${u}">${u}</option>`
            ).join('');
            productUnits.innerHTML += `<option value="">Не указано</option>`;
        })
        .catch(err => console.error(err));

    modalBackground?.addEventListener('click', (event) => { // Любое нажатие ВНЕ формы приводит к ее закрытию
        if (event.target === modalBackground) {
            closeProductForm();
        }
    });
    productFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name:     productName.value.trim(),
            category: productCategory.value || null,
            units:    productUnits.value || null,
        };

        console.log("Product POST submit request:");
        console.log(payload);

        let req = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        };
        let res = await fetch('/api/products', req);

        console.log(req);
        console.log(res);

        closeProductForm();
        await loadProducts();
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