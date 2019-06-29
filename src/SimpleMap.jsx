import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { pathFinder, nearestPoint } from './pathFinder.js';

import Distance from './Distance.jsx';


const turf = require('@turf/helpers');

let geodesicPolyline;

class SimpleMap extends Component {
  constructor() {
    super();
    this.state = {
                  markers: [
                    {
                      name: "Current position",
                      lat: 51.04977991674422,
                      lng: -114.06333088874815,
                      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    },
                    {
                      name: "Destination",
                      lat: 51.04872774272838,
                      lng: -114.06589776277542,
                      icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                    }
                  ]
    };
  }

  static defaultProps = {
    center: {
      lat: 51.0458813573339,
      lng: -114.05803084373474
    },
    zoom: 16
  };

  setMapReference = (map,maps) => this.setState({ map: map, maps: maps });

  handleDragEnd = name => (e) => {
    // same as:
    // handleDragEnd (name){
    //   return function handleDragEnd (e) {
    //   }
    // }
    if (geodesicPolyline) {
      geodesicPolyline.setMap(null)
    }
    const markers = [ ...this.state.markers ]
    const index = markers.findIndex(mark => mark.name === name);
    markers[index] = {
      name,
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }
    this.setState({ markers })
    this.renderPolylines();
    // console.log('lat', e.latLng.lat(), 'lng', e.latLng.lng())
  }

  renderMarkers = (map, maps) => {
    this.state.markers.map(marker => {
      const markerObj = new maps.Marker({
        map: map,
        draggable: true,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.name,
        icon: marker.icon
      });
      markerObj.addListener('dragend', this.handleDragEnd(marker.name))
    })
  }

  renderPolylines = () => {
    const { map, maps } = this.state;
      if (map && maps) {
        const route = pathFinder.findPath(
        nearestPoint(turf.point([this.state.markers[0].lng, this.state.markers[0].lat])),
        nearestPoint(turf.point([this.state.markers[1].lng, this.state.markers[1].lat]))
        )
        if (route) {
          const path = route.path
          let distance = Math.floor(route.weight * 1000)
          this.setState({ distance: distance})
            geodesicPolyline = new maps.Polyline({
            path: path.map(latlng => ({ lat: latlng[1], lng: latlng[0] })),
            strokeColor: 'red',
            strokeOpacity: 1,
            strokeWeight: 5
          })
          geodesicPolyline.setMap(map)
        }}
  }

  render() {
    return (
      <div className="map-div" >
        <GoogleMapReact
          bootstrapURLKeys={{ key:"AIzaSyCiU-c0OVTdlXbAj-24y8WY-09OB89AvGA"}}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({map, maps}) => {
            // (new maps.KmlLayer("https://data.calgary.ca/api/geospatial/kp44-4n8q?method=export&format=KMZ")).setMap(map)
            // (new google.maps.KmlLayer("https://github.com/MatthewYiHe/Plus-Fifteen-App/blob/master/Tims.kmz?raw=true")).setMap(map)
            map.data.loadGeoJson('./Plus15.geojson')
            // map.data.loadGeoJson('./TimHortons.geojson')
            this.renderMarkers(map, maps)
            this.setMapReference(map, maps)
            // this.renderSearchBox(map, maps)
          }}
        >
        </GoogleMapReact>
        <Distance distance={this.state.distance} />
      </div>
    );
  }
}

export default SimpleMap;