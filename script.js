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

    constructor() {
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
        this._getPosition();
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

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        inputDistance.value = inputDuration.value = inputTemp.value = inputClimb.value = '';

        const { lat, lng } = this.#mapEvent.latlng;

        const popup = L.popup({
            content: 'Тренировка',
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup'
        });

        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(popup)
            .openPopup();
    }

}

class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duraion) {
        this.coords = coords;
        this.distance = distance;
        this.duraion = duraion;
    }

}

class Running extends Workout {
    constructor(coords, distance, duraion, temp) {
        super(coords, distance, duraion);
        this.temp = temp;
        this.calculatePace();
    }

    calculatePace() {
        this.pace = this.duraion / this.distance;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duraion, speed) {
        super(coords, distance, duraion);
        this.speed = speed;
        this.calculateSpeed();
    }

    calculateSpeed() {
        this.speed = this.distance / this.duraion / 60;
    }

}


const app = new App();
