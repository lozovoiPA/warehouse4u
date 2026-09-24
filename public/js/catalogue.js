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
}