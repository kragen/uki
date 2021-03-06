include('../background.js');
include('../image.js');

uki.background.Sliced9 = uki.newClass(new function() {
    var nativeCss = ['MozBorderImage', 'WebkitBorderImage', 'borderImage'],
        dom = uki.dom;
        
    var LEFT = 'left:',
        TOP  = 'top:',
        RIGHT = 'right:',
        BOTTOM = 'bottom:',
        WIDTH = 'width:',
        HEIGHT = 'height:',
        PX = 'px',
        P100 = '100%';
        
    var cache = {},
        proto = this;
    
    proto.init = function(partSettings, inset, options) {
        this._settings  = uki.extend({}, partSettings);
        this._inset     = Inset.create(inset);
        this._size      = null;
        this._inited    = false;
        
        options = options || {};
        this._fixedSize = Size.create(options.fixedSize) || new Size();
        this._bgInset   = Inset.create(options.inset)    || new Inset();
        this._zIndex    = options.zIndex || -1;

        this._container = this._getContainer();
        this._container.style.zIndex = this._zIndex;
    };
    
    function makeDiv (name, style, inner) {
        return '<div class="' +  name + '" style="position:absolute;overflow:hidden;' + style + '">' + inner + '</div>';
    }

    function img (setting, style) {
        return uki.imageHTML(setting[0], setting[1], setting[2], ' galleryimg="no" style="-webkit-user-drag:none;position:absolute;' + style + '"');
    }
    
    proto._getContainer = function() {
        var key = this._getKey();
        if (!cache[key]) {
            return cache[key] = this._createContainer();
        }
        return cache[key].cloneNode(true);
    };
    
    proto._createContainer = function() {
        var inset = this._inset,
            bgInset = this._bgInset,
            settings = this._settings,
            width = inset.left + inset.right,
            height = inset.top + inset.bottom,
            css = [LEFT + bgInset.left + PX, RIGHT + bgInset.right + PX, TOP + bgInset.top + PX, BOTTOM + bgInset.bottom + PX].join(';'),
            html = [];
            
        if (inset.top && inset.left) {
            html[html.length] = makeDiv('tl',
                [LEFT + 0, TOP + 0, WIDTH + inset.left + PX, HEIGHT + inset.top + PX].join(';'),
                (img(settings.c, [LEFT + 0, TOP + 0, WIDTH + width + PX, HEIGHT + height + PX].join(';')))
            );
        }
        if (inset.top) {
            html[html.length] = makeDiv('t',
                [LEFT + inset.left + PX, TOP + 0, HEIGHT + inset.top + PX, RIGHT + inset.right + PX].join(';'),
                img(settings.h, [LEFT + 0, TOP + 0, WIDTH + P100, HEIGHT + height + PX].join(';'))
            );
        }
        if (inset.top && inset.right) {
            html[html.length] = makeDiv('tr',
                [RIGHT + 0, TOP + 0, WIDTH + inset.right + PX, HEIGHT + inset.top + PX].join(';'),
                (img(settings.c, [LEFT + '-' + inset.left + PX, TOP + 0, WIDTH + width + PX, HEIGHT + height + PX].join(';')))
            );
        }
        
        if (inset.left) {
            html[html.length] = makeDiv('l',
                [LEFT + 0, TOP + inset.top + PX, WIDTH + inset.left + PX, BOTTOM + inset.bottom + PX].join(';'),
                img(settings.v, [LEFT + 0, TOP + 0, HEIGHT + P100, WIDTH + width + PX].join(';'))
            );
        }
        if (settings.m) {
            html[html.length] = makeDiv('m',
                [LEFT + inset.left + PX, TOP + inset.top + PX, RIGHT + inset.left + PX, BOTTOM + inset.bottom + PX].join(';'),
                img(settings.m, [LEFT + 0, TOP + 0, HEIGHT + P100, WIDTH + P100].join(';'))
            );
        }
        if (inset.right) {
            html[html.length] = makeDiv('r',
                [RIGHT + 0, TOP + inset.top + PX, WIDTH + inset.right + PX, BOTTOM + inset.bottom + PX].join(';'),
                img(settings.v, [LEFT + '-' + inset.left + PX, TOP + 0, HEIGHT + P100, WIDTH + width + PX].join(';'))
            );
        }
        
        if (inset.bottom && inset.left) {
            html[html.length] = makeDiv('bl',
                [LEFT + 0, BOTTOM + 0, WIDTH + inset.left + PX, HEIGHT + inset.bottom + PX].join(';'),
                (img(settings.c, [LEFT + 0, TOP + '-' + inset.top + PX, WIDTH + width + PX, HEIGHT + height + PX].join(';')))
            );
        }
        if (inset.bottom) {
            html[html.length] = makeDiv('b',
                [LEFT + inset.left + PX, BOTTOM + 0, HEIGHT + inset.bottom + PX, RIGHT + inset.right + PX].join(';'),
                img(settings.h, [LEFT + 0, TOP + '-' + inset.top + PX, WIDTH + P100, HEIGHT + height + PX].join(';'))
            );
        }
        if (inset.bottom && inset.right) {
            html[html.length] = makeDiv('br',
                [RIGHT + 0, BOTTOM + 0, WIDTH + inset.right + PX, HEIGHT + inset.bottom + PX].join(';'),
                (img(settings.c, [LEFT + '-' + inset.left + PX, TOP + '-' + inset.top + PX, WIDTH + width + PX, HEIGHT + height + PX].join(';')))
            );
        }
        return uki.createElement('div', 'position:absolute;overflow:hidden;' + css, html.join(''));
    };
    
    proto._getKey = function() {
        return uki.map(['v', 'h', 'm', 'c'], function(x) {
            return this._settings[x] && this._settings[x][0] || '';
        }, this).concat([this._inset, this._bgInset, this._fixedSize]).join(',');
    };
    
    proto.attachTo = function(comp) {
        this._comp = comp;
        
        this._comp.dom().appendChild(this._container);
        
        if (!uki.supportNativeLayout) {
            var _this = this;
            this._layoutHandler = function(e) {
                if (_this._size && _this._size.eq(e.rect)) return;
                _this._size = e.rect;
                _this.layout();
            };
            this._comp.bind('layout', this._layoutHandler);
            this.layout();
        }
    };
    
    proto.detach = function() {
        if (this._comp) {
            this._comp.dom().removeChild(this._container);
            if (!uki.supportNativeLayout) this._comp.unbind('layout', this._layoutHandler);
            this._size = this._comp = null;
            this._attached = this._inited = false;
        }
    };
    
    proto.layout = function() {
        var size = this._comp.rect(),
            parts = this._parts,
            inset = this._inset,
            bgInset = this._bgInset,
            fixedSize = this._fixedSize,
            width = FLOOR(fixedSize.width || size.width - bgInset.left - bgInset.right),
            height = FLOOR(fixedSize.height || size.height - bgInset.top - bgInset.bottom),
            insetWidth = inset.left + inset.right,
            insetHeight = inset.top + inset.bottom;
            
        if (!parts) {
            parts = {};
            uki.each(this._container.childNodes, function() {
                if (this.className) parts[this.className] = this;
            });
            this._parts = parts;
        }
        // parts.b.style.bottom = ''
        // parts.b.style.top = '100%';
        // parts.b.style.marginTop = - inset.bottom + 'px';
        if (parts.t) dom.layout(parts.t.style, { width: width - insetWidth });
        if (parts.b) dom.layout(parts.b.style, { width: width - insetWidth });
        if (parts.l) dom.layout(parts.l.style, { height: height - insetHeight });
        if (parts.r) dom.layout(parts.r.style, { height: height - insetHeight });
        if (parts.m) dom.layout(parts.m.style, {
            height: height - insetHeight,
            width: width - insetWidth
        });
        dom.layout(this._container.style, {
            width: width,
            height: height
        });
    };
});