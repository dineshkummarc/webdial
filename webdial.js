function WebDial(canvas) {
    var continents;
    var sun = new Sun();

    function drawPoly(ctx, lon2x, lat2y, points) {
        ctx.beginPath();
        ctx.moveTo(lon2x(points[0][0]), lat2y(points[0][1]));
        var i;
        for (i = 1; i < points.length; i++ ) {
            ctx.lineTo(lon2x(points[i][0]), lat2y(points[i][1]));
        }
        ctx.closePath();
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

    function drawSun(ctx, x, y) {
        ctx.strokeStyle = "rgb(192, 192, 0)";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI*2, false);
        ctx.stroke();
    }

    function drawNight(ctx, lon2x, lat2y) {
        var jd = sun.cal_to_jd(new Date());
        var epsilon = sun.obliquity(jd);
        var geometric_lon = sun.longitude_radius_low(jd).longitude;
        var lon = sun.apparent_longitude_low(jd, geometric_lon);
        var equ = sun.ecl_to_equ(lon, 0.0, epsilon);
        var st = sun.sidereal_time_greenwich(jd);
        var geo = sun.equ_to_geo(equ.ra, equ.dec, st);
        drawSun(ctx, lon2x(geo.longitude), lat2y(geo.latitude));
        var points = sun.terminator(geo.latitude, geo.longitude,
                                    sun.sun_rst_altitude, w, h);
        console.debug(points);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        drawPoly(ctx, w, h, points);
    }

    function draw() {
        var w = canvas.width();
        var h = canvas.height();
        function lon2x(lon) {
            return (lon + 180.0) * w / 360.0;
        }

        function lat2y(lat) {
            return (90.0 - lat) * h / 180.0;
        }

        var ctx = canvas[0].getContext("2d");
        canvas[0].width = w;
        canvas[0].height = h;
        drawMap(ctx, lon2x, lat2y);
        drawNight(ctx, lon2x, lat2y);
    }

    function mapCallback(data) {
        continents = data;
        draw();
        $(window).resize(draw);
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