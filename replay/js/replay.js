Promise.config({ cancellation :true });

document.onreadystatechange = function () {
    var state = document.readyState;
    if (state == 'complete') {
        document.getElementById('interactive');
        document.getElementById('load').style.visibility="hidden";
    }
}

$(document).ready(function () {
    var map, markerLayer, googleTerrain, googleMap, googleHybrid, googleSatellite, settingMap;
    var oviMapNormal, oviMapTransit, oviMapSatellite, lineHistoryLayer, vehicleRepLayer, vehicleRepObj;
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var deviceList, devices, devDataTable = [], vehicleLabelsLayer, lineLayer, dt = {}, labels = {},
        lineObj = {}, markerObj = {}, pointObj = {}, pointLayer, lineHistory = {}, deviceSelected, replayMode = false;

    var viewReplayConfig = [
        {layerName: 'point', show: false},
        {layerName: 'lineTrac', show: false},
        {layerName: 'vehicleLabels', show: false},
        {layerName: 'vehicle', show: false},
        {layerName: 'lineHistory', show: true},
        {layerName: 'googleSatellite', show: true},
        {layerName: 'googleTerrain', show: true},
        {layerName: 'osm', show: true},
        {layerName: 'googleHybrid', show: true},
        {layerName: 'googleMap', show: true},
        {layerName: 'oviMapNormal', show: true},
        {layerName: 'oviMapSatellite', show: true},
        {layerName: 'oviMapTransit', show: true},
    ];

    function saveSetMap(mapSet) {
        localforage.setItem('currentMap', mapSet).then(function (value) {
        }).catch(function(err) {
            console.log(err);
        });
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

    var styleLabel = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style ({
            externalGraphic: "${labelPath}",
            graphicWidth:    "${labelWidth}",
            graphicHeight:   "${labelHeight}",
            graphicXOffset:  "${labelXOffset}",
            graphicYOffset:  "${labelYOffset}"
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

    var stylePoint = new OpenLayers.StyleMap({
    'default' : new OpenLayers.Style({
        'fillColor':     "${fillColor}",
        'fillOpacity':   '2',
        'strokeColor':   "${strokeColor}",
        'strokeOpacity': '1',
        'strokeWidth':   '2',
        'pointRadius':   3
        })
    });

    var createLongLat = function(long, lat) {
        var longlat = new OpenLayers.LonLat(long, lat);
        var transformedLongLat = longlat.transform(epsg4326, epsg900913);
        return transformedLongLat;
    };

    function createGeometryPoint (lon, lat) {
        var pt = new OpenLayers.Geometry.Point(lon, lat);
        return pt.transform(epsg4326, epsg900913);
    }

    var createLineString = function (lon, lat, modeLinetrac) {
        var pointLine = [createGeometryPoint(lon, lat)];
        var lineString = new OpenLayers.Geometry.LineString(pointLine);
        var line;
        if (modeLinetrac) {
            line = new OpenLayers.Feature.Vector(lineString, {
                fillColor: '#4d94ff',
                fillOpacity: '#4d94ff'
            });
            lineLayer.addFeatures([line]);
        } else {
            line = new OpenLayers.Feature.Vector(lineString, {
                fillColor: '#00ff00',
                fillOpacity: '#00ff00'
            });
            lineHistoryLayer.addFeatures([line]);
        }
        return line;
    };

    function createVehicle(data, lon, lat, heading)  {
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
        var postData = {
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

    var drawPoint = function (lon, lat) {
        pointObj = createPoint({
            fillColor : '#ffff66',
            fillOpacity : 0.9,
            strokeColor : '#ffff66',
            strokeOpacity : 0.8
        }, lon, lat);
        pointLayer.addFeatures(pointObj);
    };

    function moveLabels(deviceid, lon, lat) {
        labels[deviceid].move(createLongLat(lon, lat));
    }

    function drawLine(obj, lon, lat, modeLinetrac) {
        var geoPoint = createGeometryPoint(lon, lat);
        obj.geometry.addPoint(geoPoint);
        if (modeLinetrac) {
            lineLayer.drawFeature(obj);
        } else {
            lineHistoryLayer.drawFeature(obj);
        }
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

    var init = function () {
        map = new OpenLayers.Map('map', { zoom: 16 });
        osm = new OpenLayers.Layer.OSM( "osm");

        googleTerrain = new OpenLayers.Layer.Google(
                "googleTerrain",
                {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 21}
        );
            
        googleMap = new OpenLayers.Layer.Google("googleMap",
            {type: google.maps.MapTypeId.ROADMAP, numZoomLevels: 21}
        );
        
        googleHybrid = new OpenLayers.Layer.Google(
            "googleHybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 21}
        );
        
        googleSatellite = new OpenLayers.Layer.Google(
            "googleSatellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 21}
        );       

        oviMapNormal = new OpenLayers.Layer.OSM(
            "oviMapNormal",
            [
                "https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/${z}/${x}/${y}/256/png8?app_id=um3lsxz1oZb4dAa801a4&app_code=oYDCZjDLMV6k7GT7AAa_jw",
            ], {
                numZoomLevels: 21,
                transitionEffect: 'resize'
            }
        );

        oviMapSatellite = new OpenLayers.Layer.OSM(
            "oviMapSatellite",
            [
                "https://1.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/hybrid.day/${z}/${x}/${y}/256/png8?app_id=um3lsxz1oZb4dAa801a4&app_code=oYDCZjDLMV6k7GT7AAa_jw",
            ], {
                numZoomLevels: 21,
                transitionEffect: 'resize'
            }
        );

        oviMapTransit = new OpenLayers.Layer.OSM(
            "oviMapTransit",
            [
                "https://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day.transit/${z}/${x}/${y}/256/png8?app_id=um3lsxz1oZb4dAa801a4&app_code=oYDCZjDLMV6k7GT7AAa_jw",
            ], {
                numZoomLevels: 21,
                transitionEffect: 'resize'
            }
        );

        markerLayer = new OpenLayers.Layer.Vector("vehicle", {
            styleMap: markerLayerStyle,
            visibility: true
        });

        vehicleRepLayer = new OpenLayers.Layer.Vector("vehicleRepLayer", {
            styleMap: markerLayerStyle
        });

        vehicleLabelsLayer = new OpenLayers.Layer.Vector("vehicleLabels", {
            styleMap: styleLabel
        });

        lineLayer = new OpenLayers.Layer.Vector("lineTrac", {
            styleMap: styleLine
        });

        lineHistoryLayer = new OpenLayers.Layer.Vector("lineHistory", {
            styleMap: styleLine
        });

        pointLayer = new OpenLayers.Layer.Vector("point", {
            styleMap: stylePoint
        });

        map.addLayer(googleSatellite);
        map.addLayer(googleTerrain);
        map.addLayer(osm);
        map.addLayer(googleHybrid);
        map.addLayer(googleMap);
        map.addLayer(oviMapNormal);
        map.addLayer(oviMapSatellite);
        map.addLayer(oviMapTransit);
        // map.addControl(new OpenLayers.Control.LayerSwitcher());

        map.setCenter(createLongLat(106.8047992,-6.1711877), 21, true);

        map.addLayer(markerLayer);
        map.addLayer(vehicleLabelsLayer);
        map.addLayer(lineLayer);
        map.addLayer(pointLayer);
        map.addLayer(lineHistoryLayer);
        map.addLayer(vehicleRepLayer);

        markerLayer.events.register("featureselected", markerLayer, selectedVehicle);

        var control = new OpenLayers.Control.SelectFeature(markerLayer);
        map.addControl(control);
        control.activate();
        var zoomControl = map.controls[1];
        map.removeControl(zoomControl);

        localforage.getItem('currentMap').then(function(value) {
            var element = $('#set-map-type').find('input');
            var indexElement;
            for (var i = 0; i < element.length; i++) {
                if (element[i].value == value) {
                    indexElement = i;
                }
            }
            if (!indexElement) {
                element[3].click(); // Google Hybrid Map
            } else {
                element[indexElement].click();
            }
        }).catch(function(err) {
            console.log(err);
        });
    };

    function setMap(layer) {
        return function() {
            map.setBaseLayer(layer);
        };
    }

    var postPromise = function (url, postData) {
        return new Promise(function (resolve, reject, onCancel) {
            var xhr;
            if(typeof postData === 'object' && postData) {
                xhr = $.post(url, postData, resolve);
            } else {
                xhr = $.post(url, resolve);
            }
            onCancel(function () {
                xhr.abort();
            });
        });
    };

    var hawkUrl = 'http://gps-track.intellitrac.co.id/index.php';
    var hawkPath = 'http://gps-track.intellitrac.co.id';
    var token;

    var registerRealtime = function (resp) {
        return postPromise(hawkUrl + '/api_users/login', {
            username: 'superfleet',
            password: '1mag1negps3083'
        }).then(function (resp) {
            token = resp.token;
            window.userToken = token;
            return postPromise(hawkUrl + '/api_devices/load_device/'+ token);
        }).then(function (resp) {
            deviceList = [];
            var devicesName = [];
            var data = resp.data;
            for (var i = 0; i < data.length; i++) {
                devices = data[i].devices;
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

    function getPosition(realtimeToken) {
        return postPromise(hawkUrl + '/api_positions/realtime/'+ token, {
            realtime_id: realtimeToken
        }).then(function(resp) {
            Devices = resp.data.data;
            for(var i in Devices) {
                if( ! Devices.hasOwnProperty(i) ) { continue; }
                var devicePos = Devices[i];
                if (devicePos.length >= 2) {
                    var lasPostData = devicePos[devicePos.length-1];
                    moveDevice(lasPostData);
                    updateTableData(lasPostData);
                } else if (devicePos.length == 1) {
                    moveDevice(devicePos[0]);
                    updateTableData(devicePos[0]);
                }
            }
            positionTable.setPositionData(devDataTable);
            selectRowTable();
        });
    }

    function updateTableData(position) {
        var deviceid = position.adevid;
        if (devDataTable.length == 0) {
            devDataTable.push(position);
        } else {
            var hasPush, index;
            for (var j = 0; j < devDataTable.length; j++) {
                if (devDataTable[j].adevid == deviceid) {
                    hasPush = true;
                    index = j;
                }
            }
            if (hasPush) {
                devDataTable[index] = position;
            } else {
                devDataTable.push(position);
            }
        }
    }

    function reloadPosition(realtimeToken) {
        return getPosition(realtimeToken).delay(5000).then(function () {
            return reloadPosition(realtimeToken);
        });
    }

    function moveDevice(position) {
        var lon = position.along;
        var lat = position.alat;
        var vehicleName = position.device_name;
        var deviceid = position.adevid;
        var head = position.ahead, speed = position.aspeed;

        if(typeof markerObj[deviceid] === 'object' && markerObj[deviceid]) {
            moveMarker(deviceid, lon, lat, head);
            moveLabels(deviceid, lon, lat);
        } else {
            markerObj[deviceid] = drawVehicle(lon, lat, head, true);
            drawVehicleLabel(vehicleName, lon, lat, function (label) {
                labels[deviceid] = label;
            });
        }

        if (typeof lineObj[deviceid] === 'object' && lineObj[deviceid]) {
            drawLine(lineObj[deviceid], lon, lat, true);
        } else {
            lineObj[deviceid] = createLineString(lon, lat, true);
        }
        if (speed <= 20 && speed > 0) { drawPoint(lon, lat); }
    }

    function moveMarker(deviceid, lon, lat, head) {
        markerObj[deviceid].move(createLongLat(lon, lat));
        markerObj[deviceid].attributes.iconAngle = head;
    }

    var drawVehicle = function(lon, lat, aHead, modeVehicleMap) {
        var marker;
        if (modeVehicleMap) {
            marker = createVehicle({
                iconLocation: 'img/car.png',
                width: 15,
                height: 32,
                xOffset: 15 / -2,
                yOffset: 32 / -2,
            }, lon, lat);
            markerLayer.addFeatures([marker]);
        } else {
            marker = createVehicle({
                iconLocation: 'img/vehicle-replay.png',
                width: 15,
                height: 32,
                xOffset: 15 / -2,
                yOffset: 32 / -2,
            }, lon, lat);
            vehicleRepLayer.addFeatures([marker]);
        }

        marker.attributes.iconAngle = aHead;
        return marker;
    };

    $('#btn-position-tbl').click(function () {
        var classGlyphicon = document.getElementById('tbl-glyphicon').className;
        if (classGlyphicon == 'glyphicon glyphicon-menu-up') {
            document.getElementById('tbl-glyphicon').className = "glyphicon glyphicon-menu-down";
            $("#container-resize").css({"height": "290px"});
        } else if (classGlyphicon == 'glyphicon glyphicon-menu-down') {
            document.getElementById('tbl-glyphicon').className = "glyphicon glyphicon-menu-up";
            $("#container-resize").css({"height": "100px"});
        }
    })

    function selectedVehicle (evt) {
        if (!replayMode) {
            var featureId = evt.feature.id;
            for(var i in markerObj) {
                if ( ! markerObj.hasOwnProperty(i) ) { continue; }
                if (featureId == markerObj[i].id) {
                    deviceSelected = i;
                }
            }
            $('#vehicle-table > thead').css("cursor", "pointer");
            $("#replay-box-dialog").slideDown(300);
        }
    }

    var positionTableElem = React.createElement(VehicleTable, { cols: tableConfig });

    var positionTable = ReactDOM.render(positionTableElem, document.getElementById('table-container'));

    init();

    window.positionReload = Promise.resolve();

    registerRealtime().then(function (resp) {
        var realtimeToken = resp.data.realtime_id;
        positionReload = reloadPosition(realtimeToken);
    });

    function selectRowTable() {
        $('#vehicle-table > thead').css("cursor", "pointer");
        $('.tbl-checkbox > input').css("cursor", "pointer");
        $('#vehicle-table > tbody').css("cursor", "default");
        var tbody = $('#vehicle-table > tbody')[0];
        tbody.onclick = function (e) {
            e = e || window.event;
            var lon, lat;
            var target = e.srcElement || e.target;
            if (target.type !== 'checkbox') {
                while (target && target.nodeName !== "TR") {
                    target = target.parentNode;
                }
                if (target) {
                    var cells = target.getElementsByTagName("td");
                    for (var i = 0; i < cells.length; i++) {
                        if (cells[i].className == 'tbl-latitude') {
                            lat = cells[i].innerText;
                        } else if (cells[i].className == 'tbl-longitude') {
                            lon = cells[i].innerText;
                        }
                    }
                }
                map.setCenter(createLongLat(lon,lat), 19, true);
            }
        }
    }

    $('#set-table-fields').find('input').click(function () {
       var checked = $(this).is(":checked");
       var selected_fields = $(this).val();

       if(checked) {
            $(selected_fields).show();
        } else {
            $(selected_fields).hide();
        }
    });

    var $panelDateRange = $('#panel-date-range');

    $("#view-replay").click(function(){
        replayMode = true;
        $("#replay-box-dialog").fadeOut("fast");
        $("#container-resize").fadeOut("fast");
        $panelDateRange.css({"top": '0px'});
        $("#panel-switcher").css({"left": '-250px'});
        $('#container-resize').css({"margin-left": '0px'});
        $("#play-controller").fadeIn("slow");
        compoPlayer = ReactDOM.render(React.createElement(ButtonController, null), document.getElementById('play-controller'));
        callSlider();
        for (var i = 0; i < viewReplayConfig.length; i++) {
            if (!viewReplayConfig[i].show) {
                showHideOverlay(viewReplayConfig[i].layerName, false);
            }
        }
    });

    function callSlider(valueMax, positionData) {
        valueMax = valueMax || 0;
        var $sliderComp = $('#slider');
        $sliderComp.slider({
            value: 0,
            min: 0,
            slide: function (event, ui) {
                var n = ui.value;
                var lon = positionData[n].along, lat = positionData[n].alat;
                map.setCenter(createLongLat(lon, lat), 21, true);
                vehicleRepObj.move(createLongLat(lon, lat));
                vehicleRepObj.attributes.iconAngle = positionData[n].ahead;
            }
        });
        $sliderComp.slider( "option", "max", valueMax );
    }

    $("#back-map").click(function(){
        replayMode = false;
        $panelDateRange.css({"top": '-80px'});
        $("#play-controller").fadeOut("slow");
        $("#container-resize").fadeIn("slow");
        if (lineHistory.attributes != null) {
            lineHistory.destroy();
            vehicleRepObj.destroy();
        }
        for (var i = 0; i < viewReplayConfig.length; i++) {
            if (!viewReplayConfig[i].show) {
                showHideOverlay(viewReplayConfig[i].layerName, true);
            }
        }
    });

    $("#closeModal").click(function(){
        $("#replay-box-dialog").fadeOut("fast");
    });

    $("#layer-switcher").click(function(){
        document.getElementById("panel-switcher").style.left = "0px";
        $('#container-resize').css({"margin-left": '249px'});
    });

    $("#closeNav").click(function () {
        document.getElementById("panel-switcher").style.left = "-250px";
        $('#container-resize').css({"margin-left": '0px'});
    });

    $('#set-map-type').find('input').click(function () {
        var value = $(this).val();
        var layers = map.layers;
        saveSetMap(value);
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].name == value) {
                setTimeout(setMap(layers[i]));
            }
        }
    });

    function showHideOverlay(overlay, typeShow) {
        var layerFeatures;
        var mapLayers = map.layers;
        for (var i = 0; i < mapLayers.length; i++) {
            if (mapLayers[i].name == overlay) {
                layerFeatures = mapLayers[i];
            }
        }

        var features = layerFeatures.features;
        if (typeShow) {
            for( var i = 0; i < features.length; i++ ) {
              features[i].style = null;
            }
            layerFeatures.visibility = true;
            layerFeatures.redraw();
        } else {
            for( var i = 0; i < features.length; i++ ) {
              features[i].style = { display: 'none' };
            }
            layerFeatures.redraw();
        }
    }

    $('#set-overlay').find('input').click(function () {
        var checked = $(this).is(':checked');
        var layerSelected = $(this).val();
        showHideOverlay(layerSelected, checked);
    })

    $(".resizable").resizable({
        handles: { 'n': '#handle' }
    });

    var $startDateTextBox = $('#start');
    var $endDateTextBox = $('#end');

    $.timepicker.datetimeRange(
        $startDateTextBox,
        $endDateTextBox,
        {
            minInterval: (1000*60*60), // 1hr
            dateFormat: 'yy-mm-dd', 
            timeFormat: 'HH:mm:ss',
            start: {}, // start picker options
            end: {} // end picker options                   
        }
    );

    $('#submit').click(function () {
        var startDate = $panelDateRange.find('#start').val(),
            endDate = $panelDateRange.find('#end').val();
        return postPromise(hawkUrl + '/api_positions/position/' + token, {
            devices: ['2000330001'],
            start: startDate,
            end: endDate
        }).then(function (resp) {
            var history = resp.data;
            if (lineHistory.attributes != null) {
                lineHistory.destroy();
            }
            if (history.length !== 0) {
                var len = history.total_matches;
                var lon = history[0].along, lat = history[0].alat;
                var positionData = [];
                lineHistory = createLineString(lon, lat, false);
                vehicleRepObj = drawVehicle(lon, lat, false)
                for(var i in history) {
                    if( ! history.hasOwnProperty(i) ) { continue; }
                    if (i < len) {
                        positionData.push(history[i]);
                        drawLine(lineHistory, history[i].along, history[i].alat, false);
                    }
                }
                callSlider(len-1, positionData);
            }
        })
    });
});