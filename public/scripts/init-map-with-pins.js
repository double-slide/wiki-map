/** A function that creates a marker with given pin info on given map
 * binds a popup to the marker that shows up on click with pin info
 * and on marker right click show popup of the edit/delete pin interface
 * if the user is the creator of the pin
 */

const createMarker = (userId, pin, map) => {
  // get the map id from address bar for sending req
  const mapId = window.location.href.split("/").pop();
  // Add the marker to the correct geolocation
  const lat = Number(pin.latitude);
  const lng = Number(pin.longitude);
  let marker = L.marker([lat, lng])
  .addTo(map)

    if (userId === pin.creator_id) {
    console.log(`this is pin ID: ${pin.id}, creator ID: ${pin.creator_id}`);
    //a event listener that changes the popup content to edit/delete mode on rightclick
    marker.bindPopup(`
    <h3 class="pin-info">${pin.title}</h3>
    ${pin.description? `<p class="pin-info">${pin.description}</p>` : ''}
    ${pin.image_url? `<img class="pin-img" src='${pin.image_url}'>` : ''}
    <footer>Right click to manage your pin</footer>
    `, {
      closeOnClick: false,
      keepInView: true
    })
    .on('click', function() {
      this.openPopup();
    })
    .on("popupclose", function() {
      this.getPopup().setContent(`
      <h3 class="pin-info">${pin.title}</h3>
      ${pin.description? `<p class="pin-info">${pin.description}</p>` : ''}
      ${pin.image_url? `<img class="pin-img" src='${pin.image_url}'>` : ''}
      <footer>Right click to manage your pin</footer>
  `)
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
    });
  } else {
    //binds a popup to the marker that shows up on click and resets on popup close
    marker
    .bindPopup(`
      <h3 class="pin-info">${pin.title}</h3>
      ${pin.description? `<p class="pin-info">${pin.description}</p>` : ''}
      ${pin.image_url? `<img class="pin-img" src='${pin.image_url}'>` : ''}
    `, {
      closeOnClick: false,
      keepInView: true
    })
    .on('click', function() {
      this.openPopup();
    })
    .on("popupclose", function() {
      this.getPopup().setContent(`
      <h3 class="pin-info">${pin.title}</h3>
      ${pin.description? `<p class="pin-info">${pin.description}</p>` : ''}
      ${pin.image_url? `<img class="pin-img" src='${pin.image_url}'>` : ''}
    `)
    })
  }
  return marker;

}


/** A function that creates the markers in the given pin list for the given map */
const renderPinsInMap = (userId, pins, map) => {
  // loop over the array to add marker and event listener for each pin
  for (const pin of pins) {
    createMarker(userId, pin, map);
  }
};


/** A function that initiats the map based on the map id in the address bar
 * and registers a event listener that shows the create pin interface when map is clicked
 */
const initMapAndPins = function () {
  // get map id from address bar for sending req
  const mapId = window.location.href.split("/").pop();
  // sends a request to gets the pins info and bound info
  $.ajax(`/maps/${mapId}/pins`)
    .then((values) => {
      // assign values get from server to variables
      const pins = values[0];
      const bound = values[1];
      const userId = values[2];
      console.log("userId in received from ajax", userId)

      let map;

      if (!Object.keys(pins).length) {
        // set map to default view if there's no pin for this map id
        map = L.map('map-container', {
          doubleClickZoom: false
        }).setView([20, 0], 1.5);
      } else {
        // set map to fitbound view if bound is provided
        map = L.map('map-container').fitBounds([
          [bound.min_lat, bound.min_lng],
          [bound.max_lat, bound.max_lng]
        ], {
          padding: [50, 50]
        });
        if (map) console.log("fitBound map exist");
      }

      L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery ?? <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmFuYW5hbmVrbyIsImEiOiJja3YydGt1bnAwMzl4MnBvOHJ1cWU0djl5In0.aAvP-kOL6unp0F5o1dIq4g'
      }).addTo(map);

      return [userId, pins, map];

    })
    .then(([userId, pins, map]) => {

      // Event listner to show create pin interface when map is clicked
      map.on("dblclick", (event) => {
        console.log("event.latlng", event.latlng);
        const { lat, lng } = event.latlng;
        let popup = L.popup({
          closeOnClick: false,
          keepInView: true
        }).setLatLng([lat, lng])
        .setContent(`
        <form action="/maps/${mapId}/${lat}/${lng}/pins" method="POST">
        <input placeholder="Title (Required)" name="title"></input>
        <textarea placeholder="Description (Optional)" name="desc"></textarea>
        <input placeholder="Image URL (Optional)" name="img"></input>
        <button id="newPinButton" type="submit">Create Pin</button>
        </form>
        `).openOn(map);

      })

      // Render any pins if exist on the given map
      if(Object.keys(pins).length) {
        console.log("starting to load pins in");
        renderPinsInMap(userId, pins, map);
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


