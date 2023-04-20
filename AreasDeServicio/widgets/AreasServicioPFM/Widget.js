define([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/dijit/Popup",
  "esri/dijit/PopupTemplate",
  "esri/tasks/locator",
  "dojo/_base/lang",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/ServiceAreaTask",
  "esri/tasks/ServiceAreaParameters",
  "esri/tasks/FeatureSet",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "dojo/_base/array",
  "esri/graphic",
  "esri/layers/PixelBlock",
  "esri/layers/pixelFilters/StretchFilter",
  "dojo/_base/declare",
  "jimu/BaseWidget",
], function (
  Map,
  FeatureLayer,
  Popup,
  PopupTemplate,
  Locator,
  lang,
  Query,
  QueryTask,
  ServiceAreaTask,
  ServiceAreaParameters,
  FeatureSet,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Color,
  arrayUtils,
  Graphic,
  PixelBlock,
  StretchFilter,
  declare,
  BaseWidget
) {
  return declare([BaseWidget], {
    baseClass: "jimu-widget-areasServicio",

    postCreate: function () {
      //Locator para la selección de municipio

      this.locator = new Locator(
        "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      );
      this.locator.outSpatialReference = this.map.spatialReference;

      //Query apara que calcule lo que está dentro de la extensión del mapa

      this.serviceAreaTask = new ServiceAreaTask(
        "https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World"
      );
      // this.serviceAreaTask = new ServiceAreaTask("https://formacion.esri.es/server/rest/services/RedMadrid/NAServer/Service%20Area")
      this.params = new ServiceAreaParameters();
      // var infoService = this.serviceAreaTask.getServiceDescription();

      //Tiempo a pie

      this.params.travelMode = {
        attributeParameterValues: [{
          attributeName: "Avoid Unpaved Roads",
          parameterName: "Restriction Usage",
          value: "AVOID_HIGH"
        }, {
          attributeName: "Avoid Private Roads",
          parameterName: "Restriction Usage",
          value: "AVOID_MEDIUM"
        }, {
          attributeName: "Driving an Automobile",
          parameterName: "Restriction Usage",
          value: "PROHIBITED"
        }, {
          attributeName: "Through Traffic Prohibited",
          parameterName: "Restriction Usage",
          value: "AVOID_HIGH"
        }, {
          attributeName: "TravelTime",
          parameterName: "Vehicle Maximum Speed (km/h)",
          value: 0
        }, {
          attributeName: "Roads Under Construction Prohibited",
          parameterName: "Restriction Usage",
          value: "PROHIBITED"
        }, {
          attributeName: "Avoid Gates",
          parameterName: "Restriction Usage",
          value: "AVOID_MEDIUM"
        }, {
          attributeName: "Avoid Express Lanes",
          parameterName: "Restriction Usage",
          value: "PROHIBITED"
        }, {
          attributeName: "Avoid Carpool Roads",
          parameterName: "Restriction Usage",
          value: "PROHIBITED"
        }],
        description: "Configura el tránsito de coches y otros automóviles pequeños similares, tales como furgonetas, y encuentra alternativas para optimizar el tiempo de viaje. Respeta calles de un sentido, evita giros prohibidos y sigue otras normas específicas para coches. Si se especifica una hora de inicio, se utilizan velocidades de viaje dinámicas en función del tráfico si se encuentran disponibles.",
        distanceAttributeName: "Kilometers",
        id: "FEgifRtFndKNcJMJ",
        impedanceAttributeName: "TravelTime",
        name: "Tiempo de conducción",
        restrictionAttributeNames: ["Avoid Unpaved Roads", "Avoid Private Roads", "Driving an Automobile", "Through Traffic Prohibited", "Roads Under Construction Prohibited", "Avoid Gates", "Avoid Express Lanes", "Avoid Carpool Roads"],
        simplificationTolerance: 10,
        simplificationToleranceUnits: "esriMeters",
        timeAttributeName: "TravelTime",
        type: "AUTOMOBILE",
        useHierarchy: true,
        uturnAtJunctions: "esriNFSBAtDeadEndsAndIntersections"
      }

      // console.log('serviceAreaTask',this.serviceAreaTask.getServiceDescription())

      //Tiempo en coche

      this.params.travelMode = {
        attributeParameterValues: [{
          attributeName: "Avoid Private Roads",
          parameterName: "Restriction Usage",
          value: "AVOID_MEDIUM"
        }, {
          attributeName: "Walking",
          parameterName: "Restriction Usage",
          value: "PROHIBITED"
        }, {
          attributeName: "Preferred for Pedestrians",
          parameterName: "Restriction Usage",
          value: "PREFER_LOW"
        }, {
          attributeName: "WalkTime",
          parameterName: "Walking Speed (km/h)",
          value: 5
        }, {
          attributeName: "Avoid Roads Unsuitable for Pedestrians",
          parameterName: "Restriction Usage",
          value: "AVOID_HIGH"
        }],
        description: "Sigue caminos y carreteras que permiten el paso de peatones y encuentra alternativas para optimizar el tiempo de viaje. La velocidad media al caminar se establece en 5 kilómetros por hora.",
        distanceAttributeName: "Kilometers",
        id: "caFAgoThrvUpkFBW",
        impedanceAttributeName: "WalkTime",
        name: "Tiempo a pie",
        restrictionAttributeNames: ["Avoid Private Roads", "Avoid Roads Unsuitable for Pedestrians", "Preferred for Pedestrians", "Walking"],
        simplificationTolerance: 2,
        simplificationToleranceUnits: "esriMeters",
        timeAttributeName: "WalkTime",
        type: "WALK",
        useHierarchy: false,
        uturnAtJunctions: "esriNFSBAllowBacktrack"
      }
      

      this.farmacias = new FeatureLayer(
        "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Farmacias_Aliste/FeatureServer/28"
      );

      this.centrosEducativos = new FeatureLayer(
        "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/CentrosEducativosAliste/FeatureServer/26"
      );

      this.centrosSalud = new FeatureLayer(
        "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Centros_de_Salud_en_Aliste/FeatureServer/29"
      );

      this.guardiaCivil = new FeatureLayer(
        "https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Guardia_civil_Aliste/FeatureServer/0"
      );

      this.baseAereaIncendios = new FeatureLayer("https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Emergencias_Aliste/FeatureServer/8")

      this.bomberos = new FeatureLayer("https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Emergencias_Aliste/FeatureServer/7")

      this.policia = new FeatureLayer("https://services8.arcgis.com/BtkRLT3YBKaVGV3g/arcgis/rest/services/Emergencias_Aliste/FeatureServer/6")



      this.map.addLayers([this.farmacias, this.centrosEducativos, this.centrosSalud, this.guardiaCivil, this.baseAereaIncendios, this.bomberos, this.policia]);

      this.query = new Query();
      this.query.returnGeometry = true;
      this.query.outFields = ["*"];
      this.query.where = "1 = 1";

      this.map.centerAndZoom([-6.346529865287873, 41.76526810634883], 12);

      this.line = new SimpleLineSymbol();
      this.line.setColor(new Color([26, 26, 26, 1]));
 

      this.fill = new SimpleFillSymbol();
      this.fill.setColor(new Color([230, 230, 0, 0.76]));

      this.params.defaultBreaks = [1, 3, 5];

      // console.log("this.map", this.map);
      // console.log("thisCentrosSalud", this.centrosSalud);
      // console.log("thisCentrosEducativos", this.centrosEducativos);
      // console.log("this.query.geometry", this.query.geometry);
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
          var punto = evt[0].location;
          this.map.centerAndZoom(punto, 16);
        })
      );

      console.log(
        "valorMunicipio",
        this.municipio.options[this.municipio.selectedIndex].text
      );
      console.log("this.map.extent", this.map.extent);
    },

    capas: function(){
      console.log('this.map', this.map)
      // this.map.removeLayer(this.map.itemInfo.itemData.operationalLayers[0].id)
      if (
        this.facilities.options[this.facilities.selectedIndex].text ==
        "Farmacias"
      ) {
        this.map.addLayer(this.farmacias);

        this.query.geometry = this.map.extent;

        this.farmacias.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("puntos", featureSet);
            this.puntos = featureSet.features;
            console.log("featureSet", featureSet);

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;
          })
        );

        console.log("facilitiesFarmacias", this.params.facilities);
      } else if (
        this.facilities.options[this.facilities.selectedIndex].text ==
        "Centros de salud"
      ) {
        this.map.addLayer(this.centrosSalud);

        this.query.geometry = this.map.extent;

        this.centrosSalud.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("evt", featureSet);
            this.puntos = featureSet.features;

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;
          })
        );
      } else if (
        this.facilities.options[this.facilities.selectedIndex].text ==
        "Guardia Civil"
      ) {
        this.map.addLayer(this.guardiaCivil);
        this.query.geometry = this.map.extent;

        this.guardiaCivil.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("evt", featureSet);
            this.puntos = featureSet.features;

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;
          })
        );

        console.log("facilitiescentrosSal", this.params.facilities);
      } else if (
        this.facilities.options[this.facilities.selectedIndex].text ==
        "Base aérea para incendios"
      ){
        this.map.addLayer(this.baseAereaIncendios);
        this.query.geometry = this.map.extent;

        this.baseAereaIncendios.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("evt", featureSet);
            this.puntos = featureSet.features;

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;

            // console.log("facilities", facilities);
          })
        );

        console.log("facilitiescentrosEd", this.params.facilities);
      } else if (
        this.facilities.options[this.facilities.selectedIndex].text ==
        "Bomberos"
      ){
        this.map.addLayer(this.bomberos);
        this.query.geometry = this.map.extent;

        this.bomberos.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("evt", featureSet);
            this.puntos = featureSet.features;

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;

            // console.log("facilities", facilities);
          })
        );

        console.log("facilitiescentrosEd", this.params.facilities);
      } else {
        this.map.addLayer(this.policia);
        this.query.geometry = this.map.extent;

        this.policia.queryFeatures(
          this.query,
          lang.hitch(this, function (featureSet) {
            console.log("evt", featureSet);
            this.puntos = featureSet.features;

            this.capas = new FeatureSet();
            this.capas.features = this.puntos;
            this.params.facilities = this.capas;

            // console.log("facilities", facilities);
          })
        );

        console.log("facilitiescentrosEd", this.params.facilities);
      }
    },

    
    calculate: function () {
      this.map.graphics.clear();
      // console.log(
      //   "atributeType antes del if",
      //   this.params.travelMode.impedanceAttributeName
      // );
      if (
        this.area.options[this.area.selectedIndex].text == "Tiempo en coche"
      ) {
        this.params.travelMode.impedanceAttributeName = "TravelTime";
        // this.params.travelMode = this.traveltime;
        // this.params.travelMode = "DriveTime";
        // console.log(
        //   "atributeType",
        //   this.params.travelMode.impedanceAttributeName
        // );
      } else {
        this.params.travelMode.impedanceAttributeName = "WalkTime";
        // this.params.travelMode= this.traveltime;
        // this.params.travelMode = "WalkTime";
        // console.log(
        //   "atributeType",
        //   this.params.travelMode.impedanceAttributeName
        // );
      }



      if(this.time.value == "1"){
        this.params.defaultBreaks = [1];   

      } else if(this.time.value == "3"){
        this.params.defaultBreaks = [3]; 
      }
      else if(this.time.value == "5"){
        this.params.defaultBreaks = [5]; 
      }
      else if(this.time.value == "10"){
        this.params.defaultBreaks = [10]; 
      }
      else if(this.time.value == "15"){
        this.params.defaultBreaks = [15]; 
      } else{
        this.params.defaultBreaks = [1, 3, 5]
      }

      this.serviceAreaTask.solve(
        this.params,
        lang.hitch(this, function (solveResult) {
          console.log("solveResult", solveResult);

          arrayUtils.forEach(
            solveResult.serviceAreaPolygons,
            lang.hitch(this, function (serviceArea) {
              if (serviceArea.attributes.ToBreak == 15) {
                this.line = new SimpleLineSymbol();
                this.line.setColor(new Color([26, 26, 26, 1]));
                this.fill = new SimpleFillSymbol();
                this.fill.setColor(new Color([26, 26, 26, 0.25]));
                this.fill.setOutline(this.line);
                }
                else if (serviceArea.attributes.ToBreak == 10) {
                this.line = new SimpleLineSymbol();
                this.line.setColor(new Color([230, 0, 0, 1]));
                this.fill = new SimpleFillSymbol();
                this.fill.setColor(new Color([230, 0, 0, 0.25]));
                this.fill.setOutline(this.line);
                }
               else if (serviceArea.attributes.ToBreak == 5) {
                this.line = new SimpleLineSymbol();
                this.line.setColor(new Color([230, 0, 0, 1]));
                this.fill = new SimpleFillSymbol();
                this.fill.setColor(new Color([255, 170, 0, 0.25]));
                this.fill.setOutline(this.line);
              } else if (serviceArea.attributes.ToBreak == 3) {
                this.line = new SimpleLineSymbol();
                this.line.setColor(new Color([230, 152, 0, 1]));
                this.fill = new SimpleFillSymbol();
                this.fill.setColor(new Color([255, 255, 0, 0.25]));
                this.fill.setOutline(this.line);
              } else {
                this.line = new SimpleLineSymbol();
                this.line.setColor(new Color([56, 168, 0, 1]));
                this.fill = new SimpleFillSymbol();
                this.fill.setColor(new Color([85, 255, 0, 0.25]));
                this.fill.setOutline(this.line);
              }

              serviceArea.setSymbol(this.fill);
              console.log("thismap", this.map);
              this.map.graphics.add(serviceArea);

            })
          );
        })
      );
    },
    
    reset: function () {
      this.map.graphics.clear();
    },

    // selectTipoImpedancia: function(){

    //   if(this.selectorImpedancia.options.value == "tiempo"){
    //      this.params.impedanceAttribute;
    //   } else {
    //     this.params.impedanceAttribute;
    //   }
    // },
    // selectDistancia: function(){

    // },

    //   calcularFarmacias: function () {

    //     var query = new Query();
    //     query.geometry = this.map.extent;
    //     query.returnGeometry = true;
    //     query.outFields = ["*"];
    //     query.where = "1 = 1";

    //     this.farmacias.queryFeatures(
    //       query,
    //       lang.hitch(this, function (featureSet) {
    //         console.log("evt", featureSet);
    //         this.puntos = featureSet.features;
    //       })
    //     );

    //     this.params.outSpatialReference = this.map.spatialReference;
    //     console.log("serviceArea", this.serviceAreaTask);
    //     console.log("farmacias", this.farmacias);

    //     var facilities = new FeatureSet();
    //     facilities.features = this.puntos;
    //     this.params.facilities = facilities;

    //     this.serviceAreaTask.solve(this.params, lang.hitch(this, (function (solveResult) {
    //       console.log("solveResult", solveResult);

    //       arrayUtils.forEach(
    //         solveResult.serviceAreaPolygons, lang.hitch(this, function (serviceArea) {

    //           if (serviceArea.attributes.ToBreak == 5) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 0, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 0, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else if (serviceArea.attributes.ToBreak == 3) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 152, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([56, 168, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([85, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           }

    //           serviceArea.setSymbol(this.fill);
    //           console.log('thismap', this.map)
    //           this.map.graphics.add(serviceArea);

    //           // var grafico = new Graphic()
    //         })
    //       );
    //     }))
    // )},

    //   calcularCentrosEducativos: function () {

    //     var query = new Query();
    //     query.geometry = this.map.extent;
    //     query.returnGeometry = true;
    //     query.outFields = ["*"];
    //     query.where = "1 = 1";

    //     this.centrosEducativos.queryFeatures(
    //       query,
    //       lang.hitch(this, function (featureSet) {
    //         console.log("evt", featureSet);
    //         this.puntos = featureSet.features;
    //       })
    //     );

    //     this.params.outSpatialReference = this.map.spatialReference;
    //     console.log("serviceArea", this.serviceAreaTask);
    //     console.log("centrosEducativos", this.centrosEducativos);

    //     var facilities = new FeatureSet();
    //     facilities.features = this.puntos;
    //     this.params.facilities = facilities;

    //     this.serviceAreaTask.solve(this.params, lang.hitch(this,(function (solveResult) {
    //       console.log("solveResult", solveResult);

    //       arrayUtils.forEach(
    //         solveResult.serviceAreaPolygons, lang.hitch(this, function (serviceArea) {

    //           if (serviceArea.attributes.ToBreak == 5) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 0, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 0, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else if (serviceArea.attributes.ToBreak == 3) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 152, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([56, 168, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([85, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           }

    //           serviceArea.setSymbol(this.fill);
    //           console.log('thismap', this.map)
    //           this.map.graphics.add(serviceArea);
    //         })
    //       );
    //     }))
    // )},

    //  calcularCentrosDeSalud: function () {

    //     var query = new Query();
    //     query.geometry = this.map.extent;
    //     query.returnGeometry = true;
    //     query.outFields = ["*"];
    //     query.where = "1 = 1";

    //     this.centrosSalud.queryFeatures(
    //       query,
    //       lang.hitch(this, function (featureSet) {
    //         console.log("evt", featureSet);
    //         this.puntos = featureSet.features;
    //       })
    //     );

    //     this.params.outSpatialReference = this.map.spatialReference;
    //     console.log("serviceArea", this.serviceAreaTask);
    //     console.log("farmacias", this.farmacias);

    //     var facilities = new FeatureSet();
    //     facilities.features = this.puntos;
    //     this.params.facilities = facilities;

    //     this.serviceAreaTask.solve(this.params, lang.hitch(this,(function (solveResult) {
    //       console.log("solveResult", solveResult);

    //       arrayUtils.forEach(
    //         solveResult.serviceAreaPolygons, lang.hitch(this, function (serviceArea) {

    //           if (serviceArea.attributes.ToBreak == 5) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 0, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 0, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else if (serviceArea.attributes.ToBreak == 3) {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([230, 152, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([255, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           } else {
    //             this.line = new SimpleLineSymbol();
    //             this.line.setColor(new Color([56, 168, 0, 1]));
    //             this.fill = new SimpleFillSymbol();
    //             this.fill.setColor(new Color([85, 255, 0, 0.25]));
    //             this.fill.setOutline(this.line);
    //           }

    //           serviceArea.setSymbol(this.fill);
    //           console.log('thismap', this.map)
    //           this.map.graphics.add(serviceArea);

    //         })
    //       );
    //     }))
    // )},
  });
});
