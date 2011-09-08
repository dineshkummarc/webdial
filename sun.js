function Sun() {
    var _DtoR = Math.PI / 180.0;
    function d_to_r(d) {
        return d * _DtoR;
    }

    function r_to_d(r) {
        return r / _DtoR;
    }

    function dms_to_d(deg, min, sec) {
        var result = Math.abs(deg) + Math.abs(min) / 60.0 + Math.abs(sec) /
            3600.0;
        if (deg < 0 || min < 0 || sec < 0) {
            result = -result;
        }
        return result;
    }

    function jd_to_jcent(jd) {
        return (jd - 2451545.0) / 36525.0;
    }

    function polynomial(terms, x) {
        var i = terms.length - 1;
        var result = terms[i];
        i--;
        while (i >= 0) {
            result = result * x + terms[i];
            i--;
        }
        return result;
    }

    var PI2 = Math.PI * 2.0;
    function modpi2(x) {
        var y = x % PI2;
        if (y < 0.0) {
            y += PI2;
        }
        return y;
    }

    /**
     * Convert ecliptic to equitorial coordinates. 
     *
     * [Meeus-1998: equations 13.3, 13.4]
     *
     * Parameters:
     *   longitude : ecliptic longitude in radians
     *   latitude : ecliptic latitude in radians
     *   obliquity : obliquity of the ecliptic in radians
     *
     * Returns:
     *   Right accension in radians
     *   Declination in radians
     */
    this.ecl_to_equ = function(lon, lat, obl) {
        var cose = Math.cos(obl);
        var sine = Math.sin(obl);
        var sinl = Math.sin(lon);
        var ra = modpi2(Math.atan2(sinl * cose - Math.tan(lat) * sine,
                                   Math.cos(lon)));
        var dec = Math.asin(Math.sin(lat) * cose + Math.cos(lat) * sine * sinl);
        return {"ra": ra, "dec": dec};
    };

    this.equ_to_geo = function(ra, dec, st) {
        var lon = r_to_d(ra - st);
        if (lon > 180.0) {
            lon -= 360.0;
        }
        return {longitude: lon, latitude: r_to_d(dec)};
    };

    this.sun_rst_altitude = -0.0145438286569;

    this.terminator = function(lat, lon, alt) {
        lat = lat / 180.0 * Math.PI;
        var obl = lat - Math.PI / 2;
        var points = [];
        var deg, H, equ, x, y, px, py;
        for (deg = 0; deg < 360; deg++) {
            H = deg * Math.PI / 180.0;
            equ = this.ecl_to_equ(H, alt, obl);
            x = Math.round(equ.ra * 180.0 / Math.PI + lon) % 360;
            y = Math.round((0.5 - equ.dec / Math.PI) * 180);
            points.push([x,y]);
            px = x;
            py = y;
        }
        return points
    };

    this.cal_to_jd = function(date) {
        var yr = date.getUTCFullYear();
        var mo = date.getUTCMonth() + 1; // WTF???
        var day = date.getUTCDate() + date.getUTCHours() / 24.0
            + date.getUTCMinutes() / 1440.0
            + date.getUTCSeconds() / 86400.0;
        if (mo <= 2) {
            yr -= 1;
            mo += 12;
        }
        var A = parseInt(yr / 100);
        var B = 2 - A + parseInt(A / 4)

        return parseInt(365.25 * (yr + 4716)) + parseInt(30.6001 * (mo + 1)) +
            day + B - 1524.5
    };

    this.sidereal_time_greenwich = function(jd) {
        var T = jd_to_jcent(jd);
        var T2 = T * T;
        var T3 = T2 * T;
        var theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0)  +
            0.000387933 * T2 - T3 / 38710000;
        return modpi2(d_to_r(theta0));
    };

    var _el0 = [d_to_r(dms_to_d(23, 26,  21.448)),
                d_to_r(dms_to_d( 0,  0, -46.8150)),
                d_to_r(dms_to_d( 0,  0,  -0.00059)),
                d_to_r(dms_to_d( 0,  0,   0.001813))];

    this.obliquity = function(jd) {
        return polynomial(_el0, jd_to_jcent(jd));
    }

    // Constant terms
    var _kL0 = [d_to_r(280.46646),  d_to_r(36000.76983),  d_to_r( 0.0003032)];
    var _kM  = [d_to_r(357.52911),  d_to_r(35999.05029),  d_to_r(-0.0001537)];
    var _kC  = [d_to_r( 1.914602),  d_to_r(  -0.004817),  d_to_r( -0.000014)];

    var _ck3 = d_to_r( 0.019993);
    var _ck4 = d_to_r(-0.000101);
    var _ck5 = d_to_r( 0.000289);

    /**
     * Return geometric longitude and radius vector.
     *
     * Low precision. The longitude is accurate to 0.01 degree.
     * The latitude should be presumed to be 0.0. [Meeus-1998: equations 25.2
     * through 25.5]
     *
     * Parameters:
     *   jd : Julian Day in dynamical time
     *
     * Returns:
     *   longitude in radians
     *   radius in au
     */
    this.longitude_radius_low = function(jd) {
        var T = jd_to_jcent(jd);
        var L0 = polynomial(_kL0, T);
        var M = polynomial(_kM, T);
        var e = polynomial((0.016708634, -0.000042037, -0.0000001267), T);
        var C = polynomial(_kC, T) * Math.sin(M)
            + (_ck3 - _ck4 * T) * Math.sin(2 * M)
            + _ck5 * Math.sin(3 * M);
        var L = modpi2(L0 + C);
        var v = M + C;
        var R = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(v));
        return {longitude: L, radius: R}
    };

    // Constant terms
    var _lk0 = d_to_r(125.04);
    var _lk1 = d_to_r(1934.136);
    var _lk2 = d_to_r(0.00569);
    var _lk3 = d_to_r(0.00478);

    /**
     * Correct the geometric longitude for nutation and aberration.
     *
     * Low precision. [Meeus-1998: pg 164]
     *
     * Parameters:
     *   jd : Julian Day in dynamical time
     *   L : longitude in radians
     *
     * Returns:
     *   corrected longitude in radians
     */
    this.apparent_longitude_low = function(jd, L) {
        var T = jd_to_jcent(jd);
        var omega = _lk0 - _lk1 * T;
        return modpi2(L - _lk2 - _lk3 * Math.sin(omega));
    };

    // Constant terms
    var _lk4 = d_to_r(dms_to_d(0, 0, 20.4898));

    /**
     * Correct for aberration; low precision, but good enough for most uses. 
     *
     * [Meeus-1998: pg 164]
     *
     * Parameters:
     *   R : radius in au
     *
     * Returns:
     *   correction in radians
     */
    this.aberration_low = function(R) {
        return -_lk4 / R
    };
};
