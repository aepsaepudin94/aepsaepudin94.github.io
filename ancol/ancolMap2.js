$(document).ready(function () {
	var postPromise = function (url, postData) {
		return new Promise(function (resolve) {
			if(typeof postData === 'object' && postData) {
				$.post(url, postData, resolve);
			} else {
				$.post(url, resolve);
			}
		});
	};
	var hawkUrl = 'http://192.168.0.145/hawk/index.php';
	var token;

	var registerRealtime = function (resp) {
        return postPromise(hawkUrl + '/api_users/login', {
    		username: 'jayaancol',
    		password: 'ancol123'
    	}).then(function (resp) {
    		token = resp.token;
    		return postPromise(hawkUrl + '/api_devices/load_device/'+ token);
    	}).then(function (resp) {
    		var deviceList = [];
    		var data = resp.data;

    		for (var i = 0; i < data.length; i++) {
    			var devices = data[i].devices;
    			for (var j = 0; j < devices.length; j++) {
    				deviceList.push(devices[j].deviceid);
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
        utara: 22,
    };

    function getPosition(realtimeToken) {
        return postPromise(hawkUrl + '/api_positions/realtime/'+ token, {
            realtime_id: realtimeToken,
            shelter_id: shelter_id,
            route_id: route.selatan 
        }).then(function(resp) {
            Devices = resp.data.data;
            
            for(var i in Devices) {
                if( ! Devices.hasOwnProperty(i) ) { continue; }
                var devicePos = Devices[i];
                for (var j = 0; j < devicePos.length; j++) {
                    moveDevice(devicePos[j]);
                }
            }
        });
    }

    var positionDelay = 3000;
    var firstZoom = false;

    function reloadPosition(realtimeToken) {
        return getPosition(realtimeToken).delay(positionDelay).then(function () {
            if(!firstZoom) {
                // map.zoomToMaxExtent();
                firstZoom = true;
            }
            return reloadPosition(realtimeToken);
        });
    }

    var map;
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var markerLayer, marker, pointLayer, pointObj, ancolmap, RuteDisplayLayerSelatan, RuteDisplayLayerUtara;
    var markerHalteLayer;
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

    var styleLine = new OpenLayers.StyleMap({
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

    var styleLineRuteSelatan = new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            'fillColor':         '#0040ff',
            'fillOpacity':       '1',
            'strokeColor':       '#0040ff',
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

    var styleLineRuteUtara = new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            'fillColor':         '#ff8000',
            'fillOpacity':       '1',
            'strokeColor':       '#ff8000',
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

    var stylePoint = new OpenLayers.StyleMap({
    'default' : new OpenLayers.Style({
        'fillColor':     '#ff8000',
        'fillOpacity':   '2',
        'strokeColor':   '#0000ff',
        'strokeOpacity': '1',
        'strokeWidth':   '2',
        'pointRadius':   3
        })
    });

    function createMarker(data, lon, lat)  {
        var point = createGeometryPoint(lon, lat);
        return new OpenLayers.Feature.Vector(point, {
            iconPath:        data.iconLocation,
            iconWidth:       data.width,
            iconHeight:      data.height,
            iconXOffset:     data.xOffset,
            iconYOffset:     data.yOffset,
            iconAngle:       0,
            iconOpacity:     1
        });
    }

    function createPoint(data, lon, lat) {
        var point = createGeometryPoint(lon, lat);
        return new OpenLayers.Feature.Vector(point, {
            fillColor : data.fillColor,
            fillOpacity : data.fillOpacity,
            strokeColor : data.strokeColor,
            strokeOpacity : data.strokeOpacity
        });
    }

    var markerObj = {};
    var markerObjReal = {};
    var lineTracReal = {};
    var lineTracOpposite = {};

    function moveDevice(position) {
        if(typeof position !== 'object' || position === null) {
            return false;
        }
        var lat, lon, head, deviceid;
        var lonReal = position.along;
        var latReal = position.alat;
        var shelterDistance = position.shelter_distance;

        if (position['display_fix']['distance'] > 150) {
            lat = position.alat;
            lon = position.along;
            head = position.ahead;
            deviceid = position.adevid;
        } else {
            lat = position['display_fix']['point']['lat'];
            lon = position['display_fix']['point']['lng'];
            head = position.ahead;
            deviceid = position.adevid;
        }

        if(typeof markerObj[deviceid] === 'object' && markerObj[deviceid]) {
            moveMarker(deviceid, lon, lat, head);
            moveMarkerReal(deviceid, lonReal, latReal, head);
        } else {
            markerObj[deviceid] = drawMarkerDisplay(lon, lat, head);
            markerObjReal[deviceid] = drawMarkerReal(lonReal, latReal, head);
        }

        if (typeof lineObj[deviceid] === 'object' && lineObj[deviceid]) {
            redrawLine(deviceid, lon, lat);
            redrawLineReal(deviceid, lonReal, latReal);
        } else {
            lineObj[deviceid] = createLineString(lon, lat);
            lineTracReal[deviceid] = createLineStringReal(lonReal, latReal);
        }
        lineTracOpposite[deviceid] = createLineStringOpposite(lonReal, latReal);
        redrawLineOpposite(deviceid, lon, lat)
    }

    function moveMarker(deviceid, lon, lat, head) {
        markerObj[deviceid].move(createLongLat(lon, lat));
        markerObj[deviceid].attributes.iconAngle = head;
    }

    function moveMarkerReal(deviceid, lonReal, latReal, head) {
        markerObjReal[deviceid].move(createLongLat(lonReal, latReal));
        markerObjReal[deviceid].attributes.iconAngle = head;
    }

    function redrawLine(deviceid, lon, lat) {
        var geoPoint = createGeometryPoint(lon, lat);
        lineObj[deviceid].geometry.addPoint(geoPoint);
        lineLayer.drawFeature(lineObj[deviceid]);
    }

    function redrawLineReal(deviceid, lon, lat) {
        var geoPoint = createGeometryPoint(lon, lat);
        lineTracReal[deviceid].geometry.addPoint(geoPoint);
        lineLayer.drawFeature(lineTracReal[deviceid]);
    }  

    function redrawLineOpposite(deviceid, lon, lat) {
        var geoPoint = createGeometryPoint(lon, lat);
        lineTracOpposite[deviceid].geometry.addPoint(geoPoint);
        lineLayer.drawFeature(lineTracOpposite[deviceid]);
    }

    var busStopPosition = [ 
        {lon: 106.83078096210841, lat: -6.127137004210177}, // Selatan 1
        {lon: 106.8325049831593, lat: -6.126537869484505}, // Selatan 2
        {lon: 106.83762295789823, lat: -6.127816861064151}, // Selatan 3
        {lon: 106.83426694105751, lat: -6.127450789491139}, // Selatan 4
        {lon: 106.839188, lat: -6.125516}, // Selatan 5
        {lon: 106.840902, lat: -6.123912}, // Selatan 6 // Utara 4
        {lon: 106.84139905894247, lat: -6.125368004210177}, // Selatan 7 / Utara 13
        {lon: 106.83909197052876, lat: -6.125725130515495}, // Selatan 8
        {lon: 106.83813611788497, lat: -6.127720974738937}, // Selatan 9
        {lon: 106.83330600842035, lat: -6.128831126305317}, // Selatan 10

        {lon: 106.830643, lat: -6.122067}, // Utara 1
        {lon: 106.831812, lat: -6.121891}, // Utara 2
        {lon: 106.834405, lat: -6.122185}, // Utara 3
        {lon: 106.84472688632522, lat: -6.121194058942481}, // Utara 5
        {lon: 106.847382, lat: -6.120615}, // Utara 6
        {lon: 106.85070384001327, lat: -6.119799962108405}, // Utara 7
        {lon: 106.85624703368143, lat: -6.11724986527433}, // Utara 8
        {lon: 106.858897, lat: -6.118322}, // Utara 9
        {lon: 106.85266894947789, lat: -6.119323025261063}, // Utara 10
        {lon: 106.847451, lat: -6.120892}, // Utara 11
        {lon: 106.844131, lat: -6.123054}, // Utara 12
        {lon: 106.834188, lat: -6.122434}, // Utara 14
    ];

    var ruteSelatan = [
        {lon: 106.841364, lat: -6.124925 }, 
        {lon: 106.840893, lat: -6.124997 }, 
        {lon: 106.840579, lat: -6.125054 }, 
        {lon: 106.840255, lat: -6.125094 }, 
        {lon: 106.839036, lat: -6.125302 }, 
        {lon: 106.838571, lat: -6.125385 }, 
        {lon: 106.838439, lat: -6.12552 }, 
        {lon: 106.838255, lat: -6.125714 }, 
        {lon: 106.838134, lat: -6.126145 }, 
        {lon: 106.838102, lat: -6.126448 }, 
        {lon: 106.838166, lat: -6.127088 }, 
        {lon: 106.838228, lat: -6.127381 }, 
        {lon: 106.838259, lat: -6.127558 }, 
        {lon: 106.838343, lat: -6.127673 }, 
        {lon: 106.83841, lat: -6.128053 }, 
        {lon: 106.838381, lat: -6.12815 }, 
        {lon: 106.838315, lat: -6.128203 }, 
        {lon: 106.83519, lat: -6.128742 }, 
        {lon: 106.834396, lat: -6.128885},
        {lon: 106.833289, lat: -6.128339},
        {lon: 106.833203, lat: -6.128251 }, 
        {lon: 106.833054, lat: -6.127359 }, 
        {lon: 106.832939, lat: -6.127377 }, 
        {lon: 106.832456, lat: -6.127462 }, 
        {lon: 106.832129, lat: -6.127508},
        {lon: 106.831844, lat: -6.127519 }, 
        {lon: 106.831709, lat: -6.127515},
        {lon: 106.830989, lat: -6.127459},
        {lon: 106.830919, lat: -6.127448},
        {lon: 106.830912, lat: -6.127411 }, 
        {lon: 106.830923, lat: -6.127251 }, 
        {lon: 106.83092, lat: -6.127071 }, 
        {lon: 106.830889, lat: -6.126923},
        {lon: 106.830857, lat: -6.126585 }, 
        {lon: 106.832731, lat: -6.126291 }, 
        {lon: 106.832733, lat: -6.126234 }, 
        {lon: 106.832782, lat: -6.126228},
        {lon: 106.833175, lat: -6.126365},
        {lon: 106.833634, lat: -6.12658 }, 
        {lon: 106.83395, lat: -6.126765 }, 
        {lon: 106.834298, lat: -6.127031 }, 
        {lon: 106.83533, lat: -6.127999 }, 
        {lon: 106.836135, lat: -6.127866 }, 
        {lon: 106.836196, lat: -6.127955 }, 
        {lon: 106.837084, lat: -6.127805 }, 
        {lon: 106.837201, lat: -6.127434 }, 
        {lon: 106.838228, lat: -6.127381 }, 
        {lon: 106.838166, lat: -6.127088 }, 
        {lon: 106.838102, lat: -6.126448 }, 
        {lon: 106.838134, lat: -6.126145 }, 
        {lon: 106.838255, lat: -6.125714 }, 
        {lon: 106.838439, lat: -6.12552 }, 
        {lon: 106.838571, lat: -6.125385 }, 
        {lon: 106.839036, lat: -6.125302 }, 
        {lon: 106.840255, lat: -6.125094 }, 
        {lon: 106.840579, lat: -6.125054 }, 
        {lon: 106.840893, lat: -6.124997},
        {lon: 106.840798, lat: -6.123897 }, 
        {lon: 106.841372, lat: -6.123723 }, 
        {lon: 106.841697, lat: -6.123637 }, 
        {lon: 106.841729, lat: -6.124085 }, 
        {lon: 106.841651, lat: -6.124231 }, 
        {lon: 106.841709, lat: -6.124588 }, 
        {lon: 106.842096, lat: -6.124825 }, 
        {lon: 106.841599, lat: -6.1249 }, 
        {lon: 106.841364, lat: -6.12492}
    ];

    var ruteUtara = [
        {lon: 106.841364, lat: -6.124925}, 
        {lon: 106.840893, lat: -6.124997}, 
        {lon: 106.840255, lat: -6.125094}, 
        {lon: 106.839036, lat: -6.125302}, 
        {lon: 106.837465, lat: -6.122927}, 
        {lon: 106.83433, lat: -6.12281}, 
        {lon: 106.834344, lat: -6.121637}, 
        {lon: 106.834281, lat: -6.121611}, 
        {lon: 106.834252, lat: -6.121548}, 
        {lon: 106.833838, lat: -6.1215}, 
        {lon: 106.831873, lat: -6.121803}, 
        {lon: 106.831175, lat: -6.121914}, 
        {lon: 106.830152, lat: -6.122065}, 
        {lon: 106.831175, lat: -6.121914}, 
        {lon: 106.831873, lat: -6.121803}, 
        {lon: 106.833838, lat: -6.1215}, 
        {lon: 106.834252, lat: -6.121548}, 
        {lon: 106.834275, lat: -6.121468}, 
        {lon: 106.834373, lat: -6.121443}, 
        {lon: 106.834446, lat: -6.121514}, 
        {lon: 106.834432, lat: -6.121613}, 
        {lon: 106.834344, lat: -6.121637}, 
        {lon: 106.83433, lat: -6.12281}, 
        {lon: 106.837465, lat: -6.122927},
        {lon: 106.838436, lat: -6.122175}, 
        {lon: 106.838821, lat: -6.122238}, 
        {lon: 106.839191, lat: -6.122518}, 
        {lon: 106.839235, lat: -6.122644}, 
        {lon: 106.839352, lat: -6.123138},
        {lon: 106.839737, lat: -6.123515},
        {lon: 106.840798, lat: -6.123897}, 
        {lon: 106.841372, lat: -6.123723},
        {lon: 106.841697, lat: -6.123637}, 
        {lon: 106.842471, lat: -6.12367}, 
        {lon: 106.843575, lat: -6.123463},
        {lon: 106.844029, lat: -6.122954},
        {lon: 106.844106, lat: -6.122025},
        {lon: 106.844181, lat: -6.12148}, 
        {lon: 106.844483, lat: -6.121128}, 
        {lon: 106.845319, lat: -6.120894}, 
        {lon: 106.848885, lat: -6.120223}, 
        {lon: 106.850046, lat: -6.119977}, 
        {lon: 106.852603, lat: -6.119034}, 
        {lon: 106.852699, lat: -6.118921}, 
        {lon: 106.852914, lat: -6.118821}, 
        {lon: 106.853102, lat: -6.118799}, 
        {lon: 106.853339, lat: -6.118851}, 
        {lon: 106.853813, lat: -6.118794}, 
        {lon: 106.854023, lat: -6.11892}, 
        {lon: 106.854226, lat: -6.119003}, 
        {lon: 106.854566, lat: -6.119194}, 
        {lon: 106.854729, lat: -6.119186}, 
        {lon: 106.854862, lat: -6.1191}, 
        {lon: 106.854908, lat: -6.119011}, 
        {lon: 106.856103, lat: -6.117214}, 
        {lon: 106.856011, lat: -6.117143}, 
        {lon: 106.85606, lat: -6.117097}, 
        {lon: 106.856206, lat: -6.117077}, 
        {lon: 106.857201, lat: -6.117463}, 
        {lon: 106.857744, lat: -6.117554}, 
        {lon: 106.857923, lat: -6.117509}, 
        {lon: 106.858172, lat: -6.11738}, 
        {lon: 106.858473, lat: -6.117183}, 
        {lon: 106.858847, lat: -6.116929}, 
        {lon: 106.85958, lat: -6.117543}, 
        {lon: 106.859189, lat: -6.117897}, 
        {lon: 106.857994, lat: -6.118334}, 
        {lon: 106.85793, lat: -6.11844}, 
        {lon: 106.857359, lat: -6.118551}, 
        {lon: 106.856882, lat: -6.118543}, 
        {lon: 106.856175, lat: -6.118683}, 
        {lon: 106.855997, lat: -6.118754}, 
        {lon: 106.855284, lat: -6.11922}, 
        {lon: 106.855155, lat: -6.119208}, 
        {lon: 106.855063, lat: -6.119243}, 
        {lon: 106.854965, lat: -6.119291}, 
        {lon: 106.854879, lat: -6.119266}, 
        {lon: 106.854821, lat: -6.119314}, 
        {lon: 106.854678, lat: -6.119311}, 
        {lon: 106.854546, lat: -6.11928}, 
        {lon: 106.854017, lat: -6.119008}, 
        {lon: 106.853819, lat: -6.118928}, 
        {lon: 106.853333, lat: -6.118977}, 
        {lon: 106.853172, lat: -6.119046}, 
        {lon: 106.853008, lat: -6.119108}, 
        {lon: 106.852767, lat: -6.119137}, 
        {lon: 106.850115, lat: -6.12012}, 
        {lon: 106.848931, lat: -6.120348}, 
        {lon: 106.845615, lat: -6.120965}, 
        {lon: 106.845213, lat: -6.121154}, 
        {lon: 106.845095, lat: -6.121411}, 
        {lon: 106.84494, lat: -6.121723}, 
        {lon: 106.844744, lat: -6.121985}, 
        {lon: 106.844563, lat: -6.122088}, 
        {lon: 106.844325, lat: -6.122108}, 
        {lon: 106.844273, lat: -6.1222}, 
        {lon: 106.844106, lat: -6.122025}, 
        {lon: 106.844029, lat: -6.122954}, 
        {lon: 106.843575, lat: -6.123463}, 
        {lon: 106.842471, lat: -6.12367}, 
        {lon: 106.841697, lat: -6.123637}, 
        {lon: 106.841729, lat: -6.124085}, 
        {lon: 106.841651, lat: -6.124231}, 
        {lon: 106.841709, lat: -6.124588}, 
        {lon: 106.842096, lat: -6.124825}, 
        {lon: 106.841599, lat: -6.1249}, 
        {lon: 106.841364, lat: -6.124925}
    ];

var routeFixedSelatan = [
        {lon: 106.841411, lat: -6.125324},
        {lon: 106.840226, lat: -6.125497},
        {lon: 106.840209, lat: -6.125574},
        {lon: 106.840178, lat: -6.125658},
        {lon: 106.840117, lat: -6.125712},
        {lon: 106.840028, lat: -6.125729},
        {lon: 106.839731, lat: -6.125611},
        {lon: 106.839128, lat: -6.125701},
        {lon: 106.839029, lat: -6.125705},
        {lon: 106.838954, lat: -6.125686},
        {lon: 106.83889, lat: -6.125638},
        {lon: 106.838801, lat: -6.125577},
        {lon: 106.838614, lat: -6.125635},
        {lon: 106.838328, lat: -6.125759},
        {lon: 106.83809, lat: -6.125931},
        {lon: 106.83796, lat: -6.126306},
        {lon: 106.837961, lat: -6.127156},
        {lon: 106.838096, lat: -6.127755},
        {lon: 106.838139, lat: -6.127926},
        {lon: 106.838228, lat: -6.128062},
        {lon: 106.838235, lat: -6.128201},
        {lon: 106.838202, lat: -6.128246},
        {lon: 106.838148, lat: -6.128267},
        {lon: 106.836288, lat: -6.128558},
        {lon: 106.83537, lat: -6.128672},
        {lon: 106.83519, lat: -6.128742},
        {lon: 106.83518, lat: -6.128655},
        {lon: 106.835146, lat: -6.128588},
        {lon: 106.83511, lat: -6.128572},
        {lon: 106.834839, lat: -6.128654},
        {lon: 106.83475, lat: -6.128652},
        {lon: 106.834677, lat: -6.128693},
        {lon: 106.834428, lat: -6.128923},
        {lon: 106.834358, lat: -6.128943},
        {lon: 106.834194, lat: -6.128943},
        {lon: 106.833634, lat: -6.128601},
        {lon: 106.833497, lat: -6.128635},
        {lon: 106.833377, lat: -6.128785},
        {lon: 106.83334, lat: -6.12879},
        {lon: 106.833284, lat: -6.128771},
        {lon: 106.833213, lat: -6.128732},
        {lon: 106.833123, lat: -6.128694},
        {lon: 106.833038, lat: -6.128632},
        {lon: 106.832969, lat: -6.128524},
        {lon: 106.832902, lat: -6.128362},
        {lon: 106.832839, lat: -6.127905},
        {lon: 106.832724, lat: -6.127788},
        {lon: 106.83271, lat: -6.127704},
        {lon: 106.832658, lat: -6.127695},
        {lon: 106.831734, lat: -6.127826},
        {lon: 106.831394, lat: -6.127847},
        {lon: 106.831181, lat: -6.127802},
        {lon: 106.830953, lat: -6.127825},
        {lon: 106.830913, lat: -6.12779},
        {lon: 106.830788, lat: -6.127019},
        {lon: 106.830815, lat: -6.126921},
        {lon: 106.830955, lat: -6.12679},
        {lon: 106.832632, lat: -6.126556},
        {lon: 106.833579, lat: -6.126873},
        {lon: 106.833715, lat: -6.126981},
        {lon: 106.835027, lat: -6.128237},
        {lon: 106.835164, lat: -6.128367},
        {lon: 106.83524, lat: -6.128378},
        {lon: 106.83616, lat: -6.128288},
        {lon: 106.836285, lat: -6.128414},
        {lon: 106.836774, lat: -6.128335},
        {lon: 106.836847, lat: -6.128291},
        {lon: 106.836859, lat: -6.128169},
        {lon: 106.836932, lat: -6.128035},
        {lon: 106.837098, lat: -6.127918},
        {lon: 106.837665, lat: -6.127837},
        {lon: 106.838065, lat: -6.127768},
        {lon: 106.837916, lat: -6.127162},
        {lon: 106.837927, lat: -6.126301},
        {lon: 106.838054, lat: -6.12592},
        {lon: 106.838313, lat: -6.125729},
        {lon: 106.838605, lat: -6.125608},
        {lon: 106.838792, lat: -6.125546},
        {lon: 106.838736, lat: -6.125455},
        {lon: 106.838832, lat: -6.125386},
        {lon: 106.838892, lat: -6.125461},
        {lon: 106.83898, lat: -6.125526},
        {lon: 106.839147, lat: -6.125535},
        {lon: 106.840543, lat: -6.125325},
        {lon: 106.84066, lat: -6.125204},
        {lon: 106.84072, lat: -6.125116},
        {lon: 106.84077, lat: -6.124907},
        {lon: 106.840725, lat: -6.124265},
        {lon: 106.840732, lat: -6.124129},
        {lon: 106.840761, lat: -6.124049},
        {lon: 106.840824, lat: -6.124011},
        {lon: 106.841365, lat: -6.123881},
        {lon: 106.841491, lat: -6.12388},
        {lon: 106.841562, lat: -6.123927},
        {lon: 106.841622, lat: -6.124041},
        {lon: 106.841695, lat: -6.125018},
        {lon: 106.841703, lat: -6.125166},
        {lon: 106.841646, lat: -6.125277},
        {lon: 106.841411, lat: -6.12532}
];
    
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    };

    function measure_long_lat(ignore_zero) {
        ignore_zero = typeof ignore_zero === 'boolean' ? ignore_zero : false;
        var R = 6371; // km

        var pos1 = {lon: busStopPosition[8].lon, lat: busStopPosition[8].lat};
        var pos2 = {lon: busStopPosition[9].lon, lat: busStopPosition[9].lat};

        var lat1 = pos1.lat;
        var lon1 = pos1.lon;
        var lat2 = pos2.lat;
        var lon2 = pos2.lon;

        if(lat1 === 0 || lon1 === 0) { return 0; }
        if(lat2 === 0 || lon2 === 0) { return 0; }

        var x1 = lat2 - lat1;
        var dLat = x1.toRad();
        var x2 = lon2 - lon1;
        var dLon = x2.toRad();
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c;

        return distance;
    }

    measure_long_lat();

    var init = function () {
        var lonlat = {lon: 106.840902, lat: -6.123912};
        var long = lonlat.lon;
        var lat = lonlat.lat;

        var options = {
            projection: epsg900913,
            displayProjection: epsg4326,
            center : createLongLat(long, lat),
            zoom : 4
        };
        map = new OpenLayers.Map("map", options);

        window.map2 = map;

        var gmap = new OpenLayers.Layer.Google("Google Streets", {
            'numZoomLevels' : 20,
        });
        var osm = new OpenLayers.Layer.OSM("OSM", {visibility: false, transitionEffect: 'resize'});

        // note that first layer must be visible
        map.addLayers([gmap, osm]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());

        markerLayer = new OpenLayers.Layer.Vector("Vehicle", {
            styleMap: markerLayerStyle
        });        

        markerHalteLayer = new OpenLayers.Layer.Vector("Bus Stop", {
            styleMap: markerLayerStyle
        });

        lineLayer = new OpenLayers.Layer.Vector("Line Track", {
            styleMap: styleLine
        });

        //Create point layer
        pointLayer = new OpenLayers.Layer.Vector("Point", {
            styleMap: stylePoint
        });

        // Create Ancol Map
        ancolmap = new OpenLayers.Layer.XYZ(
            "Ancol Map",
            [
                // "ancol_tiles/${z}/${x}/${y}.png",
                // "http://202.78.202.11/tiles/ancol/${z}/${x}/${y}.png",
                "http://svr11.intellitrac.co.id/tiles/ancol/${z}/${x}/${y}.png",
            ], {
                isBaseLayer: false,
                sphericalMercator: true,
                numZoomLevels: 21,
                crossOrigin: 'anonymous',
                transitionEffect: 'resize',
                tileOptions: {
                crossOriginKeyword:null
                },
                visibility: false
            }
        );

        RuteDisplayLayerSelatan = new OpenLayers.Layer.Vector("Rute Display Selatan", {
            styleMap: styleLineRuteSelatan,
            visibility: true,
        });

        RuteDisplayLayerUtara = new OpenLayers.Layer.Vector("Rute Display Utara", {
            styleMap: styleLineRuteUtara,
            visibility: true
        });

        // Add layer
        map.addLayers([ancolmap, RuteDisplayLayerSelatan, RuteDisplayLayerUtara, lineLayer, markerHalteLayer, markerLayer, pointLayer]);

        // Create marker halte
        for (var i = 0; i < busStopPosition.length; i++) {
            var halteMarker = createMarker({
            iconLocation: 'bus_stop.png',
            width: 25,
            height: 25,
            xOffset: 25 / -2,
            yOffset: 25/-2
            }, busStopPosition[i].lon, busStopPosition[i].lat);
            markerHalteLayer.addFeatures([halteMarker]);
        }
    };
    
    init();
    
    registerRealtime().then(function (resp) {
        var realtimeToken = resp.data.realtime_id;
        reloadPosition(realtimeToken);
    });

    var createLineString = function (lon, lat) {
        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#00ff00',
            fillOpacity: '#00ff00'
        });
        lineLayer.addFeatures([line]);

        return line;
    };

    var createLineStringReal = function (lon, lat) {
        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#ffff00',
            fillOpacity: '#ffff00'
        });
        lineLayer.addFeatures([line]);

        return line;
    };

    var createLineStringOpposite = function (lon, lat) {
        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            fillColor: '#663300',
            fillOpacity: '#663300'
        });
        lineLayer.addFeatures([line]);

        return line;
    };

    var drawPoint = function (lon, lat) {
        pointObj = createPoint({
            fillColor : '#ff0000',
            fillOpacity : 0.5,
            strokeColor : '#ff0000',
            strokeOpacity : 0.8
        }, lon, lat);
        pointLayer.addFeatures(pointObj);
    };

    var drawMarkerDisplay = function(lon, lat, aHead) {
        var marker = createMarker({
            iconLocation: 'car.png',
            width: 15,
            height: 32,
            xOffset: 15 / -2,
            yOffset: 32/-2,
        }, lon, lat);
        markerLayer.addFeatures([marker]);
        marker.attributes.iconAngle = aHead;

        return marker;
    };

    var drawMarkerReal = function(lon, lat, aHead) {
        var marker = createMarker({
            iconLocation: 'car1.png',
            width: 15,
            height: 32,
            xOffset: 15 / -2,
            yOffset: 32/-2,
        }, lon, lat);
        markerLayer.addFeatures([marker]);
        marker.attributes.iconAngle = aHead;

        return marker;
    };

    var lineRuteSelatan = function () {
        var lon = ruteSelatan[0].lon;
        var lat = ruteSelatan[0].lat;

        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString, {
            'fillColor':         '#0040ff',
            'strokeColor':       '#0040ff',
        });
        RuteDisplayLayerSelatan.addFeatures([line]);
    
        for (i = 0; i < ruteSelatan.length; i++) {
            var lon = ruteSelatan[i].lon;
            var lat = ruteSelatan[i].lat;
            var geoPoint = createGeometryPoint(lon, lat);
                line.geometry.addPoint(geoPoint);
                RuteDisplayLayerSelatan.drawFeature(line);
        }
    };

    var lineRuteUtara = function () {
        var lon = ruteUtara[0].lon;
        var lat = ruteUtara[0].lat;

        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line = new OpenLayers.Feature.Vector(lineString);
        RuteDisplayLayerUtara.addFeatures([line]);
    
        for (i = 0; i < ruteUtara.length; i++) {
            var lon = ruteUtara[i].lon;
            var lat = ruteUtara[i].lat;
            var geoPoint = createGeometryPoint(lon, lat);
                line.geometry.addPoint(geoPoint);
                RuteDisplayLayerUtara.drawFeature(line);
        }
    };
    
    lineRuteSelatan();
    lineRuteUtara();
});