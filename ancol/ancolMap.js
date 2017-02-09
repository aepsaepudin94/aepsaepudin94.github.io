$(document).ready(function () {
    if(screenfull.enabled) {
        screenfull.request();
    }
	var postPromise = function (url, postData) {
		return new Promise(function (resolve) {
			if(typeof postData === 'object' && postData) {
				$.post(url, postData, resolve);
			} else {
				$.post(url, resolve);
			}
		});
	};
    var hawkUrl = hostName + '/hawk/index.php';
    var hawkPath = hostName + '/hawk';
    var token;

    if(hostName == '//hawk-dev.intellitrac.co.id') {
        hawkUrl = hostName + '/index.php';
        hawkPath = hostName;
    }

	var registerRealtime = function (resp) {
        return postPromise(hawkUrl + '/api_users/login', {
    		username: 'oIRcQrnn6QOf',
    		password: 'uYtATq63q1I=',
            encrypt: 1
    	}).then(function (resp) {
    		token = resp.token;
            window.userToken = token;
    		return postPromise(hawkUrl + '/api_devices/load_device/'+ token);
    	}).then(function (resp) {
    		var deviceList = [];
            var devicesName = [];
    		var data = resp.data;
            for (var i = 0; i < data.length; i++) {
                var devices = data[i].devices;
                for (var j = 0; j < devices.length; j++) {
                    deviceList.push(devices[j].deviceid);
                    devicesName.push(devices[j].name);
                }
            }
    		return postPromise(hawkUrl + '/api_devices/set_session_device/'+ token, {
    			devices: deviceList
    		});
    	}).then(function(resp) {
    		return postPromise(hawkUrl + '/api_positions/register_realtime/'+ token);
    	});
    };

    var route = {
        selatan: 21,
        utara: 22
    };

    var routeFixed = {
        selatan: 11,
        utara: 12
    };

    var speedData = {};
    var maxDataForAvgSpeed = 500;
    var currentShelterName;

    var lastPostData = {};
    var elSchedule = document.getElementById('vehicle-schedule');

    function calculateArriveTime() {
        var closest = null;
        var sh = 'shelter_distance_fixed';
        var rd = 'real_distance';
        for(var deviceid in lastPostData) {
            if( ! lastPostData.hasOwnProperty(deviceid) ) { continue; }
            var hasDistance = typeof lastPostData[deviceid][sh] ===  'number';
            if(closest === null) {
                if(hasDistance) {
                    closest = lastPostData[deviceid];
                }
            } else if(hasDistance) {
                if(closest[rd] > 200 && lastPostData[deviceid][rd] < 200) {
                    closest = lastPostData[deviceid];
                }
                else if(lastPostData[deviceid][sh] < closest[sh] && lastPostData[deviceid][rd] < 200) {
                    closest = lastPostData[deviceid];
                }
            }
        }

        if(closest === null) {
            // debugger;
            // console.log('skip', lastPostData);
            elSchedule.innerHTML = 'Maaf. Saat ini tidak ada bis yang tersedia.';
            return;
        }

        var speedArray = speedData[closest.adevid];
        var len = speedArray.length;

        if(len === 0) {
            elSchedule.innerHTML = 'Maaf. Saat ini tidak ada bis yang tersedia.';
            return;
        }

        if(closest.real_distance > 200) {
            // debugger;
            // console.log('skip', closest);
            elSchedule.innerHTML = 'Maaf. Saat ini tidak ada bis yang tersedia.';
            return;
        }

        var sum = 0;

        for (var i = 0; i < len; i++) {
            sum += speedArray[i];
        }

        var avg = sum / len;
        var distance = closest[sh];

        var hours = (distance / 1e3) / avg;
        var minutes = Math.round(hours * 60);

        // console.log('datetime', closest.ldatetime, ' : ','distance', distance,', avg', avg, ', minutes', minutes);

        // var duration = moment.duration({'minutes' : minutes}).humanize();
        if (minutes*60 >= 60) {
            elSchedule.innerHTML = 'Bis selanjutnya akan tiba dalam waktu <span>' + minutes + ' menit</span>.';
        } else {
            elSchedule.innerHTML = 'Bis anda telah tiba.';
        }
    }

    function getPosition(realtimeToken) {
        return postPromise(hawkUrl + '/api_positions/realtime/'+ token, {
            realtime_id: realtimeToken,
            shelter_id: shelter_id,
            route_id: route.utara
        }).then(function(resp) {
            Devices = resp.data.data;

            for(var i in Devices) {
                if( ! Devices.hasOwnProperty(i) ) { continue; }
                var devicePos = Devices[i];
                if(typeof speedData[i] === 'undefined') {
                    speedData[i] = [];
                }
                for (var j = 0; j < devicePos.length; j++) {
                    var speed = devicePos[j].aspeed;
                    if(speed > 0) {
                        speedData[i].push(speed);
                        if(speedData[i].length > 500) {
                            speedeedData[i].shift();
                        }
                    }
                    lastPostData[i] = devicePos[j];
                    moveDevice(devicePos[j]);
                }
            }

            calculateArriveTime();
        });
    }

    var positionDelay = 5e3;

    function reloadPosition(realtimeToken) {
        return getPosition(realtimeToken).delay(positionDelay).then(function () {
            return reloadPosition(realtimeToken);
        });
    }

    var map;
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var markerLayer, marker, pointLayer, pointObj, ancolmap, RuteDisplayLayer;
    var markerBusStopLayer, vehicleLabels;
    var lineObj = {};

    var createLongLat = function(long, lat) {
        var longlat = new OpenLayers.LonLat(long, lat);
        var transformedLongLat = longlat.transform(epsg4326, epsg900913);
        return transformedLongLat;
    };

    function createGeometryPoint (lon, lat) {
        var pt = new OpenLayers.Geometry.Point(lon, lat);
        return pt.transform(epsg4326, epsg900913);
    }

    var markerLayerStyle = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style ({
            externalGraphic: "${iconPath}",
            graphicWidth:    "${iconWidth}",
            graphicHeight:   "${iconHeight}",
            graphicXOffset:  "${iconXOffset}",
            graphicYOffset:  "${iconYOffset}",
            rotation:        "${iconAngle}",
            FillOpacity:     "${iconOpacity}",
            labelBorderSize: "1px"
        })
    });

    var styleLineRuteDisplay = new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            'fillColor':         "${fillColor}",
            'fillOpacity':       '1',
            'strokeColor':       "${fillOpacity}",
            'strokeOpacity':     '1',
            'strokeWidth':       '3',
            'fontSize':          '10pt',
            'fontFamily':        'Arial',
            'label':             ' ',
            'fontOpacity':       '1',
            'labelOutlineColor': "white",
            'labelOutlineWidth': "1",
            'fontWeight':        "bold"
        })
    });

    var styleLabel = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style ({
            externalGraphic: "${labelPath}",
            graphicWidth:    "${labelWidth}",
            graphicHeight:   "${labelHeight}",
            graphicXOffset:  "${labelXOffset}",
            graphicYOffset:  "${labelYOffset}"
        })
    });

    function createMarker(data, lon, lat, heading)  {
        heading = heading || 0;
        var point = createGeometryPoint(lon, lat);
        return new OpenLayers.Feature.Vector(point, {
            iconPath:        data.iconLocation,
            iconWidth:       data.width,
            iconHeight:      data.height,
            iconXOffset:     data.xOffset,
            iconYOffset:     data.yOffset,
            iconAngle:       heading,
            iconOpacity:     1
        });
    }


    function createVehicleLabels(data, lon, lat) {
        var point = createGeometryPoint(lon, lat);
        return new OpenLayers.Feature.Vector(point, {
            labelPath:      hawkPath + '/assets/img/label/label.php?text=' + data.label + '&color=222222&bgcolor=f0F0f0&border=444444&leftpad=8&toppad=7&size=9&radius=3',
            labelWidth:     data.labelWidth,
            labelHeight:    data.labelHeight,
            labelXOffset:   data.labelXOffset,
            labelYOffset:   data.labelYOffset
        });
    }

    var dt = {};
    var markerObj = {};
    var markerObjReal = {};
    var labels = {};

    function moveDevice(position) {
        if(typeof position !== 'object' || position === null) {
            return false;
        }
        var lat, lon, head, deviceid;
        var lonReal = position.along;
        var latReal = position.alat;
        var vehicleName = position.device_name;

        if (position.display_fix.distance > 150) {
            lat = position.alat;
            lon = position.along;
            head = position.ahead;
            deviceid = position.adevid;
        } else {
            lat = position.display_fix.point.lat;
            lon = position.display_fix.point.lng;
            head = position.ahead;
            deviceid = position.adevid;
        }

        if(typeof markerObj[deviceid] === 'object' && markerObj[deviceid]) {
            moveMarker(deviceid, lon, lat, head);
            redrawLabels(deviceid, lon, lat);

            // moveMarkerReal(deviceid, lonReal, latReal, head);
        } else {
            markerObj[deviceid] = drawVehicleDisplay(lon, lat, head);
            drawVehicleLabel(vehicleName, lon, lat, function (label) {
                labels[deviceid] = label;
            });
            // markerObjReal[deviceid] = drawMarkerReal(lonReal, latReal, head);
        }

        // if (typeof lineObj[deviceid] === 'object' && lineObj[deviceid]) {
        //     redrawLine(deviceid, lon, lat);
        // } else {
        //     lineObj[deviceid] = lineTrac(lon, lat);
        // }
    }

    function moveMarker(deviceid, lon, lat, aHead) {
        var currentHead = aHead > 180;
        if (currentHead) {
            markerObj[deviceid].attributes.iconPath = 'bus_faching_left.png';
            markerObj[deviceid].move(createLongLat(lon, lat));
        } else {
            markerObj[deviceid].attributes.iconPath = 'normal_bus_white.static.png';
            markerObj[deviceid].move(createLongLat(lon, lat));
        }
    }

    function moveMarkerReal(deviceid, lonReal, latReal, head) {
        markerObjReal[deviceid].move(createLongLat(lonReal, latReal));
        markerObjReal[deviceid].attributes.iconAngle = head;
    }

    function redrawLine(deviceid, lon, lat) {
        var geoPoint = createGeometryPoint(lon, lat);
        lineObj[deviceid].geometry.addPoint(geoPoint);
        RuteDisplayLayer.drawFeature(lineObj[deviceid]);
    }

    function redrawLabels(deviceid, lon, lat) {
        labels[deviceid].move(createLongLat(lon, lat));
    }

    var init = function () {
        var extent = new OpenLayers.Bounds();
        extent.extend(createLongLat(106.8292916,-6.1152985));
        extent.extend(createLongLat(106.8599364,-6.1299243));
        extent.toBBOX();

        var options = {
            projection: epsg900913,
            displayProjection: epsg4326,
            restrictedExtent: extent,
            // center : function({dragging: false})createLongLat(long, lat),
            controls: []
        };

        if(devMode) {
            delete options.restrictedExtent;
            options.center = createLongLat(106.84205473766207,-6.123828830976662);
            options.controls = [
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.ScaleLine(),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.LayerSwitcher()
            ];
        }

        map = new OpenLayers.Map('map', options);

        if(!devMode) {
            navCursor = new OpenLayers.Control.Navigation(
                {   zoomWheelEnabled: false,
                    defaultDblClick: function(event) { return; }
                }
            );
            navTouch = new OpenLayers.Control.TouchNavigation(
                {   dragPanOptions: {
                        enableKinetic: false
                    },
                    defaultDblClick: function(event) { return; },
                    pinchZoom : {
                        autoActive : false
                    }
                }
            );

            map.addControl(navCursor);
            map.addControl(navTouch);

            var navigationControl = map.controls[0];
            var zoomControl = map.controls[1];

            map.removeControl(navigationControl);
            map.removeControl(zoomControl);
        } else {
            map.addControl(new OpenLayers.Control.LayerSwitcher());
        }

        var osm = new OpenLayers.Layer.OSM("OSM");

        map.addLayers([osm]);
        // map.addControl(new OpenLayers.Control.LayerSwitcher());

        markerLayer = new OpenLayers.Layer.Vector("Vehicle", {
            styleMap: markerLayerStyle
        });

        markerBusStopLayer = new OpenLayers.Layer.Vector("Bus Stop", {
            styleMap: markerLayerStyle
        });

        vehicleLabelsLayer = new OpenLayers.Layer.Vector("Vehicle Labels", {
            styleMap: styleLabel
        });

        // Create Ancol Map
        ancolmap = new OpenLayers.Layer.XYZ(
            "Ancol Map",
            [
                // "ancol_tiles/${z}/${x}/${y}.png",
                "http://202.78.202.11/tiles/ancol/${z}/${x}/${y}.png",
                "http://svr11.intellitrac.co.id/tiles/ancol/${z}/${x}/${y}.png",
            ], {
                isBaseLayer: false,
                sphericalMercator: true,
                // numZoomLevels: 21,
                // crossOrigin: 'anonymous',
                // transitionEffect: 'resize',
                tileOptions: {
                crossOriginKeyword:null
                },
                visibility: true
            }
        );

        RuteDisplayLayer = new OpenLayers.Layer.Vector("Route Display", {
            styleMap: styleLineRuteDisplay,
            visibility: true
        });

        map.addLayers([ancolmap, RuteDisplayLayer, markerBusStopLayer, vehicleLabelsLayer, markerLayer]);
        map.zoomToExtent(extent);
    };

    init();

    var loadShelter = function () {
        return postPromise(hawkUrl + '/api_positions/get_ancol_shelter/' + userToken);
    };

    var loadRoute = function () {
        var fixPointFormat = function (route) {
            route.points = route.points.map(function (point) {
                var pt = point.split(', ');
                return {
                    lng: pt[0],
                    lat: pt[1],
                };
            });
        };
        return postPromise(hawkUrl + '/api_positions/get_ancol_route/' + userToken).then(function (resp) {
            console.log(resp);
            var routes = resp.data;
            var routeObj = {};
            for (var i = 0; i < routes.length; i++) {
                fixPointFormat(routes[i]);
                routeObj[routes[i].id] = routes[i];
            }
            console.log(routeObj);
            return routeObj;
        });
    };

    registerRealtime().then(function (resp) {
        var realtimeToken = resp.data.realtime_id;
        reloadPosition(realtimeToken);
        return loadRoute();
    }).then(function (routes) {
        var routeSelatanId = routeFixed.selatan;
        var routeUtaraId = routeFixed.utara;
        var pointRuteSelatan = routes[routeSelatanId].points;
        var pointRuteUtara = routes[routeUtaraId].points;

        lineRuteSelatan(pointRuteSelatan);
        lineRuteUtara(pointRuteUtara);
        return loadShelter();
    }).then(function (resp) {
        var busStopPosition = resp.data;
        drawBusStop(busStopPosition);
        getPositionShelter(busStopPosition);
    });

    var getPositionShelter = function (data) {
        for(var i in data) {
            if( ! data.hasOwnProperty(i) ) { continue; }
            var shelterID = data[i].id;
            if (shelterID === shelter_id) {
                lon = data[i]['point'].lng;
                lat = data[i]['point'].lat;
                drawCurrentShelter(lon, lat);
                currentShelterName = data[i].name;
            }
        }
        document.getElementById('shelter-name').innerHTML = 'Halte : <span>' + currentShelterName + '</span>';
    };

    var drawCurrentShelter = function (lon, lat) {
        var currentShelter = createMarker({
            iconLocation: 'you_are_here_icon.png',
            width: 65,
            height: 101,
            xOffset: 65 / -2,
            yOffset: 101 /-1
        }, lon, lat);
        markerBusStopLayer.addFeatures([currentShelter]);
    };

    var drawBusStop = function(dataPoint) {
        for(var i in dataPoint) {
            if( ! dataPoint.hasOwnProperty(i) ) { continue; }
            var BusStopPoint = dataPoint[i].point;
            var halteMarker = createMarker({
            iconLocation: 'circle_bus_stop_icon.png',
            width: 21,
            height: 21,
            xOffset: 21 / -2,
            yOffset: 21/-2
            }, BusStopPoint.lng, BusStopPoint.lat);
            markerBusStopLayer.addFeatures([halteMarker]);
        }
    };

    var drawVehicleDisplay = function(lon, lat, aHead) {
        var currentHeading = aHead > 180;
        var iconPath;
        if (currentHeading) {
            iconPath = 'bus_faching_left.png';
        } else {
            iconPath = 'normal_bus_white.static.png';
        }
        var marker = createMarker({
            iconLocation: iconPath,
            width: 57,
            height: 30,
            xOffset: 57 / -2,
            yOffset: 30/-2,
        }, lon, lat);
        markerLayer.addFeatures([marker]);
        // marker.attributes.iconAngle = aHead;
        return marker;
    };

    var drawVehicleLabel = function (deviceName, lon, lat, callback) {
        getLabelSize(deviceName, function (labelData) {
            dt.labelWidth = labelData.width,
            dt.labelHeight = labelData.height,
            dt.labelXOffset = 0,
            dt.labelYOffset = labelData.height * -1,
            dt.label = deviceName
            var label = createVehicleLabels(dt, lon, lat);

            vehicleLabelsLayer.addFeatures([label]);
            if(typeof callback === 'function') {
                callback(label);
            }
        });
    };

    var getLabelSize = function (name, callback) {
        var postData;
                postData = {
                    text:     name,
                    color:    '222222',
                    bgcolor:  'f0f0f0',
                    border:   '444444',
                    leftpad:  '8',
                    toppad:   '7',
                    size:     '9',
                    radius:   '3',
                    get_size: 'true'
                };

                $.get(hawkPath + '/assets/img/label/label.php', postData, callback);
    };

    // var drawMarkerReal = function(lon, lat, aHead) {
    //     var marker = createMarker({
    //         iconLocation: 'car1.png',
    //         width: 15,   
    //         height: 32,
    //         xOffset: 15 / -2,
    //         yOffset: 32/-2,
    //     }, lon, lat);
    //     markerLayer.addFeatures([marker]);
    //     marker.attributes.iconAngle = aHead;

    //     return marker;
    // };

    var lineTrac = function (lon, lat) {
        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#00ff00',
            fillOpacity: '#00ff00'
        });
        RuteDisplayLayer.addFeatures([line]);

        return line;
    };

    var lineRuteSelatan = function (routePositionSelatan) {
        var lon = routePositionSelatan[0].lng;
        var lat = routePositionSelatan[0].lat;

        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#0000ff',
            fillOpacity : '#0000ff'
        });
        RuteDisplayLayer.addFeatures([line]);

        for(var i in routePositionSelatan) {
            if( ! routePositionSelatan.hasOwnProperty(i) ) { continue; }
            lon = routePositionSelatan[i].lng;
            lat = routePositionSelatan[i].lat;
            var geoPoint = createGeometryPoint(lon, lat);
                line.geometry.addPoint(geoPoint);
                RuteDisplayLayer.drawFeature(line);
        }
    };

    var lineRuteUtara = function (routePositionUtara) {
        var lon = routePositionUtara[0].lng;
        var lat = routePositionUtara[0].lat;

        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#ff0000',
            fillOpacity: '#ff0000'
        });
        RuteDisplayLayer.addFeatures([line]);

        for(var i in routePositionUtara) {
            if( ! routePositionUtara.hasOwnProperty(i) ) { continue; }
            lon = routePositionUtara[i].lng;
            lat = routePositionUtara[i].lat;
            var geoPoint = createGeometryPoint(lon, lat);
                line.geometry.addPoint(geoPoint);
                RuteDisplayLayer.drawFeature(line);
        }
    };
});