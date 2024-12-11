const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken = 'pk.eyJ1IjoibWlja2VwZWRpYSIsImEiOiJjbTRpeGtxMm4wNncwMm5xemZzM2xqMmgyIn0.-t7D4ZPaWgNu5elZj5KaxA';
    var map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11',
/*         center: [-118.113491, 34.111745],
        zoom: 10, */
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className ='marker';
        // Add marker to map
        new mapboxgl
        .Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);

        // Add marker's popup
        new mapboxgl
        .Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
        // Extends the map bounds to include this marker
        bounds.extend(loc.coordinates);
    });
map.fitBounds(bounds, { padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
}});