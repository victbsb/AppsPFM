define([
  "esri/map",
  "esri/layers/FeatureLayer",
  "dojo/_base/lang",
  "esri/tasks/FeatureSet",
  "esri/tasks/GeometryService",
  "esri/tasks/BufferParameters",
  "esri/toolbars/draw",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/PictureFillSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/tasks/locator",
  "esri/Color",
  "dojo/_base/array",
  "dojo/on",

  "esri/graphic",
  "dojo/_base/declare",
  "jimu/BaseWidget",
], function (
  Map,
  FeatureLayer,
  lang,
  FeatureSet,
  GeometryService,
  BufferParameters,
  Draw,
  SimpleFillSymbol,
  SimpleLineSymbol,
  PictureFillSymbol,
  SimpleMarkerSymbol,
  Locator,

  Color,
  array,
  on,
  Graphic,
  declare,
  BaseWidget
) {
  return declare([BaseWidget], {
    baseClass: "jimu-widget-buffer",

    postCreate: function () {

      
      this.map.centerAndZoom([-6.346529865287873, 41.76526810634883], 12);

      // this.restoVidrioPerm = new FeatureLayer(
      //   "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Contenedores_PickUp_Aliste_WFL/FeatureServer/1"
      // );
      // this.papelEnvPerm = new FeatureLayer(
      //   "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Contenedores_PickUp_Aliste_WFL/FeatureServer/2"
      // );
      // this.restoVidrioEst = new FeatureLayer(
      //   "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Contenedores_PickUp_Aliste_WFL/FeatureServer/3"
      // );
      // this.papelEnvEst = new FeatureLayer(
      //   "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Contenedores_PickUp_Aliste_WFL/FeatureServer/4"
      // );

      this.locator = new Locator(
        "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      );
      this.locator.outSpatialReference = this.map.spatialReference;

      this.geomService = new GeometryService(
        "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
      );
      this.params = new BufferParameters();

      this.tb = new Draw(this.map);

      // this.map.addLayers([this.restoVidrioPerm, this.restoVidrioEst, this.papelEnvPerm, this.papelEnvEst])

      //para el punto
      this.line = new SimpleLineSymbol();
      this.line.setColor(new Color([0, 255, 197, 1]));
      this.marker = new SimpleMarkerSymbol();
      this.marker.setColor(new Color([0, 169, 230, 0.63]));
      this.marker.setOutline(this.line);
      this.marker.setSize(37);
      this.marker.setPath(
        "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"
      );
      this.marker.setStyle(SimpleMarkerSymbol.STYLE_PATH);

      //para buffer
      this.fill = new SimpleFillSymbol();
      this.fill.setColor(new Color([85, 255, 0, 0.25]));

      this.permanentes = this.map.getLayer("1879a771c9b-layer-4");
      this.estacionales = this.map.getLayer("1879a771c96-layer-3");
    },


    calcular: function () {


      console.log('this.permanentes', this.permanentes)
      console.log('this.estacionales', this.estacionales)
    

      
      this.tb.activate(Draw.POINT);
      this.tb.on("draw-end", lang.hitch(this, addToMap));
      function addToMap(evt) {


        
      this.newAttributes = {
        "tipo": `${this.tipoCont.options[this.tipoCont.selectedIndex].text}` || "Resto",
        "value": `${this.tiempoCont.options[this.tiempoCont.selectedIndex].text}` || "Permanente"
      };

      // console.log('newattributes', newAttributes)

      this.grafico = new Graphic(evt.geometry, this.marker, this.newAttributes);
      this.map.graphics.add(this.grafico);

      // if(this.tiempoCont.options[this.tiempoCont.selectedIndex].text == "Permanente"){
      //   this.permanentes.applyEdits([grafico])
      // } else{
      //   this.estacionales.applyEdits([grafico])
      // }

      console.log("evt", evt);
      

      console.log("paramsdistancia", this.distancia.value);

      this.params.distances = [this.distancia.value];
      this.params.outSpatialReference = this.map.spatialReference;
      this.params.unit = GeometryService.UNIT_METER;
      this.params.geometries = [evt.geometry];

      this.geomService.buffer(this.params, lang.hitch(this, showBuffer));

      console.log("paramsdistancia", this.params.distances);

      function showBuffer(bufferedGeometries) {
        console.log("buffer");
        bufferedGeometries.forEach(
          lang.hitch(this, function (geometry) {
            var graphic = new Graphic(geometry, this.fill);
            this.map.graphics.add(graphic);

            
            console.log('this.map', this.map)
          })
        );
      }
      }
    },

    villageSelection: function () {
      var municipioSeleccionado =
        this.municipio.options[this.municipio.selectedIndex].text;

      var address = { City: municipioSeleccionado };

      var params = {
        address: address,
      };

      this.locator.addressToLocations(
        params,
        lang.hitch(this, function (evt) {
          console.log("evt", evt);
          var punto = evt[0].location;
          this.map.centerAndZoom(punto, 16);
        })
      );

      console.log(
        "valorMunicipio",
        this.municipio.options[this.municipio.selectedIndex].text
      );
    },

    reset: function () {
      this.map.graphics.clear();
    },

    enviar: function(){
      this.tb.deactivate();
      if(this.tiempoCont.options[this.tiempoCont.selectedIndex].text == "Permanente"){
        this.permanentes.applyEdits([this.grafico])
      } else{
        this.estacionales.applyEdits([this.grafico])
      }
    }

    // contenedores: function () {
    //   if (
    //     this.contenedor.options[this.contenedor.selectedIndex].text ==
    //     "Permanente"
    //   ) {
    //     this.map.addLayers([this.restoVidrioPerm, this.papelEnvPerm]);
    //   } else {
    //     this.map.addLayers([this.restoVidrioEst, this.papelEnvEst]);
    //   }
    // },
  });
});
