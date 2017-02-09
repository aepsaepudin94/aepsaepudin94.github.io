<?php

$shelter = array(
    'Danau_Monument'    => array('fixed' => 100, 'display' => 200),
    'Ecofunction'       => array('fixed' => 101, 'display' => 201),
    'Fantastic_Ecopark' => array('fixed' => 102, 'display' => 202),
    'Pantai_Carnaval'   => array('fixed' => 103, 'display' => 203),
    'Plaza_Timur'       => array('fixed' => 104, 'display' => 204),
    'Point_Utara'       => array('fixed' => 105, 'display' => 205),
    'Beach_Pool'        => array('fixed' => 106, 'display' => 206),
    'Busway'            => array('fixed' => 107, 'display' => 207),
    'Festival'          => array('fixed' => 108, 'display' => 208),
    'Gerbang_Timur'     => array('fixed' => 109, 'display' => 209),
    'Halilintar'        => array('fixed' => 110, 'display' => 210),
    'Marina'            => array('fixed' => 111, 'display' => 211),
    'Oceanic'           => array('fixed' => 112, 'display' => 212),
    'Outbound'          => array('fixed' => 113, 'display' => 213),
    'Pantai_Indah'      => array('fixed' => 114, 'display' => 214),
    'PGU_Barat'         => array('fixed' => 115, 'display' => 215),
    'Point_Pasar_Seni'  => array('fixed' => 116, 'display' => 216),
    'Sepatu_Roda'       => array('fixed' => 117, 'display' => 217),
    'Taman_Kelapa'      => array('fixed' => 118, 'display' => 218),
    'Trans_Bende'       => array('fixed' => 119, 'display' => 219),
    'Shelter_Gondola'   => array('fixed' => 120, 'display' => 220),
    'Spectra_Dufan'     => array('fixed' => 121, 'display' => 221),
);
$shelter_id = 200;

$host = $_SERVER['HTTP_HOST'];

if($host == 'gps.intellitrac.co.id')
{
    $host = 'hawk-dev.intellitrac.co.id';
}

if(isset($_GET['shelter']))
{
    $keys = array_keys($shelter);
    foreach ($keys as $k)
    {
        $val = strtolower($k);
        $q = str_replace(' ', '_', strtolower($_GET['shelter']));
        $pos = strpos($val, $q);
        if($pos !== FALSE)
        {
            $shelter_id = $shelter[$k]['display'];
            break;
        }
    }

    foreach ($shelter as $shel)
    {
        if($shel['display'] == $_GET['shelter'])
        {
            $shelter_id = $shel['display'];
            break;
        }
    }
}

if(isset($_GET['shelter_id'])) $shelter_id = $_GET['shelter_id'];

?>

<!DOCTYPE html>
<html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="apple-mobile-web-app-capable" content="yes">
        <title>Ancol Project</title>
        <!-- <link rel="stylesheet" href="http://dev.openlayers.org/theme/default/style.css" type="text/css"> -->
        <link rel="stylesheet" type="text/css" href="ancolMap.css">
    </head>
    <body>
        <div id="map"></div>
        <div class="VehicSchedule">
            <h3 id="vehicle-schedule"></h3>
            <div class="line-separator"></div>
            <h3 id="shelter-name"></h3>
        </div>
        <script type="text/javascript">
            /* jshint ignore:start */
            var shelter_id = <?php echo $shelter_id; ?>;
            var hostName = '//<?php echo $host; ?>';
            var devMode = <?php echo isset($_GET['dev']) ? 'true' : 'false'; ?>;
            /* jshint ignore:end */
        </script>
        <script src="//cdn.jsdelivr.net/bluebird/3.4.1/bluebird.min.js"></script>
        <!-- <script src="//maps.googleapis.com/maps/api/js?v=3.exp&amp;key=AIzaSyCtMUuGquVsrgThbe26Qaw3EUewrr7j5qY" async="" defer="defer" type="text/javascript"></script> -->
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js"></script>
        <script src="jquery.min.js"></script>
            <script src="http://gps.intellitrac.co.id/apis/openlayers/OpenLayers.js"></script>
        <!-- <script src="http://dev.openlayers.org/OpenLayers.js"></script> -->
        <script src="screenfull.js"></script>
        <script src="ancolMap.js"></script>
    </body>
</html>