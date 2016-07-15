(function(){
	$(document).ready(function(){

	var style1 = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'blue',
        width: 3
    }),
    fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
    })
  });
var style2 = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'orange',
        width: 3
    }),
    fill: new ol.style.Fill({
        color: 'orange'
    })
  });

var polygon1 = new ol.Feature(new ol.geom.Polygon([[[-5e6, -1e6], [-4e6, 1e6],
            [-3e6, -1e6], [-5e6, -1e6]]]));
var polygon2 = new ol.Feature(new ol.geom.Polygon([[[-5e6, 0], [-4e6, 2e6],
            [-3e6, 0], [-5e6, 0]]]));

var format = new ol.format.GeoJSON();
var intersection = format.readFeature(
    turf.intersect(
        format.writeFeatureObject(polygon1),
        format.writeFeatureObject(polygon2)));

var source = new ol.source.Vector();
source.addFeature(polygon1);
source.addFeature(polygon2);

var sourceIntersection = new ol.source.Vector();
sourceIntersection.addFeature(intersection);

var layer = new ol.layer.Vector({
  source: source,
  style: style1
});

var layerIntersection = new ol.layer.Vector({
  source: sourceIntersection,
  style: style2
});

var map = new ol.Map({
  layers: [layer, layerIntersection],
  target: 'mapa',
  view: new ol.View({
    center: [0, 1000000],
    zoom: 2
  })
});

});

		
})();