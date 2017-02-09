<?php $host = $_SERVER['HTTP_HOST']; ?>

<!DOCTYPE html>
<html lang="en">
	<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Replay</title>
        <!-- Slider -->
        <link rel="stylesheet" href="css/slider.less">
        <link rel="stylesheet" type="text/css" href="css/slider.css">

        <link rel="stylesheet" type="text/css" href="css/replay.css">
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
        <link type="text/css" href="css/jquery-ui-timepicker-addon.css" rel="stylesheet" />
        <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.0/themes/base/jquery-ui.css">
        <link rel="stylesheet" href="http://www.w3schools.com/lib/w3.css">
        <link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.0/mapsjs-ui.css" />
	</head>
    <body>
    <div class="wrap">
        <div id="load"></div>
        <div id="map"></div>
        <button type="button" class="btn btn-default btn-sm" id="layer-switcher">
          <span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> Switch Layer
        </button>

        <div id="panel-switcher" class="sidenav">
            <h4>Switch Layer</h4>
            <a href="javascript:void(0)" id="closeNav">&times;</a>
            <hr/>
            <ul style="list-style-type:none">
                <li id="set-map-type">
                    <label><h3>Map Type</h3></label>
                    <ul style="list-style-type:none">
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-1" value="osm">
                            <label class="w3-validate" for="radio-1">Open Street Map</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-2" value="googleTerrain">
                            <label class="w3-validate" for="radio-2">Google Terrain</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-3" value="googleMap">
                            <label class="w3-validate" for="radio-3">Google Street</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-4" value="googleHybrid">
                            <label class="w3-validate" for="radio-4">Google Hybrid</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-5" value="googleSatellite">
                            <label class="w3-validate" for="radio-5">Google Satellite</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-6" value="oviMapNormal">
                            <label class="w3-validate" for="radio-6">OVI Map</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-7" value="oviMapSatellite">
                            <label class="w3-validate" for="radio-7">OVI Satellite</label>
                        </li>
                        <li>
                            <input class="w3-radio" type="radio" name="radio-1" id="radio-8" value="oviMapTransit">
                            <label class="w3-validate" for="radio-8">OVI Transit</label>
                        </li>
                    </ul>
                </li>
                <hr/>
                <li id="set-overlay">
                    <label><h3>Overlay</h3></label>
                    <ul style="list-style-type:none">
                        <li >
                            <input class="w3-check" type="checkbox" id="checkbox-vehicle" value="vehicle" checked>
                            <label class="w3-validate" for="checkbox-vehicle">Vehicle</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="checkbox-label" value="vehicleLabels" checked>
                            <label class="w3-validate" for="checkbox-label">Label</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="checkbox-linetrac" value="lineTrac" checked>
                            <label class="w3-validate" for="checkbox-linetrac">Linetrac</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="checkbox-spoint" value="point" checked>
                            <label class="w3-validate" for="checkbox-spoint">Speed Point</label>
                        </li>
                    </ul>
                </li>
                <hr/>
                <li id="set-table-fields">
                    <label><h3>Table Fields</h3></label>
                    <ul style="list-style-type:none">
                        <li >
                            <input class="w3-check" type="checkbox" id="date-check" value=".tbl-date_time" checked>
                            <label class="w3-validate" for="date-check">Date and Time</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="deviceid-check" value=".tbl-device_id" checked>
                            <label class="w3-validate" for="deviceid-check">Device id</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="heading-check" value=".tbl-heading" checked>
                            <label class="w3-validate" for="heading-check">Heading</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="latitude-check" value=".tbl-latitude" checked>
                            <label class="w3-validate" for="latitude-check">Latitude</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="longitude-check" value=".tbl-longitude" checked>
                            <label class="w3-validate" for="longitude-check">Longitude</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="speed-check" value=".tbl-speed" checked>
                            <label class="w3-validate" for="speed-check">Kecepatan</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="device_name-check" value=".tbl-device_name" checked>
                            <label class="w3-validate" for="device_name-check">Nama Device</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="ignition-check" value=".tbl-ignition_status" checked>
                            <label class="w3-validate" for="ignition-check">Ignition Status</label>
                        </li>
                        <li >
                            <input class="w3-check" type="checkbox" id="roadname-check" value=".tbl-roadname" checked>
                            <label class="w3-validate" for="roadname-check">Nama Jalan</label>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <div id="panel-date-range" class="wrap">
            <div class="form-inline">
                <a class="btn btn-default" id="back-map" >
                    <span class="glyphicon glyphicon-arrow-left"></span>Back
                </a>
                <div class="form-group" style="width: ">
                    <label name="date" for="start">Start Date : </label>
                    <input id="start" class="form-control" name="date" type="text" placeholder="start date"></input>
                </div>
                <div class="form-group">
                    <label name="date" for="end">End Date : </label>
                    <input id="end" class="form-control" name="date" type="text" placeholder="end date"></input>
                </div>
                <button id="submit" class="btn btn-primary" href="#">Submit</button>
            </div>
        </div>

        <div id="replay-box-dialog" class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" id="closeModal">x</button>
                    <h4 class="modal-title" id="myModalLabel">Vehicle Name</h4>
                </div>
                <div class="modal-body">
                    <a class="btn btn-primary" id="view-replay">View Replay This Vehicle</a>
                </div>
            </div>
        </div>

        <div id="play-controller"></div>

        <div id="container-resize" class="resizable">
            <div id="btn-position-tbl">
                <span id="tbl-glyphicon" class="glyphicon glyphicon-menu-up"></span>
            </div>
            <div id="handle" class="ui-resizable-handle ui-resizable-n"></div>
            <div id="table-container" class="table-responsive"></div>
        </div>

    </div>
    <script type="text/javascript">
        var hostName = '//<?php echo $host; ?>';
    </script>

    <!-- Link for react -->
    <script src="https://unpkg.com/react@15.3.1/dist/react.js"></script>
    <script src="https://unpkg.com/react-dom@15.3.1/dist/react-dom.js"></script>
    <script src="https://unpkg.com/babel-core@5.8.38/browser.min.js"></script>
    <script src="https://unpkg.com/remarkable@1.6.2/dist/remarkable.min.js"></script>

    <script src="node_modules/localforage/dist/localforage.js"></script>
    <script src="//maps.googleapis.com/maps/api/js?v=3&amp;key=AIzaSyCtMUuGquVsrgThbe26Qaw3EUewrr7j5qY"></script>
    <script src="js/bluebird.min.js"></script>
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script src="OpenLayers/OpenLayers.2.13.2.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="//code.jquery.com/ui/1.12.0/jquery-ui.js"></script>
    <script type="text/javascript" src="js/replay.js"></script>
    <script src="js/replayReact.js"></script>
    <script src="js/bootstrap-slider.js"></script>
    <script type="text/javascript" src="js/jquery-ui-timepicker-addon.js"></script>
    <script src="js/lodash.js"></script>

    <!-- Responsive Table -->
    <script type="text/javascript" charset="UTF-8"
        src="https://js.api.here.com/v3/3.0/mapsjs-core.js"></script>
    <script type="text/javascript" charset="UTF-8"
        src="https://js.api.here.com/v3/3.0/mapsjs-service.js"></script>
    <script type="text/javascript" charset="UTF-8"
        src="https://js.api.here.com/v3/3.0/mapsjs-ui.js"></script>
    <script type="text/javascript" charset="UTF-8"
        src="https://js.api.here.com/v3/3.0/mapsjs-mapevents.js"></script>
    </body>
</html>