window.onload = function () {
    document.addEventListener('click', documentActions);

    //делегирование события клика
    function documentActions(e) {
        const targetElement = e.target;
        //isMobile(any) вернет true если мы работаем на сустройствах с тачскрином
        if (window.innerWidth > 768 && isMobile.any()) {
            if (targetElement.classList.contains('menu__arrow')) {
                targetElement.closest('.menu__item').classList.toggle('_hover');
            }
            if (
                !targetElement.closest('.menu__item') &&
                document.querySelectorAll('.menu__item._hover').length > 0
            ) {
                _removeClasses(
                    document.querySelectorAll('.menu__item._hover'),
                    '_hover',
                );
            }
        }

        if (targetElement.classList.contains('search-form__icon')) {
            document.querySelector('.search-form').classList.toggle('_active');
        } else if (
            !targetElement.closest('.search-form') &&
            document.querySelector('.search-form._active')
        ) {
            document.querySelector('.search-form').classList.remove('_active');
        }

        if (targetElement.classList.contains('products__more')) {
            getProducts(targetElement);
            e.preventDefault();
        }

        if (targetElement.classList.contains('actions-product__button')) {
            const productId =
                targetElement.closest('.item-product').dataset.pid;
            addToCart(targetElement, productId);
            e.preventDefault();
        }

        //определение нажатой иконки корзины
        //условие проверит естли у нажатого обьекта соотвестсвенный класс или у его ближайщего родителя
        if (
            targetElement.classList.contains('cart-header__icon') ||
            targetElement.closest('.cart-header__icon')
        ) {
            //проверка на существования товаров
            if (document.querySelector('.cart-list').children.length > 0) {
                //добавляем класс активности
                document
                    .querySelector('.cart-header')
                    .classList.toggle('_active');
            }
            e.preventDefault();
            //проверка для закрытия меню при нажатии на любом месте
        } else if (
            !targetElement.closest('.cart-header') &&
            !targetElement.classList.contains('actions-product__button')
        ) {
            document.querySelector('.cart-header').classList.remove('_active');
        }

        //обработка при нажатии на корзину для удаления товара
        if (targetElement.classList.contains('cart-list__delete')) {
            //получаем айди елемента
            const productId =
                targetElement.closest('.cart-list__item').dataset.cartPid;
            //вызываем функцию с параметром удаления
            updateCart(targetElement, productId, false);
            e.preventDefault();
        }
    }

    //Header
    const header = document.querySelector('.header');

    const callback = function (entries, observer) {
        if (entries[0].isIntersecting) {
            header.classList.remove('_scroll');
        } else {
            header.classList.add('_scroll');
        }
    };

    const headerObserver = new IntersectionObserver(callback);
    headerObserver.observe(header);

    //Load products from json

    async function getProducts(button) {
        if (!button.classList.contains('_hold')) {
            button.classList.add('_hold');
            const file = 'json/products.json';

            let responce = await fetch(file, {
                method: 'GET',
            });
            if (responce.ok) {
                let result = await responce.json();
                loadProducts(result);
                button.classList.remove('_hold');
                button.remove();
            } else {
                alert('Load Error');
            }
        }
    }

    //подгрузка продуктов из файла
    function loadProducts(data) {
        const productsItems = document.querySelector('.products__items');

        data.products.forEach((item) => {
            const productId = item.id;
            const productUrl = item.url;
            const productImage = item.image;
            const productTitle = item.title;
            const productText = item.text;
            const productPrice = item.price;
            const productOldPrice = item.priceOld;
            const productShareUrl = item.shareUrl;
            const productLikeUrl = item.likeUrl;
            const productLabels = item.labels;

            //получаем начало карточки товара
            let productTemplateStart = `<article data-pid="${productId}" class="products__item item-product">`;
            //конец карточки товара
            let productTemplateEnd = `</article>`;
            //проверка на наличие лейблов
            let productTemplateLabels = '';
            if (productLabels) {
                let productTemplateLabelsStart = `<div class="item-product__labels">`;
                let productTemplateLabelsEnd = `</div>`;
                let productTemplateLabelsContent = '';

                //генерация лейблов путем пробега массива с ними
                productLabels.forEach((labelItem) => {
                    productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
                });

                productTemplateLabels += productTemplateLabelsStart;
                productTemplateLabels += productTemplateLabelsContent;
                productTemplateLabels += productTemplateLabelsEnd;
            }

            let productTemplateImage = `
		<a href="${productUrl}" class="item-product__image _ibg">
			<img src="img/products/${productImage}" alt="${productTitle}">
		</a>
	`;

            let productTemplateBodyStart = `<div class="item-product__body">`;
            let productTemplateBodyEnd = `</div>`;

            let productTemplateContent = `
		<div class="item-product__content">
			<h3 class="item-product__title">${productTitle}</h3>
			<div class="item-product__text">${productText}</div>
		</div>
	`;

            let productTemplatePrices = '';
            let productTemplatePricesStart = `<div class="item-product__prices">`;
            let productTemplatePricesCurrent = `<div class="item-product__price">$ ${productPrice}</div>`;
            let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">$ ${productOldPrice}</div>`;
            let productTemplatePricesEnd = `</div>`;

            productTemplatePrices = productTemplatePricesStart;
            productTemplatePrices += productTemplatePricesCurrent;
            //проверка на старую цену
            if (productOldPrice) {
                productTemplatePrices += productTemplatePricesOld;
            }
            productTemplatePrices += productTemplatePricesEnd;

            let productTemplateActions = `
		<div class="item-product__actions actions-product">
			<div class="actions-product__body">
				<a href="" class="actions-product__button button button_white">Add to cart</a>
				<a href="${productShareUrl}" class="actions-product__link _icon-share">Share</a>
				<a href="${productLikeUrl}" class="actions-product__link _icon-favorite">Like</a>
			</div>
		</div>
	`;
            //собирается блок
            let productTemplateBody = '';
            productTemplateBody += productTemplateBodyStart;
            productTemplateBody += productTemplateContent;
            productTemplateBody += productTemplatePrices;
            productTemplateBody += productTemplateActions;
            productTemplateBody += productTemplateBodyEnd;

            let productTemplate = '';
            productTemplate += productTemplateStart;
            productTemplate += productTemplateLabels;
            productTemplate += productTemplateImage;
            productTemplate += productTemplateBody;
            productTemplate += productTemplateEnd;

            productsItems.insertAdjacentHTML('beforeend', productTemplate);
        });
    }

    //анимация карточки при добавлении в корзину
    function addToCart(productButton, productId) {
        if (!productButton.classList.contains('_hold')) {
            !productButton.classList.add('_hold');
            !productButton.classList.add('_fly');

            const cart = document.querySelector('.cart-header__icon');
            const product = document.querySelector(`[data-pid="${productId}"]`);
            //сюда пойдет картинка товара у которого была нажата кнопка add to cart
            const productImage = product.querySelector('.item-product__image');

            //клонирую картинку
            const productImageFly = productImage.cloneNode(true);

            //координаты картинки товара
            const productImageFlyWidth = productImage.offsetWidth;
            const productImageFlyHeight = productImage.offsetHeight;
            //позиция сверху и снизу
            const productImageFlyTop = productImage.getBoundingClientRect().top;
            const productImageFlyLeft =
                productImage.getBoundingClientRect().left;

            productImageFly.setAttribute('class', '_flyImage _ibg');

            //присваивание координат
            productImageFly.style.cssText = `
			left: ${productImageFlyLeft}px;
			top: ${productImageFlyTop}px;
			width: ${productImageFlyWidth}px;
			height: ${productImageFlyHeight}px;
		`;

            document.body.append(productImageFly);

            //get cart coordinates
            const cartFlyLeft = cart.getBoundingClientRect().left;
            const cartFlyTop = cart.getBoundingClientRect().top;

            //присваиваем новые значения клону и анимации исчезновения пока летит в корзину
            productImageFly.style.cssText = `
			left: ${cartFlyLeft}px;
			top: ${cartFlyTop}px;
			width: 0px;
			height: 0px;
			opacity:0;
		`;

            //реализация добавления в карзину, обработчик добавления когда товар долетит в корзину
            productImageFly.addEventListener('transitionend', function () {
                if (productButton.classList.contains('_fly')) {
                    //как только долетит до корзины его удолят
                    productImageFly.remove();
                    //функция формирования товаров в корзине
                    updateCart(productButton, productId);
                    productButton.classList.remove('_fly');
                }
            });
        }
    }

    //формирование добавленых товаров в корзину (универсальная будет добавлять и удалять товары из корзины)
    function updateCart(productButton, productId, productAdd = true) {
        const cart = document.querySelector('.cart-header');
        const cartIcon = cart.querySelector('.cart-header__icon');
        //span над иконкой корзины
        const cartQuantity = cartIcon.querySelector('span');
        const cartProduct = document.querySelector(
            `[data-cart-pid="${productId}"]`,
        );
        const cartList = document.querySelector('.cart-list');

        if (productAdd) {
            //условие на добавление иконки количества товаров над корзиной
            if (cartQuantity) {
                //если он уже был тоесть дабили еще пару товаров то значение внутри него будет увеличиваться на 1
                cartQuantity.innerHTML = ++cartQuantity.innerHTML;
            } else {
                //если еще спана не было он его добавит в елемент
                cartIcon.insertAdjacentHTML('beforeend', `<span>1</span>`);
            }

            //реализация списка добавленых товаров

            if (!cartProduct) {
                //проверяем условием существует ли добавленый товар
                //получаем оригинальный товар со странички а не клон
                const product = document.querySelector(
                    `[data-pid="${productId}"]`,
                );
                const cartProductImage = product.querySelector(
                    '.item-product__image',
                ).innerHTML;
                const cartProductTitle = product.querySelector(
                    '.item-product__title',
                ).innerHTML;
                //константа формирования списка
                const cartProductContent = `
			<a href="" class="cart-list__image _ibg">${cartProductImage}</a>
			<div class="cart-list__body">
				<a href="" class="cart-list__title">${cartProductTitle}</a>
				<div class="cart-list__quantity">Quantity: <span>1</span></div>
				<a href="" class="cart-list__delete">Delete</a>
			</div>`;
                //интегрируем верстку в елемент списка с определенным id
                cartList.insertAdjacentHTML(
                    'beforeend',
                    `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`,
                );
            } else {
                //условие если товар уже есть
                //получаем количество товара в корзине
                const cartProductQuantity = cartProduct.querySelector(
                    '.cart-list__quantity span',
                );
                //увеличиваем количество товара на 1
                cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
            }
            // После всех действий удаляем класс удержания кнопки чтобы добавить товар еще раз
            productButton.classList.remove('_hold');
        } else {
            //получаем количество добавлено в корзину товара
            const cartProductQuantity = cartProduct.querySelector(
                '.cart-list__quantity span',
            );
            //уменьшаем количество
            cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
            //если результат 0 то удаляем товар
            if (!parseInt(cartProductQuantity.innerHTML)) {
                cartProduct.remove();
            }
            //общее количество товаров уменьшаем на 1
            const cartQuantityValue = --cartQuantity.innerHTML;

            //если больше 0 меняем значение в кружочке
            if (cartQuantityValue) {
                cartQuantity.innerHTML = cartQuantityValue;
            } else {
                //иначе просто убираем кружочек и закрываем список
                cartQuantity.remove();
                cart.classList.remove('_active');
            }
        }
    }

    //Gallery hover effect
    const furniture = document.querySelector('.furniture__body');
    if (furniture && !isMobile.any()) {
        const furnitureItems = document.querySelector('.furniture__items');
		const furnitureColumn = document.querySelectorAll('.furniture__column');

        const speed = furniture.dataset.speed;

        let positionX = 0;
        let coordXprocent = 0;

        function setMouseGalleryStyle() {
            //вычисление актуального размера всего контента (общий размер колонок)
            let furnitureItemsWidth = 0;
            furnitureColumn.forEach((element) => {
                furnitureItemsWidth += element.offsetWidth;
            });

            //получение разницы ширин контента и видимой части
            const furnitureDifferent =
                furnitureItemsWidth - furniture.offsetWidth;
            //добавления смещения положения
            const distX = Math.floor(coordXprocent - positionX);

            //с учетом скорости добавляем позицию и вычисляем ее
            positionX = positionX + distX * speed;
            let position = (furnitureDifferent / 200) * positionX;

            //присваиваем значения в стили (использование 3д транслейта дает более плавную анимацию)
            furnitureItems.style.cssText = `transform: translate3d(${-position}px,0,0);`;

            //запустится только тогда когда есть что двигать
            if (Math.abs(distX) > 0) {
                requestAnimationFrame(setMouseGalleryStyle);
            } else {
                furniture.classList.remove('_init');
            }
        }
        furniture.addEventListener('mousemove', function (e) {
            // Получение ширины
            const furnitureWidth = furniture.offsetWidth;

            // Ноль по середине курсор по середине
            const coordX = e.pageX - furnitureWidth / 2;

            // Получаем проценты
            coordXprocent = (coordX / furnitureWidth) * 200;

            //запустим анимацию когда нет класса инит
            if (!furniture.classList.contains('_init')) {
                requestAnimationFrame(setMouseGalleryStyle);
                furniture.classList.add('_init');
            }
        });
    }

    
};
