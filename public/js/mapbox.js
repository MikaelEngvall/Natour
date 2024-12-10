const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken = 'pk.eyJ1IjoibWlja2VwZWRpYSIsImEiOiJjbTRpeGtxMm4wNncwMm5xemZzM2xqMmgyIn0.-t7D4ZPaWgNu5elZj5KaxA';
    var map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11'
    });