include('uki.js');

var geometry = uki.geometry = {};

var Point = geometry.Point = function(x, y) {
    this.x = x || 0.0;
    this.y = y || 0.0;
};

Point[PROTOTYPE] = {
    toString: function() {
        return this.x + ' ' + this.y;
    },
    
    clone: function() {
        return new Point(this.x, this.y);
    },
    
    eq: function(point) {
        return this.x == point.x && this.y == point.y;
    },
    
    offset: function(x, y) {
        this.x += x;
        this.y += y;
        return this;
    },
    
    constructor: Point
};

Point.fromString = function(string, relative) {
    var parts = string.split(/\s+/);
    return new Point( unitsToPx(parts[0], relative && relative.width), unitsToPx(parts[1], relative && relative.height) );
};



var Size = geometry.Size = function(width, height) {
    this.width  = width ||  0.0;
    this.height = height || 0.0;
};

Size[PROTOTYPE] = {
    toString: function() {
        return this.width + ' ' + this.height;
    },
    
    clone: function() {
        return new Size(this.width, this.height);
    },
    
    eq: function(rect) {
        return this.width == rect.width && this.height == rect.height;
    },
    
    empty: function() {
        return this.width <= 0 || this.height <= 0;
    },
    
    constructor: Size
};

Size.fromString = function(string, relative) {
    var parts = string.split(/\s+/);
    return new Size( unitsToPx(parts[0], relative && relative.width), unitsToPx(parts[1], relative && relative.height) );
};

Size.create = function(a1, a2) {
    if (a1 === undefined) return null;
    if (a1.width !== undefined) return a1;
    if (/\S+\s+\S+/.test(a1 + '')) return Size.fromString(a1, a2);
    return new Size(a1, a2);
};



var Rect = geometry.Rect = function(a1, a2, a3, a4) {
    if (a3 !== undefined) {
        this.x      = a1;
        this.y      = a2;
        this.width  = a3;
        this.height = a4;
    } else if (a1 === undefined || a1.x === undefined) {
        this.x      = 0;
        this.y      = 0;
        this.width  = a1 || 0;
        this.height = a2 || 0;
    } else {
        this.x      = a1 ? a1.x      : 0;
        this.y      = a1 ? a1.y      : 0;
        this.width  = a2 ? a2.width  : 0;
        this.height = a2 ? a2.height : 0;
    }
};

Rect[PROTOTYPE] = {
    toString: function() {
        return [this.x, this.y, this.width, this.height].join(' ');
    },
    
    toCoordsString: function() {
        return [this.x, this.y, this.maxX(), this.maxY()].join(' ');
    },
    
    clone: function() {
        return new Rect(this.x, this.y, this.width, this.height);
    },
    
    minX: function(val) {
        if (typeof val != 'undefined') this.x = val;
        return this.x;
    },
    
    maxX: function() {
        return this.x + this.width;
    },
    
    midX: function() {
        return this.x + this.width / 2.0;
    },
    
    minY: function(val) {
        if (typeof val != 'undefined') this.y = val;
        return this.y;
    },
    
    midY: function() {
        return this.y + this.height / 2.0;
    },
    
    maxY: function() {
        return this.y + this.height;
    },
    
    normalize: function() {
        this.x = this.y = 0;
        return this;
    },
    
    empty: function() {
        return this.width <= 0.0 || this.height <= 0.0;
    },
    
    eq: function(rect) {
        return rect && this.x == rect.x && this.y == rect.y && this.height == rect.height && this.width == rect.width;
    },
    
    inset: function(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.width -= dx*2.0;
        this.height -= dy*2.0;
        return this;
    },
    
    offset: Point[PROTOTYPE].offset,
    
    intersection: function(rect) {
        var origin = new Point(
                MAX(this.x, rect.x),
                MAX(this.y, rect.y)
            ),
            size = new Size(
                MIN(this.maxX(), rect.maxX()) - origin.x,
                MIN(this.maxY(), rect.maxY()) - origin.y
            );
        return size.empty() ? new Rect() : new Rect(origin, size);
    },
    
    union: function(rect) {
        return Rect.fromCoords(
            MIN(this.x, rect.x),
            MIN(this.y, rect.y),
            MAX(this.maxX(), rect.maxX()),
            MAX(this.maxY(), rect.maxY())
        );
    },
    
    containsPoint: function(point) {
        return point.x >= this.minX() &&
               point.x <= this.maxX() &&
               point.y >= this.minY() &&
               point.y <= this.maxY();    
    },
    
    containsRect: function(rect) {
        return this.eq(this.union(rect));
    },
    
    constructor: Rect
};

Rect[PROTOTYPE].left = Rect[PROTOTYPE].minX;
Rect[PROTOTYPE].top  = Rect[PROTOTYPE].minY;

Rect.fromCoords = function(minX, minY, maxX, maxY) {
    if (maxX === undefined) {
        return new Rect(
            minX.x, 
            minX.y, 
            minY.x - minX.x, 
            minY.y - minX.y
        );
    }
    return new Rect(minX, minY, maxX - minX, maxY - minY);
};

Rect.fromCoordsString = function(string, relative) {
    var parts = string.split(/\s+/);
    return Rect.fromCoords( 
        unitsToPx(parts[0], relative && relative.width),
        unitsToPx(parts[1], relative && relative.height),
        unitsToPx(parts[2], relative && relative.width),
        unitsToPx(parts[3], relative && relative.height)
    ) ;
};

Rect.fromString = function(string, relative) {
    var parts = string.split(/\s+/);
    
    if (parts.length > 2) return new Rect( 
        unitsToPx(parts[0], relative && relative.width),
        unitsToPx(parts[1], relative && relative.height),
        unitsToPx(parts[2], relative && relative.width),
        unitsToPx(parts[3], relative && relative.height)
    );
    return new Rect( 
        unitsToPx(parts[0], relative && relative.width),
        unitsToPx(parts[1], relative && relative.height)
    ) ;
};

Rect.create = function(a1, a2, a3, a4) {
    if (a1 === undefined) return null;
    if (a1.x !== undefined) return a1;
    if (/\S+\s+\S+/.test(a1 + '')) return Rect.fromString(a1, a2);
    if (a3 === undefined) return new Rect(a1, a2);
    return new Rect(a1, a2, a3, a4);
};


var Inset = geometry.Inset = function(top, right, bottom, left) {
    this.top    = top   || 0;
    this.right  = right || 0;
    this.bottom = bottom === undefined ? this.top : bottom;
    this.left   = left === undefined ? this.right : left;
};

Inset[PROTOTYPE] = {
    toString: function() {
        return [this.top, this.right, this.bottom, this.left].join(' ');
    },
    
    clone: function() {
        return new Inset(this.top, this.right, this.bottom, this.left);
    },
    
    width: function() {
        return this.left + this.right;
    },
    
    height: function() {
        return this.top + this.bottom;
    },
    
    negative: function() {
        return this.top < 0 || this.left < 0 || this.right < 0 || this.bottom < 0;
    },
    
    empty: function() {
        return !this.top && !this.left && !this.right && !this.bottom;
    }
};

Inset.fromString = function(string, relative) {
    var parts = string.split(/\s+/);
    if (parts.length < 3) parts[2] = parts[0];
    if (parts.length < 4) parts[3] = parts[1];
    
    return new Inset(
        unitsToPx(parts[0], relative),
        unitsToPx(parts[1], relative),
        unitsToPx(parts[2], relative),
        unitsToPx(parts[3], relative)
    );
};

Inset.create = function(a1, a2, a3, a4) {
    if (a1 === undefined) return null;
    if (a1.top !== undefined) return a1;
    if (/\S+\s+\S+/.test(a1 + '')) return Inset.fromString(a1, a2);
    if (a3 === undefined) return new Inset(a1, a2);
    return new Inset(a1, a2, a3, a4);
};


function unitsToPx (units, relative) {
    var m = (units + '').match(/([-0-9\.]+)(\S*)/),
        v = parseFloat(m[1], 10),
        u = (m[2] || '').toLowerCase();
        
    if (u) {
        // if (u == 'px') v = v;
        if (u == '%' && relative) v *= relative / 100;
    }
    if (v < 0 && relative) v = relative + v;
    return v;
}

