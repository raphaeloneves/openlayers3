(function(){
	$(document).ready(function(){

		var view = new ol.View({
			center : [-5330597.128258645, -1780310.3520614104],
			zoom : 14
		});

		var format = new ol.format.GeoJSON();

		var osm = new ol.layer.Tile({
			source : new ol.source.MapQuest({
				layer : "osm"
			})
		});

		var mapa = new ol.Map({
			target : "mapa",
			controls : ol.control.defaults().extend([
				new ol.control.ScaleLine(),
				new ol.control.ZoomSlider()
			]),
			renderer : "canvas",
			layers : [osm],
			view : view
		});


		
		var pontoSource = new ol.source.Vector();
		var terrenoSource = new ol.source.Vector();
		var benfeitoriasSource = new ol.source.Vector();
		var validacaoSouce = new ol.source.Vector();

		var pontoLayer = new ol.layer.Vector({
			source : pontoSource
		});

		var terrenoLayer = new ol.layer.Vector({
			source : terrenoSource,
			style :estiloTerreno
		});

		var benfeitoriasLayer = new ol.layer.Vector({
			source : benfeitoriasSource
		});

		var estiloPonto = new ol.style.Style({
			image : new ol.style.Icon({
				src : "assets/icon/pin.png",
				anchor: [0.5, 32],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                zIndex : 9999
			})
		});

		var estiloTerreno = new ol.style.Style({
			fill: new ol.style.Fill({
            	color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgb(76,175,80)',
                lineDash: [4,4],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                }),
            }),
            zIndex : 45
		});

		
		mapa.addLayer(terrenoLayer);
		mapa.addLayer(benfeitoriasLayer);
		mapa.addLayer(pontoLayer);


		$("#ponto").click(function(){

			var evento = criarInteracao(pontoSource, "Point")
			mapa.addInteraction(evento);

			evento.on("drawstart", function(ev){
				var f = pontoSource.getFeatures();
			});

			evento.on("drawend", function(ev){
				var feature = ev.feature;
				feature.setStyle(estiloPonto);
				var geometria = format.writeFeatureObject(feature).geometry;
				view.setCenter(geometria.coordinates);
				view.setZoom(15);
				mapa.removeInteraction(evento);
			});
		});

		$("#terreno").click(function(){

			var evento = criarInteracao(terrenoSource, "Polygon");
			
			mapa.addInteraction(evento);

			evento.on("drawstart", function(ev){
				var ponto = pontoSource.getFeatures().length;
				if(ponto == 0){
					alert("Desenhe um ponto primeiro!");
					mapa.removeInteraction(evento);
				}
			});

			evento.on("drawend", function(ev){
				var r = ev.feature;
				r.setStyle(estiloTerreno);
				var featureTerreno = format.writeFeatureObject(r);
				var featurePonto = format.writeFeatureObject(pontoSource.getFeatures()[0]);
				
				var i = format.readFeature(
					turf.intersect(featurePonto, featureTerreno)
				);

				var select = new ol.interaction.Select();
				var modify = new ol.interaction.Modify({
					features : select.getFeatures()
				});
				mapa.addInteraction(select);
				mapa.addInteraction(modify);

				if(i){
					mapa.removeInteraction(evento);
				}else{
					alert("É preciso desenhar o terreno junto ao ponto")
					return false;
				}
			});

		});


		$("#benfeitoria").click(function(){
			var evento = criarInteracao(benfeitoriasSource, "Polygon");
			mapa.addInteraction(evento);

			evento.on("drawstart", function(ev){
				var terreno = terrenoSource.getFeatures().length;
				if(terreno == 0){
					alert("Desenhe um ponto e um terreno primeiro!");
					mapa.removeInteraction(evento)
				}
			});


			


			evento.on("drawend", function(ev){
				var r = ev.feature;
				var benfeitoriaFeature = format.writeFeatureObject(r);
				var featureTerreno = format.writeFeatureObject(terrenoSource.getFeatures()[0]);

				var intersection = format.readFeature(
					turf.intersect(featureTerreno, benfeitoriaFeature)
				)
				if(intersection){
					var benfeitorias = benfeitoriasSource.getFeatures();
					var featuresBenfeitorias = [];


					for(var i = 0; i < benfeitorias.length; i++){
						var feature = format.writeFeatureObject(benfeitorias[i]);
						var i = format.readFeature(
							turf.intersect(benfeitoriaFeature, feature)
						)

						if(i){

							var featureValidacao = format.writeFeatureObject(i).geometry;

							var layerValidacao = new ol.layer.Vector({
								source : new ol.source.Vector({
									features : [
										new ol.Feature({
											geometry : new ol.geom.Polygon(featureValidacao.coordinates)
										})
									]
								}),
								style : new ol.style.Style({
									fill : new ol.style.Fill({
										color :"red"
									})
								})
							});

							mapa.addLayer(layerValidacao);
						}
					}



					mapa.removeInteraction();
				}else{
					return false;
				}
			})
		});

		function criarInteracao(source, type){
			var draw = new ol.interaction.Draw({
				source : source,
				type : type
			});
			return draw;
		}

		

	});
})();