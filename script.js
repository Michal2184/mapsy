"use strict";

// parent class
class Activity {
  date = new Date();
  id = String(Date.now());
  constructor(coords, distance, duration, people, comment) {
    this.coords = coords;
    this.people = people;
    this.duration = duration;
    this.comment = comment;
    this.distance = distance;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    //this.description =
  }
}

// child classes

class Walking extends Activity {
  constructor(coords, distance, duration, people, comment) {
    super(coords, distance, duration, people, comment);
    this.activityTypeHTML = "Walking";
    this.dateHTML = (new Date() + "").slice(4, -45);
  }
}

class Cycling extends Activity {
  constructor(coords, distance, duration, people, comment) {
    super(coords, distance, duration, people, comment);
    this.activityTypeHTML = "Cycling";
    this.dateHTML = (new Date() + "").slice(4, -45);
  }
}

// main app Class

const logo = document.getElementById("logo");
const sidebarForm = document.querySelector(".form_content");
const distanceForm = document.querySelector(".distance");
const durationForm = document.querySelector(".duration");
const commentForm = document.querySelector(".comment");
const elevationForm = document.querySelector(".elevation");
const inputType = document.querySelector(".input-type");
const cadenceOption = document.querySelector(".form_row-comment");
const elevationOption = document.querySelector(".form_row-elevation");
const peopleForm = document.querySelector(".people");
const box = document.querySelector(".sidebar_content_box");

class App {
  #map;
  #mapEvent;
  #activityClass = "walking-popup";
  #activityType;
  #activites = [];
  constructor() {
    // get postion
    this._getPosition();
    // load local storage
    this._getLocalStorage();

    sidebarForm.addEventListener("submit", this._newWorkOut.bind(this));
    //inputType.addEventListener("change", this._toggleElevation.bind(this));
    box.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), ///   if not set you will get udefined
        function () {
          console.log("no GPS lock");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    console.log(coords);
    this.#map = L.map("map").setView(coords, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // hadling clicks on map
    this.#map.on("click", this._showForm.bind(this));

    this.#activites.forEach((activ) => {
      this._renderActivity(activ);
      this._renderActivityMarker(activ);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    sidebarForm.classList.remove("hidden");
    commentForm.focus();
  }

  _toggleActivity(curr) {
    const activities = ["walking-popup", "cycling-popup"];

    switch (curr) {
      case "Walking":
        return activities[0];
        break;
      case "Cycling":
        return activities[1];
        break;
      default:
        return;
        break;
    }
  }

  _newWorkOut(e) {
    //helper functions:
    //check every element and if one fails will return false
    // const validInputs = (...inputs) =>
    //   inputs.every((inp) => Number.isFinite(inp));
    // //
    // const allPositives = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();
    // get data from form
    this.#activityType = inputType.value;
    const distance = +distanceForm.value;
    const duration = +durationForm.value;
    const comment = commentForm.value;
    const people = +peopleForm.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const newCoords = [lat, lng];
    console.log(newCoords);
    let activity;
    // check data
    //
    //  IMPORTANT DOUBLE SAVING

    //
    // if walking make obj || cycling make obj
    console.log(typeof distance === "number");
    console.log(people > 0);
    console.log(typeof duration === "number");
    if (
      this.#activityType === "Walking" &&
      typeof distance === "number" &&
      people > 0 &&
      typeof duration === "number"
    ) {
      activity = new Walking(newCoords, distance, duration, people, comment);
    } else if (
      this.#activityType === "Cycling" &&
      typeof distance === "number" &&
      people > 0 &&
      typeof duration === "number"
    ) {
      activity = new Cycling(newCoords, distance, duration, people, comment);
    } else {
      distanceForm.value = durationForm.value = peopleForm.value = commentForm.value =
        "";
      sidebarForm.classList.add("hidden");
    }
    this.#activites.push(activity);

    // add obj to activityType array
    this._renderActivityMarker(activity);
    this._renderActivity(activity);
    // display marker

    // render activityType on the list

    // clear fileds
    distanceForm.value = durationForm.value = peopleForm.value = commentForm.value =
      "";
    sidebarForm.classList.add("hidden");
    activity = null;

    /// save in local storage
    this._setLocalStorage();
  }

  _renderActivityMarker(activity) {
    L.marker(activity.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${this._toggleActivity(activity.activityTypeHTML)}`,
        })
      )
      .setPopupContent(
        `${activity.activityTypeHTML === "Walking" ? "🚶" : "🚴"} ${
          activity.activityTypeHTML
        } on ${activity.dateHTML}`
      )
      .openPopup();
  }

  _renderActivity(activity) {
    const html = `
    <li class="activity" data-id="${activity.id}">
      <div class=" ${
        activity.activityTypeHTML === "Walking"
          ? "walking_event"
          : "cycling_event"
      } event_flex">
        <div class="event_flex1">
          <p class="walking_event-title">${activity.activityTypeHTML} - ${
      activity.dateHTML
    }</p>
        </div>
        <div class="event_flex2">
          <div class="event_details">
            <span class="event_icon">🚶</span>
            <span class="event_distance">${activity.distance}</span>
            <span class="event_option">km</span>
          </div>
          <div class="event_detail">
            <span class="event_icon">⏰</span>
            <span class="event_duration">${activity.duration}</span>
            <span class="event_unit">min</span>
          </div>
          <div class="event_details">
            <span class="event_icon"> 👨‍👩‍👧‍👦</span>
            <span class="event_value">${activity.people}</span>
            <span class="event_unit">People</span>
          </div>
        </div>
        <div class="event_details log_comment">
          <span class="event_icon">📜</span>
          <span class="event_value">${activity.comment}</span>
        </div>  
       </div>
    </li>
    `;
    sidebarForm.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const activityElement = e.target.closest(".activity");
    if (!activityElement) return;
    const activity = this.#activites.find(
      (work) => work.id === activityElement.dataset.id
    );
    this.#map.setView(activity.coords, 14, {
      animate: true,
      pan: {
        duaration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("activities", JSON.stringify(this.#activites));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("activities"));
    console.log(data);

    if (!data) return;

    this.#activites = data;
    this.#activites.forEach((activ) => {
      console.log(activ);
      this._renderActivity(activ);
    });
  }
}

const app = new App();
