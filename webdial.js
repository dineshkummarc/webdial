function WebDial(canvas) {
    var continents;
    var sun = new Sun();

    function drawPoly(ctx, w, h, points) {
        function lon2x(lon) {
            return Math.round((lon + 180.0) * w / 360.0);
        }

        function lat2y(lat) {
            return Math.round((90.0 - lat) * h / 180.0);
        }

        ctx.beginPath();
        var lastPoint = points[points.length-1];
        ctx.moveTo(lon2x(lastPoint[0]), lat2y(lastPoint[1]));
        $.each(points, function(j, point) {
            ctx.lineTo(lon2x(point[0]), lat2y(point[1]));
        });
        ctx.fill();
    }

    function drawMap(ctx, w, h) {
        ctx.fillStyle = "rgb(0, 192, 0)";
        $.each(continents, function(continent, polygons) {
            console.debug("Drawing", continent);
            $.each(polygons, function(i, points) {
                drawPoly(ctx, w, h, points);
            });
        });
    }

    function drawNight(ctx, w, h) {
        console.debug(1);
        ctx.fillStyle = "rgba(0, 0, 0, 128)";
        console.debug(sun);
        var jd = sun.cal_to_jd(new Date());
        console.debug(3);
        var epsilon = sun.obliquity(jd);
        console.debug(4);
        var geometric_lon = sun.longitude_radius_low(jd).longitude;
        console.debug(5);
        var lon = sun.apparent_longitude_low(jd, geometric_lon);
        console.debug(6);
        var equ = sun.ecl_to_equ(lon, 0.0, epsilon);
        console.debug(7);
        var st = sun.sidereal_time_greenwich(jd);
        console.debug(8);
        var geo = sun.equ_to_geo(ra, dec, st);
        console.debug(9);
        var points = sun.terminator(geo.latitude, geo.longitude,
                                    sun.sun_rst_altitude, w, h);
        console.debug(points);
        ctx.beginPath();
        drawPoly(ctx, w, h, points);
    }

    function draw() {
        var ctx = canvas[0].getContext("2d");
        var w = canvas[0].width;
        var h = canvas[0].height;
        drawMap(ctx, w, h);
        drawNight(ctx, w, h);
    }

    function mapCallback(data) {
        continents = data;
        draw();
    }

    function errCallback(xhr, status, error) {
        console.debug("error: ", xhr, status, error);
    }

    this.go = function() {
        $.ajax("continent.json",
               {dataType: "json",
                success: mapCallback,
                error: errCallback
               });
    }
}