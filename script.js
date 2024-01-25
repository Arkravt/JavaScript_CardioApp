'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');


class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            function () {
                alert('Failed to set location');
            }
        );
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        this.#map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(e) {
        this.#mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(e) {
        inputDistance.value =
            inputDuration.value =
            inputTemp.value =
            inputClimb.value = '';

        form.classList.add('hidden');
    }

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        const areNumbers = (...numbers) => (numbers.every(number => Number.isFinite(number)));
        const arePositiveNumbers = (...numbers) => (numbers.every(number => number > 0));

        let workout;

        const { lat, lng } = this.#mapEvent.latlng;

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        if (type === 'running') {
            const temp = +inputTemp.value;
            if (!areNumbers(distance, duration, temp) || !arePositiveNumbers(distance, duration, temp))
                return alert('Введите положительное число')

            workout = new Running([lat, lng], distance, duration, temp);
        }

        if (type === 'cycling') {
            const climb = +inputClimb.value;
            if (!areNumbers(distance, duration, climb) || !arePositiveNumbers(distance, duration))
                return alert('Введите положительное число')

            workout = new Cycling([lat, lng], distance, duration, climb);
        }

        this.#workouts.push(workout);
        this._displayWorkout(workout);
        this._displayWorkoutOnSideBar(workout);
        this._hideForm();

    }

    _displayWorkout(workout) {
        const popup = L.popup({
            content: `${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.description}`,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`
        });

        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(popup)
            .openPopup();
    }

    _displayWorkoutOnSideBar(workout) {

        let HTMLText = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚵‍♂️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">км</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">мин</span>
        </div>`;

        if (workout.type === 'running') {
            HTMLText += `
            <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.pace.toFixed(2)}</span>
            <span class="workout__unit">мин/км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">👟⏱</span>
            <span class="workout__value">${workout.temp}</span>
            <span class="workout__unit">шаг/мин</span>
          </div>
        </li>`;
        };

        if (workout.type === 'cycling') {
            HTMLText += `
            <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">км/ч</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🏔</span>
            <span class="workout__value">${workout.climb}</span>
            <span class="workout__unit">м</span>
          </div>
        </li>`
        };

        form.insertAdjacentHTML('afterend', HTMLText);
    }
}



class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        //this.description = `${this.type === 'running' ? '🏃Пробежка' : '🚵‍♂️Велотренировка'} ${new Intl.DateTimeFormat('ru-RU').format(this.date)}`;
        this.description = `${this.type === 'running' ? 'Пробежка' : 'Велотренировка'} ${this.date.toLocaleString()}`;
    }

}



class Running extends Workout {

    type = 'running';

    constructor(coords, distance, duration, temp) {
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
        this._setDescription();
    }

    calculatePace() {
        this.pace = this.duration / this.distance;
    }
}



class Cycling extends Workout {

    type = 'cycling';

    constructor(coords, distance, duration, climb) {
        super(coords, distance, duration);
        this.climb = climb;
        this.calculateSpeed();
        this._setDescription();
    }

    calculateSpeed() {
        this.speed = this.distance / this.duration / 60;
    }

}



const app = new App();
