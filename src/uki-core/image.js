include('uki.js');
include('dom.js');

uki.image = function(url, dataUrl, alpha) {
    var result = new Image();
    if (uki.image.dataUrlSupported && dataUrl) {
        result.src = dataUrl;
    } else {
        result.src = url;
        if (alpha && uki.image.needAlphaFix) {
            var dummy = uki.createElement('div', 'overflow:hidden;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + url + '",sizingMethod="scale")');
            uki.image.load([result], function() {
                dummy.style.width = result.width + 'px';
                dummy.style.height = result.height + 'px';
                dummy.width = result.width;
                dummy.height = result.height;
                if (dummy.onload) dummy.onload();
            });
            return dummy;
        }
    } 
    return result;
};

uki.imageSrc = function(url, dataUrl, alpha) {
    if (uki.image.dataUrlSupported && dataUrl) return dataUrl;
    if (alpha && uki.image.needAlphaFix) return alpha;
    return url;
};

uki.imageHTML = function(url, dataUrl, alpha, html) {
    if (uki.image.needAlphaFix && alpha) {
        url = alpha;
    } else if (uki.image.dataUrlSupported) {
        url = dataUrl;
    }
    return '<img' + (html || '') + ' src="' + url + '" />';
};

uki.image.load = function(images, callback) {
    var imagesToLoad = images.length;
    
    uki.each(images, function(i, img) {
        if (!img || img.width) {
            if (!--imagesToLoad) callback();
            return;
        }

        var handler = function() {
                img.onload = img.onerror = img.onabort = null; // prevent mem leaks
                if (!--imagesToLoad) callback();
            };
		img.onload  = handler;
		img.onerror = handler;
		img.onabort = handler;
    });
};

uki.image.dataUrlSupported = doc.createElement('canvas').toDataURL || (/MSIE (8)/).test(ua);
uki.image.needAlphaFix = /MSIE 6/.test(ua);
if(uki.image.needAlphaFix) doc.execCommand("BackgroundImageCache", false, true);
