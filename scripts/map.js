// Инициализация Яндекс Карты
function initMap() {
    // Проверяем, есть ли контейнер для карты
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Создаем placeholder пока карта загружается
    mapContainer.innerHTML = '<div class="map-placeholder">Загрузка карты...</div>';

    // Проверяем, загружена ли API Яндекс.Карт
    if (typeof ymaps === 'undefined') {
        // Загружаем API Яндекс.Карт
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=your_api_key&lang=ru_RU';
        script.onload = () => {
            // Даем время на загрузку библиотеки
            setTimeout(createMap, 100);
        };
        document.head.appendChild(script);
    } else {
        createMap();
    }

    function createMap() {
        ymaps.ready(function() {
            try {
                const map = new ymaps.Map('map', {
                    center: [55.76, 37.64], // Москва
                    zoom: 10,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                // Добавляем метку
                const placemark = new ymaps.Placemark([55.76, 37.64], {
                    hintContent: 'Моё местоположение',
                    balloonContent: 'Здесь я учусь и работаю'
                }, {
                    preset: 'islands#icon',
                    iconColor: '#000'
                });

                map.geoObjects.add(placemark);

                // Адаптивность карты
                map.container.fitToViewport();

            } catch (error) {
                console.error('Ошибка при создании карты:', error);
                document.getElementById('map').innerHTML = 
                    '<div class="map-placeholder">Не удалось загрузить карту</div>';
            }
        });
    }
}

// Альтернативная версия с использованием iframe (если API не работает)
function initMapFallback() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <iframe 
                src="https://yandex.ru/map-widget/v1/?um=constructor%3Arandom&amp;source=constructor" 
                width="100%" 
                height="300" 
                frameborder="0"
                style="border: 2px solid #000;"
            ></iframe>
        `;
    }
}

// Инициализируем карту при загрузке
document.addEventListener('DOMContentLoaded', initMap);