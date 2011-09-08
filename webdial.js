function WebDial(canvas) {
    var continents;
    var sun = new Sun();

    function drawPoly(ctx, w, h, points) {
        function lon2x(lon) {
            return (lon + 180.0) * w / 360.0;
        }

        function lat2y(lat) {
            return (90.0 - lat) * h / 180.0;
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
        var jd = sun.cal_to_jd(new Date());
        var epsilon = sun.obliquity(jd);
        var geometric_lon = sun.longitude_radius_low(jd).longitude;
        var lon = sun.apparent_longitude_low(jd, geometric_lon);
        var equ = sun.ecl_to_equ(lon, 0.0, epsilon);
        var st = sun.sidereal_time_greenwich(jd);
        var geo = sun.equ_to_geo(equ.ra, equ.dec, st);
        var points = sun.terminator(geo.latitude, geo.longitude,
                                    sun.sun_rst_altitude, w, h);
        console.debug(points);
        ctx.fillStyle = "rgb(0, 0, 0)";
        drawPoly(ctx, w, h, points);
    }

    function draw() {
        var ctx = canvas[0].getContext("2d");
        var w = window.innerWidth;
        var h = window.innerHeight;
        canvas[0].width = w;
        canvas[0].height = h;
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