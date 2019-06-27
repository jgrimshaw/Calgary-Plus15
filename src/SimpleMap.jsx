import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

import { pathFinder, nearestPoint } from './pathFinder.js';

const turf = require('@turf/helpers');

class SimpleMap extends Component {
  constructor() {
    super();
    this.state = {
                  markers: [
                    {
                      name: "Current position",
                      lat: 51.04977991674422,
                      lng: -114.06333088874815
                    },
                    {
                      name: "Destination",
                      lat: 51.04872774272838,
                      lng: -114.06589776277542
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




  handleDragEnd = (e) => {
    const newPosition = [{name: "Current position",
                          lat: e.latLng.lat(),
                          lng: e.latLng.lng()
                        }];
    const newMarkers = newPosition.concat(this.state.markers.slice(1))
    // console.log(newMarkers)
    this.setState({markers: newMarkers})
    this.renderPolylines();

    console.log('lat', e.latLng.lat(), 'lng', e.latLng.lng())

  }

  renderMarkers = (map, maps) => {
    this.state.markers.map(marker => {
      const markerObj = new maps.Marker({
        map: map,
        draggable: true,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.name
      });
      markerObj.addListener('dragend', this.handleDragEnd)
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
          // console.log("PATHHTHDSGD", JSON.stringify(path))
          let geodesicPolyline = new maps.Polyline({
            path: path.map(latlng => ({ lat: latlng[1], lng: latlng[0] })),
            strokeColor: 'red',
            strokeOpacity: 1,
            strokeWeight: 5
          })
          maps.clear();
          geodesicPolyline.setMap(map)
          console.log("Route after", route)
        }}
  }

  componentDidUpdate(){
    console.log('current state', this.state)
  }



  render() {

    return (
      <div style={{ height: '80vh', width: '100%'}}>
        <GoogleMapReact
          // key={this.state.markers[0].lng}
          bootstrapURLKeys={{ key:"AIzaSyCiU-c0OVTdlXbAj-24y8WY-09OB89AvGA"}}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({map, maps}) => {
            map.data.loadGeoJson('./Plus15.geojson')
            this.renderMarkers(map, maps)
            // this.renderPolylines(map, maps)
            this.setMapReference(map, maps)
          }}
        >

        </GoogleMapReact>
      </div>
    );
  }
}



export default SimpleMap;