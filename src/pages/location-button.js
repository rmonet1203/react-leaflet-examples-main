import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import styles from "./location-button.module.css";
import L from "leaflet";
import tileLayer from "../util/tileLayer";

const center = [52.22977, 21.01178];

const LocationButton = () => {
  const map = useMap();

  useEffect(() => {
    // create custom button
    const customControl = L.Control.extend({
      // button position
      options: {
        position: "topleft",
        className: `${styles.locateButton} leaflet-bar`,
        html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
        style:
          "width: 34px; height: 34px; left: 0; margin-top: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
      },

      // method
      onAdd: function (map) {
        this._map = map;
        const button = L.DomUtil.create("div");
        L.DomEvent.disableClickPropagation(button);

        button.title = "locate";
        button.innerHTML = this.options.html;
        button.className = this.options.className;
        button.setAttribute("style", this.options.style);

        L.DomEvent.on(button, "click", this._clicked, this);

        return button;
      },
      _clicked: function (e) {
        L.DomEvent.stopPropagation(e);

        // this.removeLocate();

        this._checkLocate();

        return;
      },
      _checkLocate: function () {
        return this._locateMap();
      },

      _locateMap: function () {
        const locateActive = document.querySelector(`.${styles.locateButton}`);
        const locate = locateActive.classList.contains(styles.locateActive);
        // add/remove class from locate button
        locateActive.classList[locate ? "remove" : "add"](styles.locateActive);

        // remove class from button
        // and stop watching location
        if (locate) {
          this.removeLocate();
          this._map.stopLocate();
          return;
        }

        // location on found
        this._map.on("locationfound", this.onLocationFound, this);
        // locataion on error
        this._map.on("locationerror", this.onLocationError, this);

        // start locate
        this._map.locate({ setView: true, enableHighAccuracy: true });
      },
      onLocationFound: function (e) {
        // add circle
        this.addCircle(e).addTo(this.featureGroup()).addTo(map);

        // add marker
        this.addMarker(e).addTo(this.featureGroup()).addTo(map);

        // add legend
      },
      // on location error
      onLocationError: function (e) {
        this.addLegend("Location access denied.");
      },
      // feature group
      featureGroup: function () {
        return new L.FeatureGroup();
      },
      // add legend
      addLegend: function (text) {
        const checkIfDescriotnExist = document.querySelector(".description");

        if (checkIfDescriotnExist) {
          checkIfDescriotnExist.textContent = text;
          return;
        }

        const legend = L.control({ position: "bottomleft" });

        legend.onAdd = function () {
          let div = L.DomUtil.create("div", "description");
          L.DomEvent.disableClickPropagation(div);
          const textInfo = text;
          div.insertAdjacentHTML("beforeend", textInfo);
          return div;
        };
        legend.addTo(this._map);
      },
      addCircle: function ({ accuracy, latitude, longitude }) {
        return L.circle([latitude, longitude], accuracy / 2, {
          className: "circle-test",
          weight: 2,
          stroke: false,
          fillColor: "#136aec",
          fillOpacity: 0.15,
        });
      },
      addMarker: function ({ latitude, longitude }) {
        return L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: styles.locatedAnimation,
            iconSize: L.point(17, 17),
            popupAnchor: [0, -15],
          }),
        }).bindPopup("Your are here :)");
      },
      removeLocate: function () {
        this._map.eachLayer(function (layer) {
          if (layer instanceof L.Marker) {
            const { icon } = layer.options;
            if (icon?.options.className === styles.locatedAnimation) {
              map.removeLayer(layer);
            }
          }
          if (layer instanceof L.Circle) {
            if (layer.options.className === "circle-test") {
              map.removeLayer(layer);
            }
          }
        });
      },
    });

    // adding new button to map controll
    map.addControl(new customControl());
  }, [map]);

  return null;
};

const MapWrapper = () => {
  const [map, setMap] = useState(null);
  return (
    <MapContainer
      whenCreated={setMap}
      center={center}
      zoom={18}
      scrollWheelZoom={false}
    >
      <TileLayer {...tileLayer} />

      <LocationButton map={map} />
    </MapContainer>
  );
};

export default MapWrapper;
