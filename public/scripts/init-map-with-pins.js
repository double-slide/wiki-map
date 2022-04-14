/** A function that adds the markers in the given pin list to the given map
 * binds a popup to the marker that shows up on click with pin info
 * and on marker right click show popup of the edit/delete pin interface
 */
const renderPinsInMap = (pins, map) => {
  // get the map id from address bar for post req
  const mapId = window.location.href.split("/").pop();
  //
  for (const pin of pins) {
    const lat = Number(pin.latitude);
    const lng = Number(pin.longitude);
    let marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`
        <h3>${pin.title}</h3>
        ${pin.description? `<p>${pin.description}</p>` : ''}
        ${pin.image_url? `<img src='${pin.image_url}'>` : ''}
      `)
      .on('click', function() {
        this.openPopup();
      })
      .on('contextmenu', function() {
        this.getPopup().setContent(`
        <form action="/maps/${mapId}/${pin.id}/update" method="POST">
        <input value='${pin.title}' name="title"></input>
        <textarea name="desc">${pin.description? `${pin.description}` : ""}</textarea>
        <input value='${pin.image_url? `${pin.image_url}` : ""}' name="img"></input>
        <button class="edit" type="submit">Save Changes</button>
        </form>
        <form action="/maps/${mapId}/${pin.id}/delete" method="POST">
        <button class="delete button error" >Delete</button>
        </form>
        `).openOn(map)
      })
      .on("popupclose", function() {
        this.getPopup().setContent(`
        <h3>${pin.title}</h3>
        ${pin.description? `<p>${pin.description}</p>` : ''}
        ${pin.image_url? `<img src='${pin.image_url}'>` : ''}
      `)
      });

  }
};


/** A function that initiats the map based on the map id in the address bar
 * and registers a event listener that shows the create pin interface when map is clicked
 */
const initMapAndPins = function () {

  const mapId = window.location.href.split("/").pop();

  $.ajax(`/maps/${mapId}/pins`)
    .then((values) => {
      const pins = values[0];
      const bound = values[1];
      let map;

      console.log("pins:",pins);
      console.log("bound:",bound);

      console.log("pins object keys length: ", Object.keys(pins).length)
      if (!Object.keys(pins).length) {
        map = L.map('map-container').setView([20, 0], 1.5);
      } else {
        map = L.map('map-container').fitBounds([
          [bound.min_lat, bound.min_lng],
          [bound.max_lat, bound.max_lng]
        ]);
        if (map) console.log("fitBound map exist");
      }

      L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmFuYW5hbmVrbyIsImEiOiJja3YydGt1bnAwMzl4MnBvOHJ1cWU0djl5In0.aAvP-kOL6unp0F5o1dIq4g'
      }).addTo(map);

      return [pins, map];

    })
    .then(([pins, map]) => {
      // Event listner to show create pin interface when map is clicked
      map.on("click", (event) => {
        console.log("event.latlng", event.latlng);
        const { lat, lng } = event.latlng;
        let popup = L.popup().setLatLng([lat, lng])
        .setContent(`
        <form action="/maps/${mapId}/${lat}/${lng}/pins" method="POST">
        <input placeholder="Title (Required)" name="title"></input>
        <textarea placeholder="Description (Optional)" name="desc"></textarea>
        <input placeholder="Image URL (Optional)" name="img"></input>
        <button id="newPinButton" type="submit">Create Pin</button>
        </form>
        `).openOn(map);

      })
      //
      if(Object.keys(pins).length) {
        console.log("starting to load pins in");
        renderPinsInMap(pins, map);
      }

      return map;
    })
    .catch(err => {
      console.log("InitMapAndPins Error: ", err.message);
    });

};

// document ready
$(() => {
  initMapAndPins();
});


